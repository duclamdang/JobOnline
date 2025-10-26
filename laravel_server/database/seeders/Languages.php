<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Languages extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('languages')->insert([
            ['name' => 'Tiếng Việt', 'level' => 'Advanced', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tiếng Anh', 'level' => 'Intermediate', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tiếng Nhật', 'level' => 'Beginner', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tiếng Hàn', 'level' => 'Beginner', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tiếng Pháp', 'level' => 'Intermediate', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tiếng Trung', 'level' => 'Beginner', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
