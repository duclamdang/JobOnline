<?php

namespace App\Traits;

trait ApiResponse
{
    public function success($data = [], int $statusCode = 200, $message = 'OK')
    {
        return response()->json([
            'status_code' => $statusCode,
            'sucsess' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public function error($message = 'Error', $statusCode = 400)
    {
        return response()->json([
            'status_code' => $statusCode,
            'sucsess' => false,
            'message' => $message,
        ], $statusCode);
    }

    protected function paginate($paginator, string $message = 'OK', int $statusCode = 200)
    {
        return $this->success(
            $paginator->items(),
            $message,
            $statusCode,
            [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ]
        );
    }
}
