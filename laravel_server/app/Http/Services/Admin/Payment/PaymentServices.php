<?php

namespace App\Http\Services\Admin\Payment;

use App\Constants\BaseConstants;
use App\Mail\PaymentSuccessMail;
use App\Models\Admin;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentServices
{
    public function createVnpayPayment(Payment $payment): string
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
    public function handleVnpayReturn(array $requestData): array
    {
        $config = config('services.vnpay');

        Log::info('VNPAY RETURN RAW', $requestData);

        $vnpData       = $requestData;
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
            $payment->meta            = array_merge($payment->meta ?? [], ['vnp_return' => $requestData]);
            $payment->save();

            if (!$alreadySuccess) {
                $this->increaseUserPointFromPayment($payment);
            }

            if ($payment->promotion_id && $payment->promotion) {
                $earnedPoints = (int) $payment->promotion->points;
            } else {
                $earnedPoints = $this->calculatePointsFromPayment($payment);
            }

            // Gửi mail
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
            $payment->meta   = array_merge($payment->meta ?? [], ['vnp_return' => $requestData]);
            $payment->save();
        }

        return [
            'success'       => $success,
            'payment'       => $payment,
            'earned_points' => $earnedPoints,
            'order_code'    => $orderCode,
        ];
    }

    /**
     * Quy đổi tiền sang điểm
     */
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

    /**
     * Cộng điểm cho user từ payment
     */
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
