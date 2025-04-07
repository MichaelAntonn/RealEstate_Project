<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'title', 'slug', 'description', 'type', 'price', 'commission', 
        'city', 'district', 'full_address', 'area', 'bedrooms', 'bathrooms', 
        'listing_type', 'status', 'transaction_status', 'building_year', 
        'legal_status', 'furnished', 'amenities', 'payment_options', 
        'cover_image', 'property_code', 'user_id'
    ];

    protected $casts = [
        'amenities' => 'array',
        'payment_options' => 'array',
        'furnished' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
    public function media()
{
    return $this->hasMany(PropertyMedia::class, 'PropertyID');
}
}