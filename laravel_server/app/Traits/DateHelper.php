<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    // DateHelper::formatVN(now());     // 11/09/2025 14:30

    public static function formatVN($date, $format = 'd/m/Y H:i')
    {
        return $date ? Carbon::parse($date)->format($format) : null;
    }

    public static function diffForHumans($date)
    {
        return $date ? Carbon::parse($date)->diffForHumans() : null;
    }

    public static function startOfMonth($date = null)
    {
        return Carbon::parse($date ?? now())->startOfMonth();
    }

    public static function endOfMonth($date = null)
    {
        return Carbon::parse($date ?? now())->endOfMonth();
    }
}
