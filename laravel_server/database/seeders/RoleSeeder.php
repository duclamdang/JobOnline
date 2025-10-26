<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['name' => 'root_admin'],
            ['description' => 'Toàn quyền quản lý hệ thống']
        );

        Role::firstOrCreate(
            ['name' => 'employer_admin'],
            ['description' => 'Toàn quyền quản lý công ty, tin tuyển dụng và ứng viên']
        );

        Role::firstOrCreate(
            ['name' => 'employer_hr'],
            ['description' => 'Quản lý tin tuyển dụng và ứng viên, không chỉnh sửa thông tin công ty']
        );

        Role::firstOrCreate(
            ['name' => 'employer_viewer'],
            ['description' => 'Chỉ được xem thông tin công ty, tin tuyển dụng và ứng viên']
        );

    }
}
