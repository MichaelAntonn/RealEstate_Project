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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('type', ['land', 'apartment', 'villa', 'office']); // نوع العقار
            $table->decimal('price', 15, 2);
            $table->string('city');
            $table->string('district');
            $table->string('full_address')->nullable();
            $table->integer('area');
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->enum('listing_type', ['for_sale', 'for_rent']);
            $table->enum('status', ['available', 'under_construction']);
            $table->enum('transaction_status', ['pending', 'completed'])->nullable();
            $table->year('building_year')->nullable();
            $table->enum('legal_status', ['licensed', 'unlicensed', 'pending'])->default('pending');
            $table->boolean('furnished')->default(false);
            $table->json('amenities')->nullable();
            $table->json('payment_options')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('property_code')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
