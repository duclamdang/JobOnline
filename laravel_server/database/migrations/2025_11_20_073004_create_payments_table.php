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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('order_code')->unique(); // mã đơn
            $table->unsignedBigInteger('amount');
            $table->string('method'); // momo / vnpay
            $table->string('status')->default('pending'); // pending, success, failed
            $table->string('gateway_tran_id')->nullable();
            $table->json('meta')->nullable(); // lưu raw response
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
