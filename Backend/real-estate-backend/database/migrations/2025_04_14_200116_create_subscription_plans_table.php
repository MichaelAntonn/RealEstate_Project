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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Basic, Premium
            $table->decimal('price', 10, 2);
            $table->integer('duration_in_days'); // e.g., 30, 90, 365
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_trial')->default(false);
            $table->integer('max_properties_allowed')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
