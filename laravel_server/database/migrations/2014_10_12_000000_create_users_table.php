<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->date('birthday')->nullable();
            $table->string('phone')->nullable()->unique();
            $table->string('address')->nullable();
            $table->enum('gender', ['1', '0'])->nullable();
            $table->string('avatar')->nullable();
            $table->text('bank_info')->nullable();
            $table->integer('job_search_status')->default(0);

            $table->string('desired_position')->nullable(); // Vị trí mong muốn
            $table->unsignedBigInteger('work_field_id')->nullable(); // Ngành nghề làm việc
            $table->unsignedBigInteger('province_id')->nullable(); // Địa điểm làm việc
            $table->integer('min_salary')->nullable();
            $table->integer('max_salary')->nullable();
            $table->unsignedBigInteger('working_form_id')->nullable(); // Hình thức làm việc

            $table->unsignedBigInteger('work_experience_id')->nullable(); //Kinh nghiệm làm việc
            $table->unsignedBigInteger('position_id')->nullable(); // Cấp bậc hiện tại
            $table->unsignedBigInteger('education_id')->nullable(); // Trình độ học vấn

            $table->boolean('is_active')->default(true);
            $table->boolean('is_verify')->default(false);
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->foreign('work_field_id')->references('id')->on('work_fields')->onDelete('set null');
            $table->foreign('province_id')->references('id')->on('provinces')->onDelete('set null');
            $table->foreign('working_form_id')->references('id')->on('working_forms')->onDelete('set null');
            $table->foreign('work_experience_id')->references('id')->on('work_experiences')->onDelete('set null');
            $table->foreign('position_id')->references('id')->on('positions')->onDelete('set null');
            $table->foreign('education_id')->references('id')->on('educations')->onDelete('set null');
            $table->foreign('verified_by')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
