<?php

namespace App\Http\Controllers\Api\Admin\Payment;

use App\Constants\BaseConstants;
use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Mail\PaymentSuccessMail;
use App\Models\Admin;
use App\Models\Payment;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
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

        $user = $request->user();
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

        $payUrl = $this->createVnpayPayment($payment);

        return response()->json([
            'payUrl'     => $payUrl,
            'order_code' => $payment->order_code,
        ]);
    }

    protected function createVnpayPayment(Payment $payment): string
    {
        $config    = config('services.vnpay');
        $vnpUrl    = $config['endpoint'];
        $vnpTmn    = $config['tmn_code'];
        $vnpHash   = $config['hash_secret'];
        $returnUrl = $config['return_url'];

        $vnpData = [
            'vnp_Version'    => '2.1.0',
            'vnp_Command'    => 'pay',
            'vnp_TmnCode'    => $vnpTmn,
            'vnp_Amount'     => $payment->amount * 100,
            'vnp_CurrCode'   => 'VND',
            'vnp_TxnRef'     => $payment->order_code,
            'vnp_OrderInfo'  => 'Thanh toan goi dich vu JobOnline',
            'vnp_OrderType'  => 'other',
            'vnp_Locale'     => 'vn',
            'vnp_ReturnUrl'  => $returnUrl,
            'vnp_IpAddr'     => request()->ip(),
            'vnp_CreateDate' => now()->format('YmdHis'),
        ];

        ksort($vnpData);

        $query    = '';
        $hashData = '';

        foreach ($vnpData as $key => $value) {
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
            if ($hashData !== '') {
                $hashData .= '&';
            }
            $hashData .= urlencode($key) . '=' . urlencode($value);
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnpHash);

        $payUrl = $vnpUrl . '?' . $query . 'vnp_SecureHash=' . $secureHash;
        Log::info('VNPAY CREATE', [
            'vnpData'    => $vnpData,
            'hashData'   => $hashData,
            'secureHash' => $secureHash,
            'payUrl'     => $payUrl,
        ]);
        return $payUrl;
    }
    public function vnpayReturn(Request $request)
    {
        $config = config('services.vnpay');
        Log::info('VNPAY RETURN RAW', $request->all());
        $vnpData       = $request->all();
        $vnpSecureHash = $vnpData['vnp_SecureHash'] ?? '';
        unset($vnpData['vnp_SecureHash'], $vnpData['vnp_SecureHashType']);
        ksort($vnpData);
        $hashData = '';
        foreach ($vnpData as $key => $value) {
            if ($hashData !== '') {
                $hashData .= '&';
            }
            $hashData .= urlencode($key) . '=' . urlencode($value);
        }

        $secureHash = hash_hmac('sha512', $hashData, $config['hash_secret']);
        Log::info('VNPAY RETURN VERIFY', [
            'vnpData'       => $vnpData,
            'hashData'      => $hashData,
            'ourSecureHash' => $secureHash,
            'vnpSecureHash' => $vnpSecureHash,
            'hash_match'    => hash_equals($secureHash, $vnpSecureHash),
            'response_code' => $vnpData['vnp_ResponseCode'] ?? null,
        ]);

        $orderCode = $vnpData['vnp_TxnRef'] ?? null;
        $payment = Payment::with(['user', 'promotion'])
            ->where('order_code', $orderCode)
            ->first();

        $success      = false;
        $earnedPoints = 0;

        if (
            $payment
            && hash_equals($secureHash, $vnpSecureHash)
            && ($vnpData['vnp_ResponseCode'] ?? null) == '00'
        ) {
            $alreadySuccess = $payment->status === 'success';

            $payment->status          = 'success';
            $payment->gateway_tran_id = $vnpData['vnp_TransactionNo'] ?? null;
            $payment->meta            = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();

            if (!$alreadySuccess) {
                $this->increaseUserPointFromPayment($payment);
            }
            if ($payment->promotion_id && $payment->promotion) {
                $earnedPoints = (int) $payment->promotion->points;
            } else {
                $earnedPoints = $payment ? $this->calculatePointsFromPayment($payment) : 0;

            }
            try {
                $admin = $payment->user;
                if ($admin && !empty($admin->email)) {
                    Mail::to($admin->email)->send(
                        new PaymentSuccessMail($payment, $admin, false)
                    );
                }
                $rootEmails = Admin::where('role_id', 1)
                    ->whereNotNull('email')
                    ->pluck('email')
                    ->all();

                if (empty($rootEmails) && config('mail.root_address')) {
                    $rootEmails = [config('mail.root_address')];
                }

                if (!empty($rootEmails)) {
                    Mail::to($rootEmails)->send(
                        new PaymentSuccessMail($payment, $admin, true)
                    );
                }
            } catch (\Throwable $e) {
                Log::error('SEND PAYMENT MAIL FAIL', [
                    'payment_id' => $payment->id,
                    'error'      => $e->getMessage(),
                ]);
            }
            $success = true;
        } elseif ($payment) {
            $payment->status = 'failed';
            $payment->meta   = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();
        }
        $frontendUrl = config('services.vnpay.frontend_url');
        $amount   = $payment?->amount;
        $isPromo  = $payment && $payment->promotion_id ? 1 : 0;
        $query = http_build_query([
            'status'   => $success ? 'success' : 'failed',
            'order'    => $orderCode,
            'amount'   => $amount,
            'points'   => $earnedPoints,
            'is_promo' => $isPromo,
        ]);

        return redirect()->away($frontendUrl . '?' . $query);
    }
    protected function calculatePointsFromPayment(Payment $payment): int
    {
        if ($payment->promotion_id && $payment->promotion) {
            return (int) $payment->promotion->points;
        }
        $rate = (int) BaseConstants::PAYMENT_POINT_RATE;
        if ($rate <= 0) {
            $rate = 1000;
        }
        return intdiv($payment->amount, $rate);
    }

    protected function increaseUserPointFromPayment(Payment $payment): void
    {
        $user = $payment->user ?? null;
        if (!$user) {
            return;
        }
        $points = $this->calculatePointsFromPayment($payment);
        if ($points <= 0) {
            return;
        }
        $user->points = ($user->points ?? 0) + $points;
        $user->save();
    }
}
