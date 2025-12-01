<?php

namespace App\Http\Controllers\Api\Admin\Payment;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Payment\PaymentServices;
use App\Models\Payment;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentServices $paymentServices;

    public function __construct(PaymentServices $paymentServices)
    {
        $this->paymentServices = $paymentServices;
    }

    public function create(Request $request)
    {
        $data = $request->validate([
            'amount'       => 'nullable|integer|min:1000',
            'method'       => 'nullable|in:vnpay',
            'promotion_id' => 'nullable|integer|exists:promotions,id',
        ]);

        if (empty($data['amount']) && empty($data['promotion_id'])) {
            return response()->json([
                'status_code' => HttpStatus::BAD_REQUEST,
                'message'     => 'Vui lòng chọn gói thanh toán hoặc khuyến mãi',
            ], HttpStatus::BAD_REQUEST);
        }

        if (!empty($data['amount']) && !empty($data['promotion_id'])) {
            return response()->json([
                'status_code' => HttpStatus::BAD_REQUEST,
                'message'     => 'Không được truyền đồng thời amount và promotion_id',
            ], HttpStatus::BAD_REQUEST);
        }

        $user      = $request->user();
        $orderCode = 'JOB' . now()->format('YmdHis') . rand(100, 999);

        $promotionId = null;
        $amount      = $data['amount'] ?? null;

        if (!empty($data['promotion_id'])) {
            $promotion = Promotion::available()->find($data['promotion_id']);
            if (!$promotion) {
                return response()->json([
                    'status_code' => HttpStatus::BAD_REQUEST,
                    'message'     => 'Khuyến mãi không hợp lệ hoặc đã hết hạn',
                ], HttpStatus::BAD_REQUEST);
            }

            $promotionId = $promotion->id;
            $amount      = $promotion->price;
        }

        $payment = Payment::create([
            'user_id'      => $user->id,
            'order_code'   => $orderCode,
            'amount'       => $amount,
            'method'       => 'vnpay',
            'status'       => 'pending',
            'promotion_id' => $promotionId,
        ]);

        $payUrl = $this->paymentServices->createVnpayPayment($payment);

        return response()->json([
            'payUrl'     => $payUrl,
            'order_code' => $payment->order_code,
        ]);
    }

    public function vnpayReturn(Request $request)
    {
        $result = $this->paymentServices->handleVnpayReturn($request->all());

        $payment      = $result['payment'];
        $success      = $result['success'];
        $earnedPoints = $result['earned_points'];
        $orderCode    = $result['order_code'];

        $frontendUrl = config('services.vnpay.frontend_url');

        $amount  = $payment?->amount;
        $isPromo = $payment && $payment->promotion_id ? 1 : 0;

        $query = http_build_query([
            'status'   => $success ? 'success' : 'failed',
            'order'    => $orderCode,
            'amount'   => $amount,
            'points'   => $earnedPoints,
            'is_promo' => $isPromo,
        ]);

        return redirect()->away($frontendUrl . '?' . $query);
    }
}
