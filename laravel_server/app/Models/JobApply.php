<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApply extends Model
{
    use HasFactory;
    protected $table = 'job_applies';
    protected $fillable = [
        'user_id',
        'job_id',
        'cv_id',
        'status',
    ];

    protected $casts = [
        'cv_id' => 'array',
    ];
    const STATUS_PENDING  = 0;
    const STATUS_ACCEPTED = 1;
    const STATUS_REJECTED = 2;

    const STATUS_INTERVIEW = 3;
    const STATUS_OFFER     = 4;
    const STATUS_HIRED     = 5;

    public function getStatusTextAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Hồ sơ chưa đạt',
            self::STATUS_ACCEPTED => 'Đã chấp nhận',
            self::STATUS_REJECTED => 'Bị từ chối',
            self::STATUS_INTERVIEW => 'Phỏng vấn',
            self::STATUS_OFFER => 'Được đề nghị',
            self::STATUS_HIRED => 'Đã tuyển',
            default => 'unknown',
        };
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function cv(): BelongsTo
    {
        return $this->belongsTo(CV::class);
    }
}
