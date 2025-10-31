<?php

namespace App\Http\Services\Admin\Employer;

use App\Constants\BaseConstants;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployerService
{
    public function getAll(int $perPage = 10): array
    {
        $employers = Admin::where('admins.role_id', '!=', BaseConstants::ROOT_ADMIN)
            ->leftJoin('companies', 'admins.company_id', '=', 'companies.id')
            ->leftJoin('roles', 'admins.role_id', '=', 'roles.id')
            ->select('admins.*', 'companies.name as company_name', 'roles.name as role_name')
            ->paginate($perPage);

        return [
            'success'   => true,
            'message'   => 'Lấy danh sách tài khoản thành công',
            'employers' => $employers,
        ];
    }
    public function getById(int $id): array
    {
        $user = Admin::query()
            ->find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Tài khoản không tồn tại',
            ];
        }

        return [
            'success' => true,
            'message' => 'Lấy thông tin tài khoản thành công',
            'user' => $user,
        ];
    }
    public function active(Request $request, int $id): array
    {
        DB::beginTransaction();

        try {
            $admin = $request->user();
            if ($admin->role_id !== BaseConstants::ROOT_ADMIN) {
                return [
                    'success' => false,
                    'message' => 'Bạn không có quyền cập nhật trạng thái tài khoản.',
                ];
            }
            $employer = Admin::find($id);
            if (!$employer) {
                return [
                    'success' => false,
                    'message' => 'Không tìm thấy tài khoản cần cập nhật.',
                ];
            }
            $employer->is_active = !$employer->is_active;
            $employer->save();
            DB::commit();
            return [
                'success'  => true,
                'message'  => 'Cập nhật trạng thái tài khoản thành công.',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage(),
            ];
        }
    }
}
