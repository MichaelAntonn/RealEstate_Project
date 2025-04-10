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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['monthly_sales', 'yearly_sales', 'new_listings', 'agent_performance']);
            $table->enum('goal_type', ['units', 'commission'])->default('commission'); 
            $table->decimal('target_amount', 15, 2)->nullable(); 
            $table->integer('target_units')->nullable(); 
            $table->date('start_date');
            $table->date('end_date');
            $table->text('description')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // For agent-specific goals
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
