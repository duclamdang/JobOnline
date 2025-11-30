<?php

namespace App\Mail;

use App\Models\JobApply;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public JobApply $apply;
    public int $statusCode;
    public string $statusText;
    public ?string $reason;

    public function __construct(JobApply $apply, int $statusCode, ?string $reason = null)
    {
        $this->apply      = $apply;
        $this->statusCode = $statusCode;
        $this->reason     = $reason;

        // Map code -> text giống service
        $this->statusText = match ($statusCode) {
            JobApply::STATUS_PENDING   => 'ĐANG ĐƯỢC XEM XÉT',
            JobApply::STATUS_ACCEPTED  => 'ĐÃ ĐƯỢC CHẤP NHẬN',
            JobApply::STATUS_REJECTED  => 'BỊ TỪ CHỐI',
            JobApply::STATUS_INTERVIEW => 'MỜI PHỎNG VẤN',
            JobApply::STATUS_OFFER     => 'ĐƯỢC ĐỀ NGHỊ LÀM VIỆC',
            JobApply::STATUS_HIRED     => 'ĐÃ TRÚNG TUYỂN',
            default                    => 'ĐÃ CẬP NHẬT',
        };
    }

    public function build()
    {
        return $this->subject('Trạng thái hồ sơ ứng tuyển của bạn trên JobOnline')
            ->view('emails.status')
            ->with([
                'apply'      => $this->apply,
                'statusCode' => $this->statusCode,
                'statusText' => $this->statusText,
                'reason'     => $this->reason,
            ]);
    }
}
