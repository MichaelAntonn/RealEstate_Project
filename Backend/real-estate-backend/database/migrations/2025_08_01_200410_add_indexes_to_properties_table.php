<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::table('properties', function (Blueprint $table) {
        $table->index('title');
        $table->index('city');
        $table->index('type');
        $table->index('price');
        $table->index('area');
        $table->index('listing_type');
        $table->index('bedrooms');
        $table->index('bathrooms');
    });
}

public function down()
{
    Schema::table('properties', function (Blueprint $table) {
        $table->dropIndex(['title']);
        $table->dropIndex(['city']);
        $table->dropIndex(['type']);
        $table->dropIndex(['price']);
        $table->dropIndex(['area']);
        $table->dropIndex(['listing_type']);
        $table->dropIndex(['bedrooms']);
        $table->dropIndex(['bathrooms']);
    });
}

};
