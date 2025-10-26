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
        Schema::create('user_educations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('school_name'); // Tên trường
            $table->year('start_year');    // Năm bắt đầu
            $table->year('end_year');      // Năm kết thúc
            $table->unsignedBigInteger('major_id')->nullable(); // Chuyên ngành đào tạo
            $table->unsignedBigInteger('education_id')->nullable(); // Bằng cấp
            $table->text('description')->nullable(); // Mô tả chi tiết
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('major_id')->references('id')->on('majors')->nullOnDelete();
            $table->foreign('education_id')->references('id')->on('educations')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_educations');
    }
};
