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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
        $table->string('title');
        $table->text('excerpt');
        $table->longText('content');
        $table->string('author');
        $table->string('featuredImage')->nullable();
        $table->json('tags'); 
        $table->string('category');
        $table->integer('readTime');
        $table->integer('likes')->default(0);
        $table->integer('comments')->default(0);
        $table->boolean('liked')->default(false);
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
