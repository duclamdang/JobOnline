<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndustrySeeder extends Seeder
{
    public function run()
    {
        $industries = [
            'Dịch vụ lưu trú, nhà hàng, khách sạn và du lịch',
            'Hoạt động kế toán và kiểm toán',
            'Nông nghiệp, lâm nghiệp và nuôi trồng thủy sản',
            'Dịch vụ thú y',
            'Kiến trúc và thiết kế nội thất',
            'Nghệ thuật, giải trí và truyền thông',
            'Hoạt động sản xuất và ứng dụng công nghệ tự động hóa',
            'Sản xuất, phân phối và dịch vụ liên quan đến ô tô',
            'Hoạt động ngân hàng',
            'Dịch vụ làm đẹp (mỹ phẩm) và chăm sóc cá nhân',
        ];

        foreach ($industries as $title) {
            DB::table('industries')->insert([
                'title' => $title,
                'description' => $title,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
