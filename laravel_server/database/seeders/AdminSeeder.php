<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rootRole = Role::where('name', 'root')->first();

        Admin::firstOrCreate(
            ['email' => 'root@system.com'],
            [
                'name' => 'Root Admin',
                'password' => Hash::make('123456'),
                'phone' => '0123456789',
                'address' => 'Hà Nội',
                'role_id' => $rootRole->id ?? 1,
            ]
        );
    }
}
