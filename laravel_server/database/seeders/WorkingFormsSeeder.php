<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkingFormsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('working_forms')->insert([
            [
                'title' => 'Toàn thời gian cố định',
                'description' => 'Làm việc 8 tiếng/ngày, 6 ngày/tuần',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Toàn thời gian tạm thời',
                'description' => 'Làm việc 8 tiếng/ngày, 6 ngày/tuần',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Bán thời gian cố định',
                'description' => 'Làm việc dưới 40 tiếng/tuần',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Bán thời gian tạm thời',
                'description' => 'Làm việc theo hợp đồng ngắn hạn',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Theo hợp đồng tư vấn',
                'description' => 'Làm việc theo dự án hoặc hợp đồng cụ thể',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Thực tập',
                'description' => 'Làm việc 4 tiếng/buổi, 8 buổi/tuần',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Khác',
                'description' => 'Làm việc theo dự án hoặc hợp đồng cụ thể',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
