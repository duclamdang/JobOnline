<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Positions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('positions')->insert([
            ['title' => 'Giám đốc', 'description' => 'Người đứng đầu công ty, quản lý toàn bộ hoạt động.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Trưởng phòng', 'description' => 'Quản lý các hoạt động trong phòng ban.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Trưởng nhóm', 'description' => 'Quản lý nhóm nhân viên, đảm bảo tiến độ công việc.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Chuyên gia', 'description' => 'Người có kiến thức chuyên môn sâu trong lĩnh vực.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Nhân viên', 'description' => 'Thực hiện các công việc được phân công.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Cộng tác viên', 'description' => 'Hỗ trợ công việc theo dự án hoặc hợp đồng.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
