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
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User who added the cost
            $table->decimal('amount', 15, 2); // Cost amount
            $table->text('description')->nullable(); // Optional description of the cost
            $table->timestamps(); // created_at and updated_at (will use created_at to determine the month)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('costs');
    }
};