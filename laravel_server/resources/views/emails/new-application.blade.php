@php
    $appName = config('app.name', 'JobOnline');
    $adminUrl = rtrim(config('app.url'), '/') . '/admin';
@endphp
    <!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Có ứng viên mới ứng tuyển</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="padding:24px 0;">
    <tr>
        <td align="center">
            <!-- CARD -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.12);">
                <!-- HEADER -->
                <tr>
                    <td style="background:#1d4ed8;padding:16px 24px;color:#ffffff;">
                        <h1 style="margin:0;font-size:20px;font-weight:700;">
                            Có ứng viên mới ứng tuyển
                        </h1>
                        <p style="margin:4px 0 0;font-size:13px;opacity:.9;">
                            Thông báo tự động từ hệ thống {{ $appName }}
                        </p>
                    </td>
                </tr>

                <!-- BODY -->
                <tr>
                    <td style="padding:24px;">
                        <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">
                            Thông tin ứng tuyển
                        </h2>

                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:14px;color:#374151;">
                            <tr>
                                <td style="padding:4px 0;width:140px;color:#6b7280;">Ứng viên:</td>
                                <td style="padding:4px 0;font-weight:600;">
                                    {{ $user->name }}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;">Email:</td>
                                <td style="padding:4px 0;">
                                    <a href="mailto:{{ $user->email }}" style="color:#1d4ed8;text-decoration:none;">
                                        {{ $user->email }}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;">Công việc:</td>
                                <td style="padding:4px 0;font-weight:600;">
                                    {{ $job->title }}
                                </td>
                            </tr>
                            @if(!empty($job->location))
                                <tr>
                                    <td style="padding:4px 0;color:#6b7280;">Địa điểm:</td>
                                    <td style="padding:4px 0;">
                                        {{ $job->location }}
                                    </td>
                                </tr>
                            @endif
                            @if(!empty($job->salary_range))
                                <tr>
                                    <td style="padding:4px 0;color:#6b7280;">Mức lương:</td>
                                    <td style="padding:4px 0;">
                                        {{ $job->salary_range }}
                                    </td>
                                </tr>
                            @endif
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;">Thời gian ứng tuyển:</td>
                                <td style="padding:4px 0;">
                                    {{ now()->format('d/m/Y H:i') }}
                                </td>
                            </tr>
                        </table>

                        <!-- BUTTON -->
                        <div style="margin:24px 0 8px;" align="center">
                            @php
                                $appUrl = config('app.url');
                            @endphp
                            <a href="{{ $appUrl }}"
                               style="display:inline-block;padding:10px 22px;border-radius:999px;background-color:#4C6FFF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                                Đăng nhập JobOnline
                            </a>
                        </div>

                        <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                            Bạn hãy đăng nhập vào hệ thống {{ $appName }} để xem và xử lý hồ sơ chi tiết.
                        </p>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:11px;color:#9ca3af;">
                        <p style="margin:0;">
                            Email được gửi tự động từ hệ thống {{ $appName }} – vui lòng không trả lời email này.
                        </p>
                    </td>
                </tr>
            </table>
            <!-- END CARD -->
        </td>
    </tr>
</table>

</body>
</html>
