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
        Schema::create('legal_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PropertyID')->constrained('properties')->onDelete('cascade');
            $table->string('DocumentURL');
            $table->enum('VerificationStatus', ['pending', 'approved', 'rejected']);
            $table->foreignId('VerifiedBy')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('VerificationDate')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legal_verifications');
    }
};
