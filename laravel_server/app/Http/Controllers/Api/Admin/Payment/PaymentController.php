<?php

namespace App\Http\Controllers\Api\Admin\Payment;

use App\Constants\BaseConstants;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|integer|min:1000',
            'method' => 'nullable|in:vnpay',
        ]);

        $user = $request->user();
        $orderCode = 'JOB' . now()->format('YmdHis') . rand(100, 999);

        $payment = Payment::create([
            'user_id'    => $user->id,
            'order_code' => $orderCode,
            'amount'     => $data['amount'],
            'method'     => 'vnpay',
            'status'     => 'pending',
        ]);

        $payUrl = $this->createVnpayPayment($payment);

        return response()->json([
            'payUrl'     => $payUrl,
            'order_code' => $payment->order_code,
        ]);
    }

    protected function createVnpayPayment(Payment $payment): string
    {
        $config   = config('services.vnpay');
        $vnpUrl   = $config['endpoint'];
        $vnpTmn   = $config['tmn_code'];
        $vnpHash  = $config['hash_secret'];
        $returnUrl= $config['return_url'];

        $vnpData = [
            'vnp_Version'    => '2.1.0',
            'vnp_Command'    => 'pay',
            'vnp_TmnCode'    => $vnpTmn,
            'vnp_Amount'     => $payment->amount * 100,
            'vnp_CurrCode'   => 'VND',
            'vnp_TxnRef'     => $payment->order_code,
            'vnp_OrderInfo'  => 'Thanh toán gói dịch vụ JobOnline',
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

        return $payUrl;
    }
    public function vnpayReturn(Request $request)
    {
        $config = config('services.vnpay');

        $vnpData = $request->all();
        $vnpSecureHash = $vnpData['vnp_SecureHash'] ?? '';
        unset($vnpData['vnp_SecureHash'], $vnpData['vnp_SecureHashType']);

        ksort($vnpData);
        $hashData = [];
        foreach ($vnpData as $k => $v) {
            $hashData[] = $k . '=' . $v;
        }
        $hashDataStr = implode('&', $hashData);

        $secureHash = hash_hmac('sha512', $hashDataStr, $config['hash_secret']);

        $orderCode = $vnpData['vnp_TxnRef'] ?? null;
        $payment = Payment::where('order_code', $orderCode)->first();

        $success = false;

        if ($payment && $secureHash === $vnpSecureHash && ($vnpData['vnp_ResponseCode'] ?? null) == '00') {
            $alreadySuccess = $payment->status === 'success';

            $payment->status = 'success';
            $payment->gateway_tran_id = $vnpData['vnp_TransactionNo'] ?? null;
            $payment->meta = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();

            if (!$alreadySuccess) {
                $this->increaseUserPointFromPayment($payment);
            }

            $success = true;
        } elseif ($payment) {
            $payment->status = 'failed';
            $payment->meta = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();
        }

        $frontendUrl = config('services.vnpay.frontend_url');

        return redirect()->away(
            $frontendUrl . '?status=' . ($success ? 'success' : 'failed') . '&order=' . $orderCode
        );
    }
    protected function increaseUserPointFromPayment(Payment $payment): void
    {
        $user = $payment->user ?? null;
        if (!$user) {
            return;
        }

        $rate = (int) BaseConstants::PAYMENT_POINT_RATE;
        if ($rate <= 0) {
            $rate = 1000;
        }
        $points = intdiv($payment->amount, $rate);
        if ($points <= 0) {
            return;
        }

        $user->point = ($user->point ?? 0) + $points;
        $user->save();
    }

}
