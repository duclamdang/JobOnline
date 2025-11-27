<?php

namespace App\Http\Services\Admin;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    protected string $projectId;
    protected string $credentialsPath;

    public function __construct()
    {
        $this->projectId      = config('firebase.project_id');
        $this->credentialsPath = config('firebase.credentials');
    }

    /**
     * Lấy access token từ service-account.json (scope Firebase Cloud Messaging)
     */
    protected function getAccessToken(): string
    {
        if (empty($this->credentialsPath) || !file_exists($this->credentialsPath)) {
            throw new \RuntimeException('Firebase credentials file not found: ' . $this->credentialsPath);
        }

        $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];

        $jsonKey = json_decode(file_get_contents($this->credentialsPath), true);

        $creds = new ServiceAccountCredentials($scopes, $jsonKey);
        $tokenArr = $creds->fetchAuthToken();

        if (!isset($tokenArr['access_token'])) {
            throw new \RuntimeException('Unable to fetch Google access token');
        }

        return $tokenArr['access_token'];
    }

    /**
     * Gửi 1 message tới 1 token
     */
    public function sendToToken(string $token, string $title, string $body, array $data = []): void
    {
        if (empty($token)) return;

        $accessToken = $this->getAccessToken();

        $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

        // FCM v1 payload
        $payload = [
            'message' => [
                'token' => $token,
                'notification' => [
                    'title' => $title,
                    'body'  => $body,
                ],
                // data phải là string -> string
                'data' => collect($data)
                    ->mapWithKeys(fn ($v, $k) => [$k => (string) $v])
                    ->all(),
            ],
        ];

        $response = Http::withToken($accessToken)
            ->post($url, $payload);

        if ($response->failed()) {
            Log::error('Send FCM v1 failed', [
                'token'    => $token,
                'payload'  => $payload,
                'response' => $response->body(),
            ]);
        }
    }

    /**
     * Gửi cho nhiều token (loop từng cái)
     * FCM v1 không còn field registration_ids như Legacy nữa
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        foreach ($tokens as $token) {
            $this->sendToToken($token, $title, $body, $data);
        }
    }
}
