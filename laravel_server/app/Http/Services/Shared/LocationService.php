<?php

namespace App\Http\Services\Shared;


use App\Models\District;
use App\Models\Province;
use App\Models\Ward;

class LocationService
{
    public function getAllProvinces()
    {
        return Province::all();
    }

    public function getDistrictsByProvince($provinceId)
    {
        return District::where('province_id', $provinceId)->get();
    }

    public function getWardsByDistrict($districtId)
    {
        return Ward::where('district_id', $districtId)->get();
    }
}
