<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>Thanh toán thành công</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
<h2>Thanh toán thành công</h2>

@if($forAdmin)
    <p>Nhà tuyển dụng <strong>{{ $admin->name }}</strong> ({{ $admin->email }}) vừa thanh toán.</p>
@else
    <p>Chào <strong>{{ $admin->name }}</strong>,</p>
    <p>Bạn đã thanh toán điểm thành công trên JobOnline.</p>
@endif

<p>Mã đơn: <strong>{{ $payment->order_code }}</strong></p>
<p>Số tiền: <strong>{{ number_format($payment->amount) }} đ</strong></p>
<p>Phương thức: <strong>{{ strtoupper($payment->method) }}</strong></p>
<p>Trạng thái: <strong>{{ $payment->status }}</strong></p>
</body>
</html>
