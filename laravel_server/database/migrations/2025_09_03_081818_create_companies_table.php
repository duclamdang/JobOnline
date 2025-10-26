<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();

            $table->string('name', 255);              // Tên công ty
            $table->string('slug');    // Slug phục vụ SEO, URL thân thiện
            $table->string('tax_code', 50)->unique();    // Mã số thuế duy nhất

            $table->string('website', 255)->nullable();       // Website chính thức
            $table->string('company_size', 50)->nullable();   // Quy mô công ty (vd: 1-10, 51-200)
            $table->text('description')->nullable();          // Mô tả chi tiết về công ty

            $table->string('address', 255)->nullable();       // Địa chỉ trụ sở chính
            $table->string('email', 100)->nullable();         // Email liên hệ
            $table->string('phone', 20)->nullable();          // Số điện thoại liên hệ

            $table->unsignedBigInteger('location_id')->nullable();  // Khóa ngoại liên kết bảng provinces
            $table->unsignedBigInteger('industry_id')->nullable();  // Khóa ngoại liên kết bảng industries

            $table->string('logo', 255)->nullable();          // Đường dẫn ảnh logo công ty
            $table->string('cover_image', 255)->nullable();   // Ảnh bìa (banner) của công ty
            $table->integer('founded_year')->nullable();      // Năm thành lập
            $table->string('business_license', 255)->nullable();     // Giấy phép kinh doanh

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('location_id')->references('id')->on('provinces')->onDelete('set null');
            $table->foreign('industry_id')->references('id')->on('industries')->onDelete('set null');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
