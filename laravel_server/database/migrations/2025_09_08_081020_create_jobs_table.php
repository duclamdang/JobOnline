<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id'); // công ty
            $table->string('title');
            $table->unsignedBigInteger('create_by');
            $table->text('description');
            $table->integer('quantity');
            $table->bigInteger('salary_from')->nullable(); // mức lương từ
            $table->bigInteger('salary_to')->nullable();   // mức lương đến
            $table->integer('province_id')->nullable();     // địa điểm làm việc
            $table->unsignedBigInteger('working_form_id')->nullable();    // thời gian làm việc
            $table->json('work_field_id')->nullable();      // lĩnh vực công việc
            $table->unsignedBigInteger('work_experience_id')->nullable(); // kinh nghiệm làm việc
            $table->unsignedBigInteger('education_id')->nullable();    // trình độ học vấn
            $table->unsignedBigInteger('position_id')->nullable();       // vị trí làm việc
            $table->text('requirements')->nullable();      // yêu cầu công việc
            $table->timestamp('end_date')->nullable();// hạn ứng tuyển
            $table->boolean('is_fulltime')->default(true);
            $table->string('slug');              // slug
            $table->string('skills')->nullable();          // kỹ năng yêu cầu
            $table->boolean('is_active')->default(true);   // trạng thái (còn tuyển hay ngừng)
            $table->boolean('is_urgent')->default(false);  // gấp
            $table->integer('gender')->nullable();          // giới tính
            $table->text('benefit');
            $table->boolean('salary_negotiable');
            $table->text('address');
            $table->integer('district_id')->nullable();
            $table->timestamps();     // created_at + updated_at

            // Khóa ngoại
//            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
//            $table->foreign('working_form_id')->references('id')->on('working_forms')->nullOnDelete();
//            $table->foreign('work_field_id')->references('id')->on('work_fields')->nullOnDelete();
//            $table->foreign('work_experience_id')->references('id')->on('work_experiences')->nullOnDelete();
//            $table->foreign('lever_id')->references('id')->on('positions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
