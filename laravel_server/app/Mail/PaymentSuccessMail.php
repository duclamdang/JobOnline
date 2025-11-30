<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Admin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public Admin $admin;
    public bool $forAdmin;

    public function __construct(Payment $payment, Admin $admin, bool $forAdmin = false)
    {
        $this->payment = $payment;
        $this->admin   = $admin;
        $this->forAdmin= $forAdmin;
    }

    public function build()
    {
        return $this->subject('Thanh toán điểm thành công')
            ->view('emails.success');
    }
}
