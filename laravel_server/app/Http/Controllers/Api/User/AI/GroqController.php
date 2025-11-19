<?php

namespace App\Http\Controllers\Api\User\AI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
            [$context, $debug, $meta] = $this->resolveContext($intent);

            // Nếu không có KEY -> trả luôn context
            if ($noLlm) {
                return response()->json([
                    'text'     => $this->fallbackFromContext($context),
                    'metadata' => $meta,
                    'debug'    => $debug + ['llm' => 'disabled'],
                ], 200);
            }

            // System + CONTEXT
            $system =
                "Bạn là trợ lý tuyển dụng JobOnline. Trả lời TIẾNG VIỆT, ngắn gọn, chỉ dựa vào CONTEXT.\n" .
                "- Nếu CONTEXT rỗng: nói rõ 'không tìm thấy tin phù hợp' và gợi ý người dùng cung cấp thêm tiêu chí (vị trí, thành phố, mức lương...).\n" .
                "- Không tự bịa công ty/lương/vị trí nếu không có trong CONTEXT.\n" .
                "- Chỉ nhắc đến mã tin (#id) khi NGƯỜI DÙNG đã nhắc đến #id hoặc khi bạn đang nói về một tin cụ thể có trong CONTEXT.\n";

            if ($context) {
                $system .= "\n=== CONTEXT (từ CSDL) ===\n{$context}\n=== HẾT CONTEXT ===\n";
            }

            $final = [['role' => 'system', 'content' => $system]];
            foreach ($messages as $m) {
                if (isset($m['role'], $m['content'])) {
                    $final[] = $m;
                }
            }

            // Gọi Groq
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
                \Log::error('Groq error', [
                    'status' => $resp->status(),
                    'body'   => $resp->body(),
                    'intent' => $intent,
                ]);

                return response()->json([
                    'text'     => $this->fallbackFromContext($context),
                    'metadata' => $meta,
                    'debug'    => $debug + ['llm_error_status' => $resp->status()],
                ], 200);
            }

            $text = (string) data_get($resp->json(), 'choices.0.message.content', '');

            return response()->json([
                'text'     => $text ?: $this->fallbackFromContext($context),
                'metadata' => $meta,
                'debug'    => $debug,
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('chat-fatal', ['e' => $e->getMessage()]);

            return response()->json([
                'text'  => "Xin lỗi, có trục trặc tạm thời. Bạn thử lại sau nhé.",
                'debug' => ['fatal' => $e->getMessage()],
            ], 200); // không bao giờ trả 5xx
        }
    }

    /* =================== INTENT =================== */

    private function classify(string $text): ?array
    {
        try {
            $sys = "Bạn là bộ phân loại. Trả về JSON *hợp lệ* duy nhất theo schema:
{
  \"intent\": \"search_jobs\"|\"job_detail\"|\"chitchat\",
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

            return $json;
        } catch (\Throwable $e) {
            \Log::warning('classify-fallback', ['e' => $e->getMessage()]);
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
            if (preg_match('/(công ty|cty)\s+([a-zA-Z0-9\p{L}\s\.\-]+)/u', $text, $m)) {
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

    private function resolveContext(array $intent): array
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
                    $ctx = $this->formatJobDetail($job);
                }
                break;

            case 'search_jobs':
                $page               = max(1, (int) ($intent['page'] ?? 1));
                [$jobs, $total]     = $this->searchJobsFromNL($intent, $page, self::PAGE_SIZE);
                $ctx                = $this->formatJobList($jobs, $total, $page, self::PAGE_SIZE);
                $debug['page']      = $page;
                $debug['total']     = $total;
                $meta['page']       = $page;
                $meta['total']      = $total;
                $meta['pages']      = (int) ceil(max(1, $total) / self::PAGE_SIZE);
                break;

            default:
                $ctx = '';
        }

        return [$ctx, $debug, $meta];
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
        $q = DB::table('jobs')->where('is_active', 1);

        // keyword chung
        if ($kw = ($intent['query'] ?? null)) {
            $q->where(function ($w) use ($kw) {
                $w->where('title', 'like', '%' . $kw . '%')
                    ->orWhere('description', 'like', '%' . $kw . '%')
                    ->orWhere('company_name', 'like', '%' . $kw . '%');
            });
        }

        if ($comp = ($intent['company'] ?? null)) {
            $q->where('company_name', 'like', '%' . $comp . '%');
        }

        // location -> province_id
        if (Schema::hasColumn('jobs', 'province_id')) {
            if ($pid = $this->resolveProvinceId($intent['city'] ?? null)) {
                $q->where('province_id', $pid);
            }
        } elseif ($city = ($intent['city'] ?? null)) {
            if (Schema::hasColumn('jobs', 'location')) {
                $q->where('location', 'like', '%' . $city . '%');
            }
        }

        // work_field_id JSON/JSONB
        if (Schema::hasColumn('jobs', 'work_field_id')) {
            $fieldIds = [];

            // 1) Nếu LLM trả về danh sách fields (theo tên)
            if (!empty($intent['fields'] ?? null)) {
                $fieldIds = array_merge(
                    $fieldIds,
                    $this->resolveWorkFieldIdsFromTitles($intent['fields'])
                );
            }

            // 2) Fallback: đoán từ query text
            $fieldIds = array_merge(
                $fieldIds,
                $this->resolveWorkFieldIdsFromKeyword($intent['query'] ?? null)
            );

            $fieldIds = array_values(array_unique(array_map('intval', $fieldIds)));

            if (!empty($fieldIds)) {
                $arr = implode(',', $fieldIds); // "1,7"
                $q->whereRaw("
                    EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(CASE
                          WHEN jobs.work_field_id IS NULL THEN '[]'::jsonb
                          WHEN jsonb_typeof(jobs.work_field_id::jsonb) = 'array' THEN jobs.work_field_id::jsonb
                          ELSE '[]'::jsonb
                      END) AS e(val)
                      WHERE (e.val)::int = ANY (ARRAY[$arr])
                    )
                ");
            }
        }

        // remote/type
        if (!is_null($intent['remote'] ?? null) && Schema::hasColumn('jobs', 'is_remote')) {
            $q->where('is_remote', (bool) $intent['remote']);
        }

        if (!empty($intent['type']) && Schema::hasColumn('jobs', 'job_type')) {
            $q->where('job_type', $intent['type']);
        }

        // lương
        if (!is_null($intent['salaryMin'] ?? null) && Schema::hasColumn('jobs', 'salary_min')) {
            $min = (int) $intent['salaryMin'];
            $q->where(function ($w) use ($min) {
                $w->where('salary_min', '>=', $min)
                    ->orWhere('salary_max', '>=', $min);
            });
        }

        if (!is_null($intent['salaryMax'] ?? null) && Schema::hasColumn('jobs', 'salary_max')) {
            $max = (int) $intent['salaryMax'];
            $q->where('salary_max', '<=', $max);
        }

        // kinh nghiệm
        if (!is_null($intent['expMin'] ?? null) && Schema::hasColumn('jobs', 'years_experience_min')) {
            $q->where('years_experience_min', '>=', (int) $intent['expMin']);
        }

        if (!is_null($intent['expMax'] ?? null) && Schema::hasColumn('jobs', 'years_experience_max')) {
            $q->where('years_experience_max', '<=', (int) $intent['expMax']);
        }

        // đăng trong N ngày
        if (!is_null($intent['postedWithinDays'] ?? null) && Schema::hasColumn('jobs', 'created_at')) {
            $q->where('created_at', '>=', now()->subDays((int) $intent['postedWithinDays']));
        }

        $total = (clone $q)->count();

        $items = $q->orderByDesc('created_at')
            ->forPage(max(1, $page), max(1, $per))
            ->get([
                'id',
                'title',
                'company_name',
                'location',
                'salary_min',
                'salary_max',
                'deadline',
                'job_type',
                'is_remote',
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
            return "Không có kết quả.\nGợi ý: thử thay từ khoá, thêm thành phố, hoặc đặt khoảng lương/kinh nghiệm.\nVí dụ: \"dev Flutter ở HCM lương 15–25tr đăng 7 ngày\".\n";
        }

        $lines = [];
        foreach ($jobs as $j) {
            $lines[] = sprintf(
                "- #%d | %s — %s | %s | Lương: %s–%s | Hạn: %s | Loại: %s | %s",
                $j->id,
                $j->title,
                $j->company_name,
                $j->location,
                $this->money($j->salary_min),
                $this->money($j->salary_max),
                $j->deadline ? date('d/m/Y', strtotime($j->deadline)) : '-',
                $j->job_type ?? '-',
                ($j->is_remote ? 'Remote' : 'Onsite')
            );
        }

        $pages = (int) ceil(max(1, $total) / max(1, $per));

        return "Kết quả ($total) — trang $page/$pages (mỗi trang $per dòng):\n"
            . implode("\n", $lines)
            . "\n\nGợi ý: 'trang N' để chuyển trang • 'Ứng tuyển #ID' để nộp.";
    }

    private function formatJobDetail($j): string
    {
        return "CHI TIẾT TIN TUYỂN DỤNG #{$j->id}\n"
            . "Vị trí: {$j->title}\n"
            . "Công ty: {$j->company_name}\n"
            . "Địa điểm: {$j->location}\n"
            . "Lương: {$this->money($j->salary_min)}–{$this->money($j->salary_max)} VND/tháng\n"
            . "Hạn nộp: " . ($j->deadline ? date('d/m/Y', strtotime($j->deadline)) : '-') . "\n"
            . "Loại hình: " . ($j->job_type ?? '-') . "\n"
            . "Hình thức: " . (($j->is_remote ?? false) ? 'Remote' : 'Onsite') . "\n"
            . "Hướng dẫn: Nói 'Ứng tuyển #{$j->id}' để nộp.";
    }

    private function fallbackFromContext(string $ctx): string
    {
        return $ctx ?: "Xin lỗi, hiện chưa lấy được dữ liệu. Bạn có thể thử lại hoặc lọc tiêu chí khác.";
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
}
