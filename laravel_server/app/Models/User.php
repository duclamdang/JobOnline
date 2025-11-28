<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    const JOB_SEARCH_NONE      = 0; // Không tìm việc
    const JOB_SEARCH_OPEN      = 1; // Đang mở cho cơ hội
    const JOB_SEARCH_ACTIVE    = 2; // Đang tích cực tìm việc

    protected $fillable = [
        'name',
        'email',
        'password',
        'birthday',
        'phone',
        'address',
        'gender',
        'avatar',
        'bank_info',
        'job_search_status',

        'desired_position',
        'work_field_id',
        'province_id',
        'min_salary',
        'max_salary',
        'working_form_id',
        'work_experience_id',
        'position_id',
        'education_id',

        'is_verify',
        'verified_by',
        'verified_at',
        'is_active',
        'avatar_public_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'birthday'    => 'date',
        'verified_at' => 'datetime',
        'is_verify'   => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    // JWT methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function refreshTokens()
    {
        return $this->morphMany(RefreshToken::class, 'owner');
    }

    public function education()
    {
        return $this->belongsTo(Education::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function workingForm()
    {
        return $this->belongsTo(WorkingForm::class);
    }

    public function workField()
    {
        return $this->belongsTo(WorkField::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function workExperience()
    {
        return $this->belongsTo(WorkExperience::class);
    }

    public function cvs(): HasMany
    {
        return $this->hasMany(CV::class);
    }
}
