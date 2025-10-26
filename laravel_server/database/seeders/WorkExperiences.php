<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkExperiences extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('work_experiences')->insert([
            ['title' => 'Chưa có kinh nghiệm', 'description' => 'Ứng viên chưa có kinh nghiệm làm việc.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Dưới 1 năm', 'description' => 'Kinh nghiệm làm việc dưới 1 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => '1 năm', 'description' => 'Kinh nghiệm làm việc 1 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => '2 năm', 'description' => 'Kinh nghiệm làm việc 2 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => '3 năm', 'description' => 'Kinh nghiệm làm việc 3 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => '4 năm', 'description' => 'Kinh nghiệm làm việc 4 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => '5 năm', 'description' => 'Kinh nghiệm làm việc 5 năm.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Hơn 5 năm', 'description' => 'Kinh nghiệm làm việc hơn 5 năm.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
