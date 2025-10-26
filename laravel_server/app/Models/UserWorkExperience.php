<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserWorkExperience extends Model
{
    use HasFactory;

    protected $table = 'user_work_experiences';

    protected $fillable = [
        'user_id',
        'company_name',
        'position',
        'is_current',
        'start_date',
        'end_date',
        'description',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
