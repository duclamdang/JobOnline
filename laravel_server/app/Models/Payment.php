<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_code',
        'amount',
        'method',
        'status',
        'gateway_tran_id',
        'meta',
        'promotion_id'
    ];

    protected $casts = [
        'meta' => 'array',
        'amount' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(Admin::class, 'user_id');
    }
    public function promotion()
    {
        return $this->belongsTo(Promotion::class, 'promotion_id');
    }
}
