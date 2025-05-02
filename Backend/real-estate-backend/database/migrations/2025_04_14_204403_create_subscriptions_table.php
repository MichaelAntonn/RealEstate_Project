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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('subscription_plans')->onDelete('cascade');
            $table->string('plan_name');
            $table->decimal('price', 10, 2);
            $table->integer('duration_in_days');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->enum('status', ['pending', 'active', 'expired', 'canceled', 'payment_failed'])->default('pending');
            $table->string('payment_gateway')->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('last_payment_attempt')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
