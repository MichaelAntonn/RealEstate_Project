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
            $table->id('company_id'); //(Primary Key)
            $table->string('company_name'); 
            $table->string('commercial_registration_number', 50); // رقم السجل التجاري
            $table->string('company_email')->unique(); 
            $table->string('company_phone_number', 20); 
            $table->text('company_address'); 
            $table->string('commercial_registration_doc'); // مسار السجل التجاري
            $table->string('real_estate_license_doc')->nullable(); // مسار الترخيص العقاري (اختياري)
            $table->string('tax_card_doc'); // مسار البطاقة الضريبية
            $table->string('proof_of_address_doc'); // مسار وثيقة إثبات العنوان
            $table->integer('years_in_real_estate')->nullable(); 
            $table->string('company_website')->nullable(); 
            $table->date('date_of_establishment')->nullable(); 
            $table->string('password'); 
            $table->boolean('accept_terms')->default(false); 
            $table->boolean('has_used_trial')->default(false);
            $table->enum('verification_status', ['Pending', 'Verified', 'Rejected'])->default('Pending'); 
            $table->timestamps(); // إضافة عمود created_at و updated_at
            $table->string('logo')->nullable()->after('verification_status');

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
