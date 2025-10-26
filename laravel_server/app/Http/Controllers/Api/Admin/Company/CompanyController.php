<?php

namespace App\Http\Controllers\Api\Admin\Company;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Company\CompanyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Exception;

class CompanyController extends Controller
{
    protected CompanyService $companyService;

    public function __construct(CompanyService $companyService)
    {
        $this->companyService = $companyService;
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'tax_code'    => 'required|string|max:255',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string|max:255',
            'location_id' => 'nullable|exists:provinces,id',
            'industry_id' => 'nullable|exists:industries,id',
            'company_size'=> 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->companyService->create($validator->validated());

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }


    public function getAll(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $result = $this->companyService->getAll($perPage);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::NOT_FOUND,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::NOT_FOUND);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['companies'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getById(int $id)
    {
        try {
            $result = $this->companyService->getById($id);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::NOT_FOUND,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::NOT_FOUND);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getMyCompany(Request $request)
    {
        try {
            $result = $this->companyService->getMyCompany($request->user());

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::NOT_FOUND,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::NOT_FOUND);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateBasicInfo(Request $request, ?int $id = null)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name'         => 'nullable|string|max:255',
                'company_size' => 'nullable|string|max:50',
                'email'        => 'nullable|email|max:255',
                'phone'        => 'nullable|string|max:20',
                'address'      => 'nullable|string|max:255',
                'location_id'  => 'nullable|exists:provinces,id',
                'industry_id'  => 'nullable|exists:industries,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();
            $admin = $request->user();

            if ($id) {
                $result = $this->companyService->updateBasicInfoById($id, $data);
            } else {
                $result = $this->companyService->updateBasicInfoByAdmin($admin, $data);
            }

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateBusinessLicense(Request $request, ?int $id = null)
    {
        try {
            $validator = Validator::make($request->all(), [
                'business_license' => 'required|file|mimes:pdf|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $file = $request->file('business_license');
            $admin = $request->user();

            if ($id) {
                $result = $this->companyService->updateBusinessLicenseById($id, $file);
            } else {
                $result = $this->companyService->updateBusinessLicenseByAdmin($admin, $file);
            }

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateAdditional(Request $request, ?int $id = null)
    {
        try {
            $validator = Validator::make($request->all(), [
                'website'      => 'nullable|url|max:255',
                'description'  => 'nullable|string',
                'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();
            $admin = $request->user();

            if ($id) {
                $result = $this->companyService->updateAdditionalById($id, $data);
            } else {
                $result = $this->companyService->updateAdditionalByAdmin($admin, $data);
            }

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateImage(Request $request, ?int $id = null)
    {
        try {
            $validator = Validator::make($request->all(), [
                'logo'        => 'required_without_all:cover_image|file|mimes:jpg,jpeg,png|max:10240',
                'cover_image' => 'required_without_all:logo|file|mimes:jpg,jpeg,png|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = [
                'logo'        => $request->file('logo'),
                'cover_image' => $request->file('cover_image'),
            ];

            $admin = $request->user();

            if ($id) {
                $result = $this->companyService->updateImageById($id, $data);
            } else {
                $result = $this->companyService->updateImageByAdmin($admin, $data);
            }

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['company'],
            ], HttpStatus::OK);

        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }
}
