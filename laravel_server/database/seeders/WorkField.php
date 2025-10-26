<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkField extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('work_field')->insert([
            ['title' => 'Hành chính - Thư ký', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'An ninh - Bảo vệ', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Thiết kế - Sáng tạo nghệ thuật', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Kiến trúc - Thiết kế nội ngoại thất', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Khách sạn - Nhà hàng - Du lịch', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bán sỉ - Bán lẻ - Quản lý cửa hàng', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'IT Phần cứng - Mạng', 'description' => '', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
