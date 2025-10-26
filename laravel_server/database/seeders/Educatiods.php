<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Educations extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('educations')->insert([
            ['title' => 'Đại học', 'description' => 'Trình độ đại học', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Cao đẳng', 'description' => 'Trình độ cao đẳng', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Trung cấp', 'description' => 'Trình độ trung cấp', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Trung học', 'description' => 'Trình độ trung học', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Chứng chỉ nghề', 'description' => 'Các chứng chỉ nghề nghiệp', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
