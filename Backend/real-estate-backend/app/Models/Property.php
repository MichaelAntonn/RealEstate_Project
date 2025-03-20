<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'description',
        'type',
        'price',
        'city',
        'district',
        'full_address',
        'area',
        'bedrooms',
        'bathrooms',
        'listing_type',
        'construction_status',
        'approval_status', 
        'transaction_status',
        'building_year',
        'legal_status',
        'furnished',
        'amenities',
        'payment_options',
        'cover_image',
        'property_code',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amenities' => 'array',
        'payment_options' => 'array',
        'furnished' => 'boolean',
        'building_year' => 'integer',
        'area' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Get the user that owns the property.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
