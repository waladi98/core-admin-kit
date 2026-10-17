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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->index();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('contact_person')->nullable();
            $table->text('address')->nullable();
            $table->string('tax_number', 30)->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->unsignedSmallInteger('payment_term_days')->default(30);
            $table->unsignedBigInteger('credit_limit')->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
