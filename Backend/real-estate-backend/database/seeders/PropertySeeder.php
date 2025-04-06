<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        Property::create([
            'title' => 'Luxury Villa in Cairo',
            'slug' => 'luxury-villa-cairo',
            'description' => 'A beautiful villa with a great view.',
            'type' => 'villa',
            'price' => 5000000.00,
            'commission' => 5000000.00 * 0.05, // 5% commission
            'city' => 'Cairo',
            'district' => 'New Cairo',
            'full_address' => '123 Villa St, New Cairo',
            'area' => 300,
            'bedrooms' => 4,
            'bathrooms' => 3,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'accepted', 
            'transaction_status' => 'completed',
            'building_year' => 2020,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['pool', 'garage', 'garden']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'villa.jpg',
            'property_code' => 'VIL001',
            'user_id' => 3, 
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Cozy Apartment in Alexandria',
            'slug' => 'cozy-apartment-alexandria',
            'description' => 'A cozy apartment near the sea.',
            'type' => 'apartment',
            'price' => 15000.00,
            'commission' => null, 
            'city' => 'Alexandria',
            'district' => 'Sidi Gaber',
            'full_address' => '456 Sea St, Sidi Gaber',
            'area' => 120,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_rent',
            'construction_status' => 'available', 
            'approval_status' => 'accepted', 
            'transaction_status' => 'pending',
            'building_year' => 2018,
            'legal_status' => 'licensed',
            'furnished' => false,
            'amenities' => json_encode(['balcony']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'apartment.jpg',
            'property_code' => 'APT001',
            'user_id' => 3, 
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Office Space in Giza',
            'slug' => 'office-space-giza',
            'description' => 'Spacious office for businesses.',
            'type' => 'office',
            'price' => 2000000.00,
            'commission' => null, // No commission yet
            'city' => 'Giza',
            'district' => 'Dokki',
            'full_address' => '789 Office St, Dokki',
            'area' => 200,
            'bedrooms' => null,
            'bathrooms' => 2,
            'listing_type' => 'for_sale',
            'construction_status' => 'available', 
            'approval_status' => 'pending', 
            'transaction_status' => 'pending',
            'building_year' => 2015,
            'legal_status' => 'pending',
            'furnished' => false,
            'amenities' => json_encode(['parking', 'elevator']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'office.jpg',
            'property_code' => 'OFF001',
            'user_id' => 3, // Sara (Seller)
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}