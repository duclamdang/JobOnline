<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class UserCertificate extends Model
{
    use HasFactory;

    protected $table = 'user_certificates';

    protected $fillable = [
        'user_id',
        'name',
        'image_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
