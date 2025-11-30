<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>Trạng thái ứng tuyển - JobOnline</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr>
        <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.08);">
                {{-- HEADER --}}
                <tr>
                    <td align="center" style="background:linear-gradient(135deg,#4C6FFF,#2563eb);padding:20px 24px;color:#ffffff;">
                        <div style="font-size:20px;font-weight:bold;margin-bottom:4px;">
                            JobOnline
                        </div>
                        <div style="font-size:14px;opacity:0.9;">
                            Cập nhật trạng thái ứng tuyển của bạn
                        </div>
                    </td>
                </tr>

                {{-- BODY --}}
                <tr>
                    <td style="padding:24px 24px 8px 24px;color:#111827;font-size:14px;line-height:1.6;">
                        <p style="margin:0 0 12px 0;">
                            Chào <strong>{{ $apply->user->name }}</strong>,
                        </p>

                        @php
                            $jobTitle = $apply->job->title ?? 'công việc bạn đã ứng tuyển';
                        @endphp

                        @if ($statusCode === \App\Models\JobApply::STATUS_ACCEPTED)
                            <div style="margin:12px 0 16px 0;padding:12px 14px;border-radius:8px;background-color:#ecfdf3;border:1px solid #bbf7d0;color:#166534;font-size:13px;">
                                ✅ Đơn ứng tuyển cho vị trí
                                <strong>{{ $jobTitle }}</strong>
                                của bạn đã được <strong>{{ $statusText }}</strong>.
                            </div>
                        @elseif ($statusCode === \App\Models\JobApply::STATUS_REJECTED)
                            <div style="margin:12px 0 16px 0;padding:12px 14px;border-radius:8px;background-color:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:13px;">
                                ❌ Đơn ứng tuyển cho vị trí
                                <strong>{{ $jobTitle }}</strong>
                                của bạn đã <strong>{{ $statusText }}</strong>.
                            </div>

                            @if (!empty($reason))
                                <p style="margin:0 0 10px 0;">
                                    <span style="font-weight:600;">Lý do:</span>
                                    {{ $reason }}
                                </p>
                            @endif
                        @else
                            <div style="margin:12px 0 16px 0;padding:12px 14px;border-radius:8px;background-color:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:13px;">
                                ℹ️ Trạng thái đơn ứng tuyển cho vị trí
                                <strong>{{ $jobTitle }}</strong>
                                đã được cập nhật thành:
                                <strong>{{ $statusText }}</strong>.
                            </div>
                        @endif

                        <p style="margin:12px 0 0 0;">
                            Vui lòng đăng nhập vào JobOnline để xem chi tiết và thực hiện các bước tiếp theo nếu cần.
                        </p>
                    </td>
                </tr>

                {{-- FOOTER --}}
                <tr>
                    <td style="padding:12px 24px 20px 24px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px 0;">
                            Đây là email tự động, vui lòng không trả lời lại email này.
                        </p>
                        <p style="margin:0;">
                            © {{ date('Y') }} JobOnline. Mọi quyền được bảo lưu.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
