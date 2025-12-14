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
                    "- Xem chi tiết tin.\n".
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
             * 1.5) Nếu đã có job_url (intent job_link) -> không gọi LLM, trả luôn
             */
            if (!empty($meta['job_url'] ?? null)) {
                return response()->json([
                    'text'     => '',
                    'metadata' => $meta,
                    'debug'    => $debug + [
                            'llm'      => $noLlm ? 'disabled' : 'enabled',
                            'shortcut' => 'job_link',
                        ],
                ], 200);
            }

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
                "- KHÔNG hiển thị URL.\n" .
                "- KHÔNG thêm nội dung dư thừa.\n";

            if ($context) {
                $system .= "\n=== CONTEXT (từ CSDL) ===\n{$context}\n=== HẾT CONTEXT ===\n";
            }

            $llmMessages = $this->sanitizeMessagesForLlm($messages);

            $final = [['role' => 'system', 'content' => $system]];
            foreach ($llmMessages as $m) {
                $final[] = $m;
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

        if (preg_match('/^(link|xem link|cho link|lấy link|link đâu|đưa link)/iu', trim($text2))) {
            return [
                'intent' => 'job_link',
                'page'   => 1,
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
            if (isset($json['fields']) && !is_array($json['fields'])) {
                $json['fields'] = [$json['fields']];
            }
            if (preg_match('/\blink\b|\bliên kết\b|\blink job\b/i', $text)) {
                return [
                    'intent' => 'job_link',
                    'page'   => 1,
                ];
            }
            if (($json['intent'] ?? '') === 'search_jobs') {
                $normText = $this->norm($text);
                $wordCount = str_word_count($normText);

                if (empty($json['query']) && $wordCount > 0 && $wordCount <= 3 && !preg_match('/\d/', $text)) {
                    // ví dụ: "Nhân sự", "Tester", "Kế toán"
                    $json['query'] = $normText;
                }
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
                $id  = (int) ($intent['id'] ?? 0);
                $job = $this->jobById($id);
                if ($job) {
                    $ctx                  = $this->formatJobDetail($job);
                    $meta['last_job_id']  = $job->id;
                }
                break;

            case 'search_jobs':
                $page = max(1, (int) ($intent['page'] ?? 1));
                [$jobs, $total] = $this->searchJobsFromNL($intent, $page, self::PAGE_SIZE);

                $ctx = $this->formatJobList($jobs, $total, $page, self::PAGE_SIZE);

                // --- CHỌN last_job_id THÔNG MINH HƠN ---
                if ($total > 0 && $jobs->isNotEmpty()) {
                    $chosen = $jobs->first();

                    if (!empty($intent['query'])) {
                        $kwNorm = $this->norm($intent['query']);

                        // Ưu tiên job có keyword xuất hiện trong TITLE
                        $candidate = $jobs->first(function ($j) use ($kwNorm) {
                            $titleNorm = $this->norm($j->title ?? '');
                            return \Illuminate\Support\Str::contains($titleNorm, $kwNorm);
                        });

                        if ($candidate) {
                            $chosen = $candidate;
                        }
                    }

                    $meta['last_job_id'] = $chosen->id;
                }

                $meta['total'] = $total;
                $meta['page']  = $page;
                $meta['pages'] = (int) ceil(max(1, $total) / self::PAGE_SIZE);
                break;

            case 'job_link':
                $lastId = $this->getLastJobIdFromMessages($messages);
                Log::info('job_link-debug', [
                    'messages' => $messages,
                    'last_id'  => $lastId,
                ]);
                if ($lastId) {
                    $job = $this->jobById($lastId);
                    if ($job) {
                        $meta['last_job_id'] = $job->id;
                        $meta['job_url']     = url("/job/{$job->id}");

                        // Không đưa gì vào context để tránh LLM bịa
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
            $m = $messages[$i];

            // 1) Ưu tiên metadata.last_job_id nếu FE gửi lên
            if (!empty($m['metadata']['last_job_id'] ?? null)) {
                return (int) $m['metadata']['last_job_id'];
            }

            // 2) Fallback: dò trong content xem có #ID không
            if (preg_match('/#(\d{1,10})/', $m['content'] ?? '', $mm)) {
                return (int) $mm[1];
            }
        }

        return null;
    }


    private function jobById(int $id)
    {
        return DB::table('jobs')
            ->where('jobs.is_active', 1)
            ->where('jobs.id', $id)
            ->where(function ($w) {
                $w->whereNull('jobs.end_date')
                    ->orWhere('jobs.end_date', '>=', now());
            })
            ->leftJoin('companies', 'companies.id', '=', 'jobs.company_id')
            ->leftJoin('provinces', 'provinces.id', '=', 'jobs.province_id')
            ->leftJoin('districts', 'districts.id', '=', 'jobs.district_id')
            ->leftJoin('working_forms', 'working_forms.id', '=', 'jobs.working_form_id')
            ->leftJoin('work_experiences', 'work_experiences.id', '=', 'jobs.work_experience_id')
            ->leftJoin('educations', 'educations.id', '=', 'jobs.education_id')
            ->leftJoin('positions', 'positions.id', '=', 'jobs.position_id')
            ->first([
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
            ->where(function ($w) {
                $w->whereNull('jobs.end_date')
                    ->orWhere('jobs.end_date', '>=', now());
            })
            ->leftJoin('companies', 'companies.id', '=', 'jobs.company_id')
            ->leftJoin('provinces', 'provinces.id', '=', 'jobs.province_id')
            ->leftJoin('districts', 'districts.id', '=', 'jobs.district_id')
            ->leftJoin('working_forms', 'working_forms.id', '=', 'jobs.working_form_id')
            ->leftJoin('work_experiences', 'work_experiences.id', '=', 'jobs.work_experience_id')
            ->leftJoin('educations', 'educations.id', '=', 'jobs.education_id')
            ->leftJoin('positions', 'positions.id', '=', 'jobs.position_id');

        /* ===================== KEYWORD ===================== */
        if (!empty($conditions['keyword'])) {
            $kw = trim((string) $conditions['keyword']);
            $pattern = "%{$kw}%";

            $q->where(function ($w) use ($pattern) {
                $w->whereRaw('unaccent(jobs.title) ILIKE unaccent(?)', [$pattern])
                    ->orWhereRaw('unaccent(jobs.description) ILIKE unaccent(?)', [$pattern])
                    ->orWhereRaw('unaccent(companies.name) ILIKE unaccent(?)', [$pattern]);
            });
        }

        /* =============== FILTER: TÊN CÔNG TY =============== */
        if ($comp = ($intent['company'] ?? null)) {
            $q->whereRaw('unaccent(companies.name) ILIKE unaccent(?)', ["%{$comp}%"]);
        }

        /* =============== FILTER: TỈNH/THÀNH =============== */
        if ($pid = $this->resolveProvinceId($intent['city'] ?? null)) {
            $q->where('jobs.province_id', $pid);
        }

        /* =============== FILTER: NGÀNH NGHỀ (JSONB) =============== */
//        if (Schema::hasColumn('jobs', 'work_field_id')) {
//            $fieldIds = [];
//
//            // map theo fields từ LLM
//            if (!empty($intent['fields'] ?? null)) {
//                $fieldIds = array_merge(
//                    $fieldIds,
//                    $this->resolveWorkFieldIdsFromTitles($intent['fields'])
//                );
//            }
//
//            // map theo keyword
//            $fieldIds = array_merge(
//                $fieldIds,
//                $this->resolveWorkFieldIdsFromKeyword($intent['query'] ?? null)
//            );
//
//            $fieldIds = array_values(array_unique(array_map('intval', $fieldIds)));
//
//            if (!empty($fieldIds)) {
//                $arr = implode(",", $fieldIds);
//
//                $q->whereRaw("
//                    EXISTS (
//                        SELECT 1
//                        FROM jsonb_array_elements_text(CASE
//                            WHEN jobs.work_field_id IS NULL THEN '[]'::jsonb
//                            ELSE jobs.work_field_id::jsonb
//                        END) AS e(val)
//                        WHERE (e.val)::int = ANY (ARRAY[$arr])
//                    )
//                ");
//            }
//        }

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
            $min = (int) $intent['salaryMin'];
            $q->where(function ($w) use ($min) {
                $w->where('jobs.salary_from', '>=', $min)
                    ->orWhere('jobs.salary_to', '>=', $min);
            });
        }

        if (!is_null($intent['salaryMax'] ?? null)) {
            $max = (int) $intent['salaryMax'];
            $q->where('jobs.salary_to', '<=', $max);
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
        if ($ctx === "NO_RESULT") {
            return "Hiện mình chưa tìm được tin tuyển dụng phù hợp để lấy thông tin/link.\n" .
                "Bạn thử mở chi tiết một tin (ví dụ: \"xem #123\") rồi nhắn lại \"cho link\" hoặc \"xem link\" nhé.";
        }

        return $ctx ?: "Xin lỗi, hiện chưa lấy được dữ liệu.";
    }
    private function fallbackChitchat(): string
    {
        return "Xin chào 👋 Mình là trợ lý JobOnline. Hiện tại mình chưa truy cập được mô hình AI để trò chuyện tự do, " .
            "nhưng mình vẫn có thể giúp bạn tìm tin tuyển dụng dựa trên các tiêu chí như vị trí, thành phố, mức lương.\n\n" .
            "Bạn thử gõ: \"tìm việc kế toán ở Bình Dương lương 10–15tr\" nhé.";
    }
    private function buildNoResultText(Request $req, array $intent, array $meta): string
    {
        $key = $this->shortMemoryKey($req);

        $state = Cache::get($key, [
            'last_intent'     => null,
            'last_query'      => null,
            'no_result_count' => 0,
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
        Cache::put($key, $state, now()->addMinutes(10));
        $count      = (int) $state['no_result_count'];
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
        return "Có vẻ hiện tại chưa có tin tuyển dụng phù hợp với {$queryLabel}.\n" .
            "Bạn có muốn:\n" .
            "- Đổi sang khu vực khác, hoặc\n" .
            "- Thử vị trí lân cận (vd: hành chính nhân sự, trợ lý...) không?\n\n" .
            "Bạn cứ mô tả lại, mình sẽ thử gợi ý hướng khác cho bạn.";
    }
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
    private function resolveProvinceId(?string $city): ?int
    {
        if (!$city) {
            return null;
        }
        $tRaw = $this->norm($city);
        $t    = $this->normProvince($tRaw);
        $rows = $this->dict('provinces', ['id', 'name']);
        foreach ($rows as $r) {
            $n = $this->normProvince($r->name);
            if ($t === $n || Str::contains($t, $n) || Str::contains($n, $t)) {
                return (int) $r->id;
            }
        }
        $aliasShort = [
            'hcm'      => 'ho chi minh',
            'sai gon'  => 'ho chi minh',
            'sg'       => 'ho chi minh',
            'ho chi minh' => 'ho chi minh',
            'ha noi'   => 'ha noi',
            'hn'       => 'ha noi',
            'da nang'  => 'da nang',
            'dn'       => 'da nang',
        ];
        foreach ($aliasShort as $key => $canonCore) {
            if (Str::contains($t, $key)) {
                $row = $rows->first(function ($r) use ($canonCore) {
                    $n = $this->normProvince($r->name);
                    return Str::contains($n, $canonCore);
                });
                if ($row) {
                    return (int) $row->id;
                }
            }
        }
        return null;
    }
    private function normProvince(string $s): string
    {
        $s = $this->norm($s);
        $prefixes = [
            'tinh ',
            'tỉnh ',
            'thanh pho ',
            'thành phố ',
            'tp. ',
            'tp ',
            'tp_',
            'tp-',
        ];
        foreach ($prefixes as $p) {
            if (Str::startsWith($s, $p)) {
                $s = Str::substr($s, strlen($p));
                break;
            }
        }
        $s = preg_replace('/\s+/', ' ', $s);
        return trim($s);
    }
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
            'thu ky'    => ['thư ký', 'thu ki', 'thu kí'],
        ];
        $rows = $this->dict('work_fields', ['id', 'title']);
        $hit = [];
        foreach ($rows as $r) {
            $n = $this->norm($r->title);
            if (Str::contains($n, $t) || Str::contains($t, $n)) {
                $hit[$r->id] = true;
            }
            foreach ($syn as $k => $alts) {
                $nk = $this->norm($k);
                if (Str::contains($t, $nk) && Str::contains($n, $nk)) {
                    $hit[$r->id] = true;
                }
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
    private function shortMemoryKey(Request $req): string
    {
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
    private function sanitizeMessagesForLlm(array $messages): array
    {
        $out = [];
        foreach ($messages as $m) {
            if (!isset($m['role'], $m['content'])) {
                continue;
            }
            $item = [
                'role'    => $m['role'],
                'content' => $m['content'],
            ];
            if (isset($m['name'])) {
                $item['name'] = $m['name'];
            }
            $out[] = $item;
        }
        return $out;
    }
}
