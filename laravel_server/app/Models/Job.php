<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Job extends Model
{
    use HasFactory;

    protected $table = 'jobs';

    public const IS_ACTIVE = 1;
    public const IS_NOT_ACTIVE = 0;

    protected $fillable = [
        'company_id',
        'title',
        'create_by',
        'description',
        'quantity',
        'salary_from',
        'salary_to',
        'province_id',
        'working_form_id',
        'work_field_id',
        'work_experience_id',
        'education_id',
        'position_id',
        'requirements',
        'end_date',
        'is_fulltime',
        'slug',
        'skills',
        'is_active',
        'is_urgent',
        'gender',
        'benefit',
        'address',
        'salary_negotiable',
        'district_id'
    ];

    protected $casts = [
        'work_field_id' => 'array',
    ];
    public function province()
    {
        return $this->belongsTo(Province::class);
    }
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function working_form(): BelongsTo
    {
        return $this->belongsTo(WorkingForm::class);
    }

    public function work_field(): BelongsTo
    {
        return $this->belongsTo(WorkField::class);
    }

    public function work_experience(): BelongsTo
    {
        return $this->belongsTo(WorkExperience::class);
    }

    public function education(): BelongsTo
    {
        return $this->belongsTo(Education::class);
    }
    public function district()
    {
        return $this->belongsTo(District::class);
    }
    public function jobapply()
    {
        return $this->hasMany(JobApply::class);
    }
}
