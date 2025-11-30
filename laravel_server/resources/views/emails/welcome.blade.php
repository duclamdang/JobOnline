<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tài khoản mới</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f4f4;">
    <tr>
        <td align="center" style="padding: 20px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                <tr>
                    <td align="center" style="padding: 30px 20px 20px 20px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">🔔 Thông Báo Tài Khoản Mới Đăng Ký</h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 25px 35px 25px 35px;">
                        <p style="margin-bottom: 20px; font-size: 16px; color: #333333;">Xin chào Quản trị viên,</p>
                        <p style="margin-bottom: 25px; font-size: 16px; color: #333333;">Một tài khoản mới vừa được đăng ký trên hệ thống của bạn:</p>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; border: 1px solid #eeeeee; border-radius: 4px;">
                            <tr>
                                <td style="padding: 10px; background-color: #f9f9f9; font-size: 15px; color: #555555; width: 30%;"><strong>Họ tên:</strong></td>
                                <td style="padding: 10px; background-color: #f9f9f9; font-size: 15px; color: #333333; width: 70%;"><strong>{{ $user->name }}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 15px; color: #555555;"><strong>Email:</strong></td>
                                <td style="padding: 10px; font-size: 15px; color: #333333;"><strong>{{ $user->email }}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; background-color: #f9f9f9; font-size: 15px; color: #555555;"><strong>Thời gian:</strong></td>
                                <td style="padding: 10px; background-color: #f9f9f9; font-size: 15px; color: #333333;">{{ now()->format('H:i, d/m/Y') }}</td>
                            </tr>
                        </table>

                        <p style="margin-top: 0; margin-bottom: 25px; font-size: 16px; color: #333333;">Vui lòng đăng nhập trang quản trị để **kiểm tra, xác minh** và **phân quyền** cho tài khoản mới này nếu cần.</p>

                        <div style="text-align: center; margin-top: 30px; margin-bottom: 40px;">
                            @php
                                $appUrl = config('app.url');
                            @endphp
                            <a href="{{ $appUrl }}"
                               style="display:inline-block;padding:10px 22px;border-radius:999px;background-color:#4C6FFF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                                Đăng nhập JobOnline
                            </a>
                        </div>

                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 20px 35px 30px 35px; background-color: #f4f4f4; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #777777;">
                            Đây là email tự động. Vui lòng không trả lời email này.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
