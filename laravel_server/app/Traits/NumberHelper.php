<?php

namespace App\Helpers;

class NumberHelper
{
    // NumberHelper::formatCurrency(1000000);   // "1.000.000 ₫"
    // NumberHelper::formatNumber(12345.678);   // "12,345.68"
  
    public static function formatCurrency($amount, $symbol = '₫')
    {
        return number_format($amount, 0, ',', '.') . ' ' . $symbol;
    }

    public static function formatNumber($number, $decimals = 2)
    {
        return number_format($number, $decimals, '.', ',');
    }
}
