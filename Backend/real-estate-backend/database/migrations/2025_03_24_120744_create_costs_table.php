<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Cost amount
            $table->text('description')->nullable(); // Description
            $table->string('category')->nullable(); // Category
            $table->string('custom_category')->nullable();
            $table->string('type')->default('variable'); // Fixed or variable
            $table->string('month')->nullable(); // For month tracking
            $table->string('year')->nullable(); // For year tracking
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('costs');
    }
};