<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewApplicationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Job $job;

    public function __construct(User $user, Job $job)
    {
        $this->user = $user;
        $this->job  = $job;
    }

    public function build()
    {
        return $this->subject('Có ứng viên mới ứng tuyển')
            ->view('emails.new-application');
    }
}
