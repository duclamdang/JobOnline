<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MajorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('majors')->insert([
            ['name' => 'Công nghệ thông tin'],
            ['name' => 'Kinh tế'],
            ['name' => 'Quản trị kinh doanh'],
            ['name' => 'Ngôn ngữ Anh'],
            ['name' => 'Kế toán'],
            ['name' => 'Tài chính - Ngân hàng'],
            ['name' => 'Marketing'],
        ]);
    }
}
