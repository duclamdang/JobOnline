<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CV extends Model
{
    use HasFactory;
    protected $table = 'cvs';

    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'main_cv',
        'cv_public_id'
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
