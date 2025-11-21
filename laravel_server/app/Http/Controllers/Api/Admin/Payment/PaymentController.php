<?php

namespace App\Http\Controllers\Api\Admin\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|integer|min:1000',
            'method' => 'required|in:momo,vnpay',
        ]);

        $user = $request->user(); // admin/employer hiện tại
        $orderCode = 'JOB' . now()->format('YmdHis') . rand(100, 999);

        $payment = Payment::create([
            'user_id'   => $user->id,
            'order_code'=> $orderCode,
            'amount'    => $data['amount'],
            'method'    => $data['method'],
            'status'    => 'pending',
        ]);

        if ($data['method'] === 'momo') {
            $payUrl = $this->createMomoPayment($payment);
        } else {
            $payUrl = $this->createVnpayPayment($payment);
        }

        return response()->json([
            'payUrl' => $payUrl,
            'order_code' => $payment->order_code,
        ]);
    }

    protected function createMomoPayment(Payment $payment): string
    {
        $config = config('services.momo');

        $endpoint   = $config['endpoint'];
        $partnerCode= $config['partner_code'];
        $accessKey  = $config['access_key'];
        $secretKey  = $config['secret_key'];

        $orderId    = $payment->order_code;
        $requestId  = (string) Str::uuid();
        $amount     = $payment->amount;
        $orderInfo  = 'Thanh toán gói dịch vụ JobOnline';
        $returnUrl  = $config['return_url'];
        $ipnUrl     = $config['ipn_url'];
        $extraData  = '';

        $rawHash = "accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$returnUrl&requestId=$requestId&requestType=captureWallet";

        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        $body = [
            'partnerCode' => $partnerCode,
            'partnerName' => 'JobOnline',
            'storeId'     => 'JobOnline',
            'requestId'   => $requestId,
            'amount'      => $amount,
            'orderId'     => $orderId,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $returnUrl,
            'ipnUrl'      => $ipnUrl,
            'lang'        => 'vi',
            'extraData'   => $extraData,
            'requestType' => 'captureWallet',
            'signature'   => $signature,
        ];

        $res = Http::post($endpoint, $body)->json();

        $payment->meta = $res;
        $payment->save();

        return $res['payUrl'] ?? $res['deeplink'] ?? '';
    }

    protected function createVnpayPayment(Payment $payment): string
    {
        $config   = config('services.vnpay');
        $vnpUrl   = $config['endpoint'];
        $vnpTmn   = $config['tmn_code'];
        $vnpHash  = $config['hash_secret'];
        $returnUrl= $config['return_url'];

        $vnpData = [
            'vnp_Version'   => '2.1.0',
            'vnp_TmnCode'   => $vnpTmn,
            'vnp_Amount'    => $payment->amount * 100,  // VNPAY dùng đơn vị là x100
            'vnp_Command'   => 'pay',
            'vnp_CreateDate'=> now()->format('YmdHis'),
            'vnp_CurrCode'  => 'VND',
            'vnp_IpAddr'    => request()->ip(),
            'vnp_Locale'    => 'vn',
            'vnp_OrderInfo' => 'Thanh toán gói dịch vụ JobOnline',
            'vnp_OrderType' => 'other',
            'vnp_ReturnUrl' => $returnUrl,
            'vnp_TxnRef'    => $payment->order_code,
        ];

        ksort($vnpData);
        $query = [];
        $hashDataArr = [];
        foreach ($vnpData as $k => $v) {
            $query[] = urlencode($k) . '=' . urlencode($v);
            $hashDataArr[] = $k . '=' . $v;
        }
        $queryString = implode('&', $query);
        $hashData    = implode('&', $hashDataArr);

        $secureHash = hash_hmac('sha512', $hashData, $vnpHash);
        $payUrl = $vnpUrl . '?' . $queryString . '&vnp_SecureHash=' . $secureHash;

        return $payUrl;
    }

    public function vnpayReturn(Request $request)
    {
        $vnpData = $request->all();
        $vnpSecureHash = $vnpData['vnp_SecureHash'] ?? '';
        unset($vnpData['vnp_SecureHash'], $vnpData['vnp_SecureHashType']);

        ksort($vnpData);
        $hashData = [];
        foreach ($vnpData as $k => $v) {
            $hashData[] = $k . '=' . $v;
        }
        $hashDataStr = implode('&', $hashData);

        $secureHash = hash_hmac('sha512', $hashDataStr, config('services.vnpay.hash_secret'));

        $orderCode = $vnpData['vnp_TxnRef'] ?? null;
        $payment = Payment::where('order_code', $orderCode)->first();

        $success = false;

        if ($payment && $secureHash === $vnpSecureHash && $vnpData['vnp_ResponseCode'] == '00') {
            $payment->status = 'success';
            $payment->gateway_tran_id = $vnpData['vnp_TransactionNo'] ?? null;
            $payment->meta = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();
            $success = true;
        } elseif ($payment) {
            $payment->status = 'failed';
            $payment->meta = array_merge($payment->meta ?? [], ['vnp_return' => $request->all()]);
            $payment->save();
        }

        // redirect về web admin_client với query
        $url = config('services.vnpay.return_url');
        return redirect()->away($url . '?status=' . ($success ? 'success' : 'failed') . '&order=' . $orderCode);
    }

    public function momoReturn(Request $request)
    {
        $config = config('services.momo');
        $accessKey = $config['access_key'];
        $secretKey = $config['secret_key'];

        $data = $request->all();

        $orderId     = $data['orderId']    ?? null; // trùng với order_code bên mình
        $requestId   = $data['requestId']  ?? '';
        $amount      = $data['amount']     ?? '';
        $orderInfo   = $data['orderInfo']  ?? '';
        $orderType   = $data['orderType']  ?? '';
        $transId     = $data['transId']    ?? '';
        $resultCode  = $data['resultCode'] ?? '';
        $message     = $data['message']    ?? '';
        $payType     = $data['payType']    ?? '';
        $responseTime= $data['responseTime'] ?? '';
        $extraData   = $data['extraData']  ?? '';
        $partnerCode = $data['partnerCode']?? '';
        $signature   = $data['signature']  ?? '';

        // chuỗi rawHash theo tài liệu MoMo
        $rawHash = "accessKey=$accessKey"
            ."&amount=$amount"
            ."&extraData=$extraData"
            ."&ipnUrl=".$config['ipn_url'] // tuỳ, có thể không có trong redirect, nếu không có thì bỏ dòng này
            ."&message=$message"
            ."&orderId=$orderId"
            ."&orderInfo=$orderInfo"
            ."&orderType=$orderType"
            ."&partnerCode=$partnerCode"
            ."&payType=$payType"
            ."&requestId=$requestId"
            ."&responseTime=$responseTime"
            ."&resultCode=$resultCode"
            ."&transId=$transId";

        $calculatedSignature = hash_hmac('sha256', $rawHash, $secretKey);

        $payment = $orderId
            ? Payment::where('order_code', $orderId)->first()
            : null;

        $success = false;

        if ($payment && hash_equals($calculatedSignature, $signature) && (string)$resultCode === '0') {
            $payment->status = 'success';
            $payment->gateway_tran_id = $transId;
            $payment->meta = array_merge($payment->meta ?? [], [
                'momo_return' => $data,
            ]);
            $payment->save();
            $success = true;
        } elseif ($payment) {
            $payment->status = 'failed';
            $payment->meta = array_merge($payment->meta ?? [], [
                'momo_return' => $data,
            ]);
            $payment->save();
        }

        // redirect về web admin_client (React) với query
        $url = $config['return_url']; // VD: https://admin.jobonline.com/payment/result
        return redirect()->away(
            $url.'?status='.($success ? 'success' : 'failed').'&order='.$orderId
        );
    }

    public function momoIpn(Request $request)
    {
        $config = config('services.momo');
        $accessKey = $config['access_key'];
        $secretKey = $config['secret_key'];

        $data = $request->all();

        $orderId     = $data['orderId']    ?? null;
        $requestId   = $data['requestId']  ?? '';
        $amount      = $data['amount']     ?? '';
        $orderInfo   = $data['orderInfo']  ?? '';
        $orderType   = $data['orderType']  ?? '';
        $transId     = $data['transId']    ?? '';
        $resultCode  = $data['resultCode'] ?? '';
        $message     = $data['message']    ?? '';
        $payType     = $data['payType']    ?? '';
        $responseTime= $data['responseTime'] ?? '';
        $extraData   = $data['extraData']  ?? '';
        $partnerCode = $data['partnerCode']?? '';
        $signature   = $data['signature']  ?? '';

        $rawHash = "accessKey=$accessKey"
            ."&amount=$amount"
            ."&extraData=$extraData"
            ."&ipnUrl=".$config['ipn_url']
            ."&message=$message"
            ."&orderId=$orderId"
            ."&orderInfo=$orderInfo"
            ."&orderType=$orderType"
            ."&partnerCode=$partnerCode"
            ."&payType=$payType"
            ."&requestId=$requestId"
            ."&responseTime=$responseTime"
            ."&resultCode=$resultCode"
            ."&transId=$transId";

        $calculatedSignature = hash_hmac('sha256', $rawHash, $secretKey);

        if (!hash_equals($calculatedSignature, $signature)) {
            return response()->json([
                'resultCode' => 1,
                'message'    => 'Invalid signature',
            ]);
        }

        $payment = $orderId
            ? Payment::where('order_code', $orderId)->first()
            : null;

        if (!$payment) {
            return response()->json([
                'resultCode' => 2,
                'message'    => 'Order not found',
            ]);
        }

        if ((string)$resultCode === '0') {
            $payment->status = 'success';
            $payment->gateway_tran_id = $transId;
        } else {
            $payment->status = 'failed';
        }

        $payment->meta = array_merge($payment->meta ?? [], [
            'momo_ipn' => $data,
        ]);
        $payment->save();

        // MoMo yêu cầu trả JSON
        return response()->json([
            'resultCode' => 0,
            'message'    => 'Success',
        ]);
    }

}
