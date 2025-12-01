<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Promotion extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'points',
        'start_at',
        'end_at',
        'is_active',
        'image_url',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at'   => 'datetime',
        'is_active'=> 'boolean',
    ];

    public function scopeAvailable(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            });
    }
}
