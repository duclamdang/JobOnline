<?php

namespace App\Http\Controllers\Api\User\AI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GroqController extends Controller
{
    private const PAGE_SIZE = 10;
    private const MODEL = 'llama-3.3-70b-versatile';
    private const MAX_HISTORY_CHARS = 6000;

    public function chat(Request $req)
    {
        try {
            $messages = $this->truncateMessages(
                $req->input('messages', []),
                self::MAX_HISTORY_CHARS
            );
            $userText = $this->lastUser($messages);

            $noLlm = empty(env('GROQ_API_KEY'));

            /**
             * 1) Chào trước: nếu là câu chào hoặc chưa có message => trả lời chào luôn
             */
            if (empty($messages) || $this->isGreeting($userText)) {
                $greetText =
                    "Xin chào 👋 Mình là trợ lý tuyển dụng JobOnline.\n\n" .
                    "Bạn có thể nhờ mình:\n" .
                    "- Tìm việc theo vị trí, thành phố, mức lương (vd: \"dev Flutter ở HCM lương 15–25tr\").\n" .
                    "- Xem chi tiết tin: gửi mã tin, ví dụ: \"#123\" hoặc \"xem tin 123\".\n" .
                    "- Lọc theo loại hình (fulltime/parttime/intern), remote/onsite...\n\n" .
                    "Bạn đang muốn tìm công việc gì vậy?";

                return response()->json([
                    'text'     => $greetText,
                    'metadata' => [
                        'intent' => 'greeting',
                        'page'   => 1,
                        'total'  => 0,
                        'pages'  => 1,
                    ],
                    'debug'    => [
                        'greeting' => true,
                        'llm'      => $noLlm ? 'disabled' : 'enabled',
                    ],
                ], 200);
            }

            // #123 -> xem chi tiết
            if (preg_match('/(#|\bid\s*[:\-]?\s*)(\d{1,10})/iu', $userText, $m)) {
                $intent = [
                    'intent' => 'job_detail',
                    'id'     => (int) $m[2],
                    'page'   => 1,
                ];
            } else {
                $intent = $noLlm
                    ? $this->regexIntent($userText)
                    : ($this->classify($userText) ?? $this->regexIntent($userText));
            }

            // Lấy dữ liệu từ DB
            [$context, $debug, $meta] = $this->resolveContext($intent, $messages);

            /**
             * 2) Nếu không có KEY -> trả luôn, nhưng xử lý search_jobs thông minh hơn
             */
            if ($noLlm) {
                if (($intent['intent'] ?? '') === 'chitchat') {
                    $text = $this->fallbackChitchat();
                } elseif (($intent['intent'] ?? '') === 'search_jobs' && empty($context)) {
                    // search_jobs nhưng không có kết quả -> dùng short-term memory
                    $text = $this->buildNoResultText($req, $intent, $meta);
                } else {
                    $text = $this->fallbackFromContext($context);
                }

                return response()->json([
                    'text'     => $text,
                    'metadata' => $meta,
                    'debug'    => $debug + ['llm' => 'disabled'],
                ], 200);
            }

            // System + CONTEXT
            $system =
                "Bạn là trợ lý tuyển dụng JobOnline. Trả lời TIẾNG VIỆT, ngắn gọn, chỉ dựa vào CONTEXT.\n" .
                "- Nếu CONTEXT rỗng: nói rõ 'không tìm thấy tin phù hợp' và gợi ý người dùng cung cấp thêm tiêu chí.\n" .
                "- Không tự bịa công ty/lương/vị trí nếu không có trong CONTEXT.\n" .
                "- KHÔNG được hiển thị ID, KHÔNG được hiển thị mã tin (#...).\n" .
                "- Khi có metadata.job_url → KHÔNG được tạo nội dung.
                    Backend sẽ tự trả nội dung phù hợp..\n" .

                "  KHÔNG hiển thị URL.\n" .
                "  KHÔNG hiển thị ID.\n" .
                "  KHÔNG thêm nội dung dư thừa.\n";

            if ($context) {
                $system .= "\n=== CONTEXT (từ CSDL) ===\n{$context}\n=== HẾT CONTEXT ===\n";
            }

            $final = [['role' => 'system', 'content' => $system]];
            foreach ($messages as $m) {
                if (isset($m['role'], $m['content'])) {
                    $final[] = $m;
                }
            }

            $resp = Http::withToken(env('GROQ_API_KEY'))
                ->timeout(30)
                ->connectTimeout(10)
                ->retry(2, 200)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model'       => env('GROQ_MODEL', self::MODEL),
                    'messages'    => $final,
                    'temperature' => 0.2,
                ]);

            if ($resp->failed()) {
                Log::error('Groq error', [
                    'status' => $resp->status(),
                    'body'   => $resp->body(),
                    'intent' => $intent,
                ]);

                // LLM lỗi -> fallback
                if (($intent['intent'] ?? '') === 'chitchat') {
                    $fallbackText = $this->fallbackChitchat();
                } elseif (($intent['intent'] ?? '') === 'search_jobs' && empty($context)) {
                    $fallbackText = $this->buildNoResultText($req, $intent, $meta);
                } else {
                    $fallbackText = $this->fallbackFromContext($context);
                }

                return response()->json([
                    'text'     => $fallbackText,
                    'metadata' => $meta,
                    'debug'    => $debug + ['llm_error_status' => $resp->status()],
                ], 200);
            }

            $text = (string) data_get($resp->json(), 'choices.0.message.content', '');

            // Nếu LLM trả rỗng và đang search_jobs không có kết quả -> dùng no-result text thông minh
            if ($text === '' && ($intent['intent'] ?? '') === 'search_jobs' && empty($context)) {
                $text = $this->buildNoResultText($req, $intent, $meta);
            }

            return response()->json([
                'text'     => $text ?: $this->fallbackFromContext($context),
                'metadata' => $meta,
                'debug'    => $debug,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('chat-fatal', ['e' => $e->getMessage()]);

            return response()->json([
                'text'  => "Xin lỗi, có trục trặc tạm thời. Bạn thử lại sau nhé.",
                'debug' => ['fatal' => $e->getMessage()],
            ], 200); // không bao giờ trả 5xx
        }
    }

    /* =================== CLASSIFIER =================== */

    private function classify(string $text): ?array
    {
        $text2 = Str::lower($text);

// ƯU TIÊN: nếu user gõ "link", "xem link", "cho link"
        if (preg_match('/^(link|xem link|cho link|lấy link|link đâu|đưa link)/iu', trim($text2))) {
            return [
                'intent' => 'job_link',
                'page' => 1
            ];
        }

        try {
            $sys = "Bạn là bộ phân loại. Trả về JSON *hợp lệ* duy nhất theo schema:
{
  \"intent\": \"search_jobs\"|\"job_detail\"|\"chitchat\"|\"job_link\",
  \"query\":   string|null,
  \"city\":    string|null,
  \"company\": string|null,
  \"salaryMin\": number|null,
  \"salaryMax\": number|null,
  \"expMin\": number|null,
  \"expMax\": number|null,
  \"type\": \"fulltime\"|\"parttime\"|\"intern\"|\"contract\"|null,
  \"remote\": boolean|null,
  \"postedWithinDays\": number|null,
  \"page\": number|null,
  \"id\": number|null,
  \"fields\": string[]|null
}
Chỉ JSON, không thêm chữ nào khác.";

            $res = Http::withToken(env('GROQ_API_KEY'))
                ->timeout(15)
                ->connectTimeout(8)
                ->retry(1, 200)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model'    => env('GROQ_MODEL', self::MODEL),
                    'messages' => [
                        ['role' => 'system', 'content' => $sys],
                        ['role' => 'user', 'content' => $text],
                    ],
                    'temperature' => 0.0,
                ]);

            $raw  = (string) data_get($res->json(), 'choices.0.message.content', '{}');
            $raw  = $this->extractFirstJsonObject($raw);
            $json = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

            if (!is_array($json) || empty($json['intent'])) {
                return null;
            }

            $json['intent'] = Str::lower($json['intent']);
            $json['page']   = max(1, (int) ($json['page'] ?? 1));

            // đảm bảo fields là array|string|null
            if (isset($json['fields']) && !is_array($json['fields'])) {
                $json['fields'] = [$json['fields']];
            }
            if (preg_match('/\blink\b|\bliên kết\b|\blink job\b/i', $text)) {
                return [
                    'intent' => 'job_link',
                    'page'   => 1,
                ];
            }

            return $json;
        } catch (\Throwable $e) {
            Log::warning('classify-fallback', ['e' => $e->getMessage()]);
            return null;
        }
    }

    private function regexIntent(string $text): array
    {
        $t = Str::lower($text);

        // #id
        if (preg_match('/(#|\bid\s*[:\-]?\s*)(\d{1,10})/iu', $text, $m)) {
            return [
                'intent' => 'job_detail',
                'id'     => (int) $m[2],
                'page'   => 1,
            ];
        }
        // Link job
        if (preg_match('/(link|liên kết|đg link|cho xin link|link công việc|link job|xem link)/iu', $t)) {
            // lấy id cuối cùng user đang xem
            return [
                'intent' => 'job_link',
                'page'   => 1,
            ];
        }


        $searchKw = [
            'tìm', 'việc', 'job', 'tuyển', 'lập trình', 'kế toán', 'nhân viên',
            'dev', 'tester', 'data', 'marketing', 'designer', 'thiết kế',
        ];

        $has = collect($searchKw)->contains(fn($k) => Str::contains($t, $k));

        if ($has) {
            $city = collect([
                'đà nẵng', 'da nang',
                'hồ chí minh', 'ho chi minh', 'hcm',
                'hà nội', 'ha noi',
                'bình dương', 'binh duong',
                'cần thơ', 'can tho',
                'hải phòng', 'hai phong',
            ])->first(fn($c) => Str::contains($t, $c));

            $company = null;
            if (preg_match('/(công ty|cty)\s+([a-zA-Z0-9\p{L}\s.\-]+)/u', $text, $m)) {
                $company = trim($m[2]);
            }

            $kw = null;
            if (preg_match('/(java|python|php|react|flutter|kế toán|marketing|thiết kế|data|tester|thư ký|thu ki|thu ky)/iu', $text, $m2)) {
                $kw = $m2[1];
            }

            return [
                'intent'           => 'search_jobs',
                'query'            => $kw,
                'city'             => $city,
                'company'          => $company,
                'salaryMin'        => null,
                'salaryMax'        => null,
                'expMin'           => null,
                'expMax'           => null,
                'type'             => null,
                'remote'           => null,
                'postedWithinDays' => null,
                'page'             => 1,
                'id'               => null,
                'fields'           => null,
            ];
        }

        return ['intent' => 'chitchat', 'page' => 1];
    }

    /* ============== CONTEXT & DB SEARCH ============== */

    private function resolveContext(array $intent, array $messages = []): array
    {
        $debug = ['intent' => $intent];
        $ctx   = '';
        $meta  = [
            'intent' => $intent['intent'] ?? 'chitchat',
            'page'   => (int) ($intent['page'] ?? 1),
            'total'  => 0,
            'pages'  => 1,
        ];

        switch ($intent['intent'] ?? 'chitchat') {
            case 'job_detail':
                $id = (int) ($intent['id'] ?? 0);
                $job = $this->jobById($id);
                if ($job) {
                    $ctx = $this->formatJobDetail($job);
                    $meta['last_job_id'] = $job->id;
                }
                break;

            case 'search_jobs':
                $page = max(1, (int) ($intent['page'] ?? 1));
                [$jobs, $total] = $this->searchJobsFromNL($intent, $page, self::PAGE_SIZE);

                $ctx = $this->formatJobList($jobs, $total, $page, self::PAGE_SIZE);

                // lưu ID đầu tiên trong danh sách để dùng cho "link"
                if (!empty($jobs) && isset($jobs[0])) {
                    $meta['last_job_id'] = $jobs[0]->id;
                }

                $meta['total'] = $total;
                $meta['page'] = $page;
                $meta['pages'] = ceil(max(1, $total) / self::PAGE_SIZE);
                break;


            case 'job_link':
                $lastId = $this->getLastJobIdFromMessages($messages);
                if ($lastId) {
                    $job = $this->jobById($lastId);
                    if ($job) {
                        $url = url("/job/{$job->id}");
                        $meta['job_url'] = $url;

                        // ❌ Không đưa JOB_LINK vào context (LLM sẽ bịa)
                        // $ctx = "JOB_LINK";

                        // ✔ Để rỗng để LLM không sinh bậy
                        $ctx = "";

                    } else {
                        $ctx = "NO_RESULT";
                    }
                } else {
                    $ctx = "NO_RESULT";
                }
                break;

            default:
                $ctx = '';
        }

        return [$ctx, $debug, $meta];
    }
    private function getLastJobIdFromMessages($messages): ?int
    {
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (preg_match('/#(\d{1,10})/', $messages[$i]['content'] ?? '', $m)) {
                return (int)$m[1];
            }
        }
        return null;
    }
    private function formatJobLink($job)
    {
        return "Đây là liên kết của công việc #{$job->id}:\n"
            . url("/job/{$job->id}");
    }


    private function jobById(int $id)
    {
        return DB::table('jobs')
            ->where('is_active', 1)
            ->where('id', $id)
            ->first();
    }


    /**
     * Tìm trực tiếp trong DB (PostgreSQL)
     * - work_field_id: JSON/JSONB mảng ID -> match ANY
     * - province_id: nếu có; nếu không, fallback text "location"
     */
    private function searchJobsFromNL(array $intent, int $page = 1, int $per = 10): array
    {
        $q = DB::table('jobs')
            ->where('jobs.is_active', 1)
            ->leftJoin('companies', 'companies.id', '=', 'jobs.company_id')
            ->leftJoin('provinces', 'provinces.id', '=', 'jobs.province_id')
            ->leftJoin('districts', 'districts.id', '=', 'jobs.district_id')
            ->leftJoin('working_forms', 'working_forms.id', '=', 'jobs.working_form_id')
            ->leftJoin('work_experiences', 'work_experiences.id', '=', 'jobs.work_experience_id')
            ->leftJoin('educations', 'educations.id', '=', 'jobs.education_id')
            ->leftJoin('positions', 'positions.id', '=', 'jobs.position_id');

        /* ===================== KEYWORD ===================== */
        if ($kw = ($intent['query'] ?? null)) {
            $kw = trim($kw);
            $q->where(function ($w) use ($kw) {
                $w->where('jobs.title', 'ILIKE', "%{$kw}%")
                    ->orWhere('jobs.description', 'ILIKE', "%{$kw}%")
                    ->orWhere('companies.name', 'ILIKE', "%{$kw}%");
            });
        }

        /* =============== FILTER: TÊN CÔNG TY =============== */
        if ($comp = ($intent['company'] ?? null)) {
            $q->where('companies.name', 'ILIKE', "%{$comp}%");
        }

        /* =============== FILTER: TỈNH/THÀNH =============== */
        if ($pid = $this->resolveProvinceId($intent['city'] ?? null)) {
            $q->where('jobs.province_id', $pid);
        }

        /* =============== FILTER: NGÀNH NGHỀ (JSONB) =============== */
        if (Schema::hasColumn('jobs', 'work_field_id')) {
            $fieldIds = [];

            // map theo fields từ LLM
            if (!empty($intent['fields'] ?? null)) {
                $fieldIds = array_merge(
                    $fieldIds,
                    $this->resolveWorkFieldIdsFromTitles($intent['fields'])
                );
            }

            // map theo keyword
            $fieldIds = array_merge(
                $fieldIds,
                $this->resolveWorkFieldIdsFromKeyword($intent['query'] ?? null)
            );

            $fieldIds = array_values(array_unique(array_map('intval', $fieldIds)));

            if (!empty($fieldIds)) {
                $arr = implode(",", $fieldIds);

                $q->whereRaw("
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(CASE
                        WHEN jobs.work_field_id IS NULL THEN '[]'::jsonb
                        ELSE jobs.work_field_id::jsonb
                    END) AS e(val)
                    WHERE (e.val)::int = ANY (ARRAY[$arr])
                )
            ");
            }
        }

        /* =============== FILTER: FULLTIME / PARTTIME =============== */
        if (!empty($intent['type'])) {
            if ($intent['type'] === 'fulltime') {
                $q->where('jobs.is_fulltime', 1);
            } elseif ($intent['type'] === 'parttime') {
                $q->where('jobs.is_fulltime', 0);
            }
        }

        /* =============== FILTER: LƯƠNG =============== */
        if (!is_null($intent['salaryMin'] ?? null)) {
            $min = (int)$intent['salaryMin'];
            $q->where(function ($w) use ($min) {
                $w->where('jobs.salary_from', '>=', $min)
                    ->orWhere('jobs.salary_to', '>=', $min);
            });
        }

        if (!is_null($intent['salaryMax'] ?? null)) {
            $max = (int)$intent['salaryMax'];
            $q->where('jobs.salary_to', '<=', $max);
        }

        /* =============== FILTER: ĐĂNG TRONG N NGÀY =============== */
        if (!is_null($intent['postedWithinDays'] ?? null)) {
            $q->where('jobs.created_at', '>=', now()->subDays((int)$intent['postedWithinDays']));
        }

        /* =============== TOTAL =============== */
        $total = (clone $q)->count();

        /* =============== SELECT =============== */
        $items = $q->orderByDesc('jobs.created_at')
            ->forPage(max(1, $page), max(1, $per))
            ->get([
                'jobs.id',
                'jobs.title',
                'companies.name AS company_name',
                'provinces.name AS province_name',
                'districts.name AS district_name',
                'jobs.address',
                'jobs.salary_from',
                'jobs.salary_to',
                'jobs.salary_negotiable',
                'jobs.end_date',
                'working_forms.title AS working_form',
                'positions.title AS position_title',
                'work_experiences.title AS experience_title',
                'educations.title AS education_title',
            ]);

        return [$items, $total];
    }

    /* =================== FORMATTERS =================== */

    private function money($v): string
    {
        return $v ? number_format((int) $v, 0, ',', '.') : '-';
    }

    private function formatJobList($jobs, int $total, int $page, int $per): string
    {
        if ($jobs->isEmpty()) {
            return "Không tìm thấy tin phù hợp.\nBạn có thể thêm:\n- Thành phố (VD: HCM, Hà Nội...)\n- Mức lương mong muốn\n- Hình thức làm việc (fulltime/parttime)\n- Ngành nghề\nVí dụ: \"thu ký HCM lương 8–12tr\".\n";
        }

        $lines = [];
        foreach ($jobs as $j) {
            $salary = $j->salary_negotiable
                ? 'Thỏa thuận'
                : $this->money($j->salary_from) . '–' . $this->money($j->salary_to);

            $location = trim(($j->address ? $j->address . ', ' : '') .
                ($j->district_name ? $j->district_name . ', ' : '') .
                ($j->province_name ?? ''), ", ");

            $lines[] = sprintf(
                "- #%d | %s — %s | %s | Lương: %s | Hình thức: %s | Hạn: %s",
                $j->id,
                $j->title,
                $j->company_name ?? '-',
                $location ?: '-',
                $salary,
                $j->working_form ?? '-',
                $j->end_date ? date('d/m/Y', strtotime($j->end_date)) : '-'
            );
        }

        $pages = (int) ceil(max(1, $total) / max(1, $per));

        return "Kết quả ($total) — trang $page/$pages:\n"
            . implode("\n", $lines)
            . "\n\nGợi ý: • 'trang N' để chuyển trang • 'xem #ID' để xem chi tiết.";
    }

    private function formatJobDetail($j): string
    {
        $salary = $j->salary_negotiable
            ? 'Thỏa thuận'
            : $this->money($j->salary_from) . '–' . $this->money($j->salary_to);

        $location = trim(($j->address ? $j->address . ', ' : '') .
            ($j->district_name ? $j->district_name . ', ' : '') .
            ($j->province_name ?? ''), ", ");

        return "CHI TIẾT TIN TUYỂN DỤNG #{$j->id}\n"
            . "Vị trí: {$j->title}\n"
            . "Công ty: {$j->company_name}\n"
            . "Địa điểm: " . ($location ?: '-') . "\n"
            . "Lương: {$salary} VND/tháng\n"
            . "Hạn nộp: " . ($j->end_date ? date('d/m/Y', strtotime($j->end_date)) : '-') . "\n"
            . "Hình thức: " . ($j->working_form ?? '-') . "\n"
            . "Kinh nghiệm: " . ($j->experience_title ?? '-') . "\n"
            . "Trình độ: " . ($j->education_title ?? '-') . "\n"
            . "Chức danh: " . ($j->position_title ?? '-') . "\n"
            . "Hướng dẫn: Nói \"Ứng tuyển #{$j->id}\" để nộp hồ sơ.";
    }


    private function fallbackFromContext(string $ctx): string
    {
        // Nếu context báo link job
        if ($ctx === "JOB_LINK") {
            return "Bạn có thể xem chi tiết công việc tại đây: Link truy cập";
        }
        return $ctx ?: "Xin lỗi, hiện chưa lấy được dữ liệu.";
    }



    private function fallbackChitchat(): string
    {
        return "Xin chào 👋 Mình là trợ lý JobOnline. Hiện tại mình chưa truy cập được mô hình AI để trò chuyện tự do, " .
            "nhưng mình vẫn có thể giúp bạn tìm tin tuyển dụng dựa trên các tiêu chí như vị trí, thành phố, mức lương.\n\n" .
            "Bạn thử gõ: \"tìm việc kế toán ở Bình Dương lương 10–15tr\" nhé.";
    }

    /**
     * Text khi search_jobs không có kết quả, có nhớ ngắn hạn 3–5 lượt
     */
    private function buildNoResultText(Request $req, array $intent, array $meta): string
    {
        $key = $this->shortMemoryKey($req);

        $state = Cache::get($key, [
            'last_intent'       => null,
            'last_query'        => null,
            'no_result_count'   => 0,
        ]);

        $currentQuery = $intent['query'] ?? null;
        $sameQuery = $state['last_intent'] === 'search_jobs'
            && ($state['last_query'] ?? null) === $currentQuery;

        if ($sameQuery) {
            $state['no_result_count'] = (int) ($state['no_result_count'] ?? 0) + 1;
        } else {
            $state['no_result_count'] = 1;
            $state['last_intent']     = 'search_jobs';
            $state['last_query']      = $currentQuery;
        }

        // Lưu lại, sống 10 phút
        Cache::put($key, $state, now()->addMinutes(10));

        $count = (int) $state['no_result_count'];
        $queryLabel = $currentQuery ? "'" . $currentQuery . "'" : 'yêu cầu này';

        if ($count === 1) {
            return "Không tìm thấy tin phù hợp cho {$queryLabel}.\n" .
                "Bạn có thể nói rõ thêm:\n" .
                "- Thành phố (vd: HCM, Hà Nội, Đà Nẵng...)\n" .
                "- Mức lương mong muốn\n" .
                "- Loại hình (fulltime, parttime, intern...)\n\n" .
                "Bạn thử gửi lại kèm địa điểm và lương nhé.";
        } elseif ($count === 2) {
            return "Mình vẫn chưa thấy tin phù hợp cho {$queryLabel}.\n" .
                "Bạn đang muốn tìm việc ở khu vực nào (HCM, Hà Nội, Bình Dương, Đà Nẵng...)?\n" .
                "Bạn có thể trả lời kiểu: \"thu ký ở HCM lương 8–12tr\".";
        }

        // Từ lần 3 trở đi: đổi giọng, đừng hỏi đi hỏi lại
        return "Có vẻ hiện tại chưa có tin tuyển dụng phù hợp với {$queryLabel}.\n" .
            "Bạn có muốn:\n" .
            "- Đổi sang khu vực khác, hoặc\n" .
            "- Thử vị trí lân cận (vd: hành chính nhân sự, trợ lý...) không?\n\n" .
            "Bạn cứ mô tả lại, mình sẽ thử gợi ý hướng khác cho bạn.";
    }

    /* =================== RESOLVERS =================== */

    // chuẩn hoá: lower + ascii + trim
    private function norm(string $s): string
    {
        return trim(Str::lower(Str::ascii($s)));
    }

    private function dict(string $table, array $cols = ['id', 'name'])
    {
        $key = "dict:$table:" . implode(',', $cols);

        return Cache::remember($key, now()->addMinutes(10), function () use ($table, $cols) {
            return DB::table($table)->get($cols);
        });
    }

    // provinces: id, name
    private function resolveProvinceId(?string $city): ?int
    {
        if (!$city) {
            return null;
        }

        $t = $this->norm($city);

        $alias = [
            'thành phố hồ chí minh' => ['hcm', 'sai gon', 'sài gòn', 'ho chi minh'],
            'thành phố hà nội'      => ['hn', 'ha noi', 'hà nội'],
            'thành phố đà nẵng'     => ['da nang', 'đà nẵng', 'dn'],
            'tỉnh bình dương'       => ['binh duong', 'bình dương', 'bd'],
        ];

        $rows = $this->dict('provinces', ['id', 'name']); // chỉnh nếu bảng khác

        // So khớp gần đúng với name
        foreach ($rows as $r) {
            $n = $this->norm($r->name);
            if (Str::contains($t, $n) || Str::contains($n, $t)) {
                return (int) $r->id;
            }
        }

        // So khớp alias
        foreach ($alias as $canon => $alts) {
            $canonN = $this->norm($canon);

            if (Str::contains($t, $canonN)) {
                $row = $rows->first(fn($r) => $this->norm($r->name) === $canonN);
                if ($row) {
                    return (int) $row->id;
                }
            }

            foreach ($alts as $a) {
                if (Str::contains($t, $this->norm($a))) {
                    $parts  = explode(' ', $canonN);
                    $needle = $parts[1] ?? $canonN;

                    $row = $rows->first(function ($r) use ($needle) {
                        return Str::contains($this->norm($r->name), $needle);
                    });

                    if ($row) {
                        return (int) $row->id;
                    }
                }
            }
        }

        return null;
    }

    /**
     * work_field_id: IDs theo keyword/synonyms (bảng work_fields)
     * Giả định bảng work_fields có cột: id, title
     */
    private function resolveWorkFieldIdsFromKeyword(?string $kw): array
    {
        if (!$kw) {
            return [];
        }

        $t = $this->norm($kw);

        $syn = [
            'php'       => ['laravel', 'backend php'],
            'java'      => ['spring'],
            'python'    => ['django', 'flask'],
            'react'     => ['reactjs', 'frontend'],
            'flutter'   => ['dart', 'mobile'],
            'kế toán'   => ['accounting', 'ketoan'],
            'tester'    => ['qa', 'kiem thu', 'kiểm thử'],
            'data'      => ['du lieu', 'analyst', 'dữ liệu'],
            'marketing' => ['tiep thi', 'tiếp thị'],
            'designer'  => ['thiet ke', 'ui', 'ux', 'thiết kế'],
            // nhóm mới cho THƯ KÝ
            'thu ky'    => ['thư ký', 'thu ki', 'thu kí'],
        ];

        $rows = $this->dict('work_fields', ['id', 'title']);

        $hit = [];

        foreach ($rows as $r) {
            $n = $this->norm($r->title);

            // 1) tên field chứa keyword hoặc ngược lại
            if (Str::contains($n, $t) || Str::contains($t, $n)) {
                $hit[$r->id] = true;
            }

            // 2) map theo synonyms
            foreach ($syn as $k => $alts) {
                $nk = $this->norm($k);

                // User gõ đúng key (vd 'kế toán', 'thu ky')
                if (Str::contains($t, $nk) && Str::contains($n, $nk)) {
                    $hit[$r->id] = true;
                }

                // User gõ 1 trong các alias (vd 'thu ki')
                foreach ($alts as $a) {
                    $na = $this->norm($a);
                    if (Str::contains($t, $na) && Str::contains($n, $nk)) {
                        $hit[$r->id] = true;
                    }
                }
            }
        }

        return array_map('intval', array_keys($hit));
    }

    /**
     * Nếu LLM trả về fields = ["Hành chính - Thư ký", "Kế toán - Kiểm toán"]
     * -> map từ title sang id
     */
    private function resolveWorkFieldIdsFromTitles(?array $titles): array
    {
        if (empty($titles)) {
            return [];
        }

        $rows = $this->dict('work_fields', ['id', 'title']);
        $hit  = [];

        foreach ($titles as $t) {
            $nt = $this->norm($t);

            foreach ($rows as $r) {
                $n = $this->norm($r->title);
                if (Str::contains($n, $nt) || Str::contains($nt, $n)) {
                    $hit[$r->id] = true;
                }
            }
        }

        return array_map('intval', array_keys($hit));
    }

    /* =================== MISC =================== */

    private function lastUser(array $messages): string
    {
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (($messages[$i]['role'] ?? '') === 'user') {
                return (string) ($messages[$i]['content'] ?? '');
            }
        }

        return '';
    }

    private function truncateMessages(array $messages, int $maxChars = 6000): array
    {
        $total = 0;
        $out   = [];

        for ($i = count($messages) - 1; $i >= 0; $i--) {
            $chunk = (string) ($messages[$i]['content'] ?? '');
            $len   = mb_strlen($chunk);

            if ($total + $len > $maxChars && !empty($out)) {
                break;
            }

            $total += $len;
            array_unshift($out, $messages[$i]);
        }

        return $out ?: $messages;
    }

    private function extractFirstJsonObject(string $raw): string
    {
        $s = strpos($raw, '{');
        $e = strrpos($raw, '}');

        return ($s !== false && $e !== false && $e >= $s)
            ? substr($raw, $s, $e - $s + 1)
            : '{}';
    }

    /**
     * Nhận diện câu chào đơn giản: hi, hello, xin chào, chào bạn,...
     */
    private function isGreeting(string $text): bool
    {
        $t = Str::lower(trim($text));
        if ($t === '') {
            return false;
        }

        $greetings = [
            'hi',
            'hello',
            'helo',
            'xin chào',
            'xin chao',
            'chào',
            'chao',
            'chào bạn',
            'chao ban',
            'hey',
            'alo',
        ];

        foreach ($greetings as $g) {
            if ($t === $g || Str::startsWith($t, $g)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Key cho short-term memory: ưu tiên user id, fallback IP
     */
    private function shortMemoryKey(Request $req): string
    {
        // Nếu có guard 'user' thì dùng, không thì dùng default
        $user = null;

        try {
            $user = auth('user')->user();
        } catch (\Throwable $e) {
            $user = auth()->user();
        }

        if ($user && isset($user->id)) {
            return 'ai:short:u:' . $user->id;
        }

        return 'ai:short:ip:' . $req->ip();
    }

}

