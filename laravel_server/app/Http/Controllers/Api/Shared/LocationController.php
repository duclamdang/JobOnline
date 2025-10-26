<?php

namespace App\Http\Controllers\Api\Shared;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Shared\LocationService;
use Exception;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    public function getAllProvinces()
    {
        try {
            $provinces = $this->locationService->getAllProvinces();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách tỉnh thành công',
                'data'        => $provinces,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getDistrictsByProvince($provinceId)
    {
        try {
            $districts = $this->locationService->getDistrictsByProvince($provinceId);

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách quận/huyện theo tỉnh thành công',
                'data'        => $districts,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getWardsByDistrict($districtId)
    {
        try {
            $wards = $this->locationService->getWardsByDistrict($districtId);

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách xã/phường theo huyện thành công',
                'data'        => $wards,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

}
