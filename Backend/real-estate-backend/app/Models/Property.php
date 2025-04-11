<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
    protected static function boot()
    {
        parent::boot();

    static::deleting(function($property) {
        if ($property->cover_image) {
            Storage::disk('public')->delete($property->cover_image);
        }

        $property->media->each(function($media) {
            Storage::disk('public')->delete($media->MediaURL);
            $media->delete();
        });

        $directory = 'property_media/' . $property->id;
        if (Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->deleteDirectory($directory);
        }
    });
    }

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
    public function favoritedBy()
{
    return $this->belongsToMany(User::class, 'favorites');
}

}