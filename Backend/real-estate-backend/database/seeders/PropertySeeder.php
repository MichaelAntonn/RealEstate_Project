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
            'description' => 'A spacious villa with a pool and garden.',
            'type' => 'villa', // Matches ENUM
            'price' => 5000000.00,
            'commission' => 5000000.00 * 0.05, // 5% commission
            'city' => 'Cairo',
            'district' => 'New Cairo',
            'full_address' => '123 Palm Street, New Cairo',
            'area' => 350,
            'bedrooms' => 5,
            'bathrooms' => 4,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'pending', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2018,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['pool', 'garden', 'garage']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'properties/villa1.jpg',
            'property_code' => 'PROP001',
            'user_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Downtown Apartment',
            'slug' => 'downtown-apartment',
            'description' => 'Modern apartment in the heart of the city.',
            'type' => 'apartment', // Matches ENUM
            'price' => 1200000.00,
            'commission' => 1200000.00 * 0.02, // 2% commission
            'city' => 'Alexandria',
            'district' => 'Downtown',
            'full_address' => '45 Sea View Rd, Alexandria',
            'area' => 120,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_rent', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2020,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['balcony', 'security']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/apartment1.jpg',
            'property_code' => 'PROP002',
            'user_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Beachfront Land',
            'slug' => 'beachfront-land',
            'description' => 'Prime land with sea view.',
            'type' => 'land', // Matches ENUM
            'price' => 800000.00,
            'commission' => null,
            'city' => 'North Coast',
            'district' => 'Sahel',
            'full_address' => 'Sahel Beach Resort, North Coast',
            'area' => 90,
            'bedrooms' => null, // Land has no bedrooms
            'bathrooms' => null, // Land has no bathrooms
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'rejected', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => null, // Land has no building year
            'legal_status' => 'pending', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['beach access']),
            'payment_options' => json_encode(['installments']),
            'cover_image' => 'properties/land1.jpg',
            'property_code' => 'PROP003',
            'user_id' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Office in Giza',
            'slug' => 'office-giza',
            'description' => 'Spacious office with modern facilities.',
            'type' => 'office', // Matches ENUM
            'price' => 3500000.00,
            'commission' => 3500000.00 * 0.025,
            'city' => 'Giza',
            'district' => 'Sheikh Zayed',
            'full_address' => '78 Skyline Ave, Sheikh Zayed',
            'area' => 250,
            'bedrooms' => null, // Office has no bedrooms
            'bathrooms' => 3,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'completed', // Matches ENUM
            'building_year' => 2019,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['parking', 'elevator']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'properties/office1.jpg',
            'property_code' => 'PROP004',
            'user_id' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Apartment in Zamalek',
            'slug' => 'apartment-zamalek',
            'description' => 'Compact apartment for rent.',
            'type' => 'apartment', // Matches ENUM
            'price' => 15000.00,
            'commission' => null,
            'city' => 'Cairo',
            'district' => 'Zamalek',
            'full_address' => '12 Nile St, Zamalek',
            'area' => 50,
            'bedrooms' => 1,
            'bathrooms' => 1,
            'listing_type' => 'for_rent', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'pending', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2017,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['elevator']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/apartment2.jpg',
            'property_code' => 'PROP005',
            'user_id' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Villa in Maadi',
            'slug' => 'villa-maadi',
            'description' => 'Spacious villa for families.',
            'type' => 'villa', // Matches ENUM
            'price' => 2000000.00,
            'commission' => 2000000.00 * 0.02,
            'city' => 'Cairo',
            'district' => 'Maadi',
            'full_address' => '33 Green Rd, Maadi',
            'area' => 200,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2016,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['garden', 'parking']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'properties/villa2.jpg',
            'property_code' => 'PROP006',
            'user_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Apartment in Heliopolis',
            'slug' => 'apartment-heliopolis',
            'description' => 'Modern apartment with great views.',
            'type' => 'apartment', // Matches ENUM
            'price' => 2500000.00,
            'commission' => 2500000.00 * 0.025,
            'city' => 'Cairo',
            'district' => 'Heliopolis',
            'full_address' => '19 Sunrise St, Heliopolis',
            'area' => 180,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'under_construction', // Matches ENUM
            'approval_status' => 'pending', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2021,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['balcony', 'security']),
            'payment_options' => json_encode(['installments']),
            'cover_image' => 'properties/apartment3.jpg',
            'property_code' => 'PROP007',
            'user_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Land in Sharm',
            'slug' => 'land-sharm',
            'description' => 'Prime land near the beach.',
            'type' => 'land', // Matches ENUM
            'price' => 900000.00,
            'commission' => null,
            'city' => 'Sharm El Sheikh',
            'district' => 'Naama Bay',
            'full_address' => '7 Coral Lane, Naama Bay',
            'area' => 100,
            'bedrooms' => null,
            'bathrooms' => null,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'rejected', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => null,
            'legal_status' => 'pending', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['beach access']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/land2.jpg',
            'property_code' => 'PROP008',
            'user_id' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Apartment in 6th October',
            'slug' => 'apartment-6th-october',
            'description' => 'Affordable apartment for rent.',
            'type' => 'apartment', // Matches ENUM
            'price' => 10000.00,
            'commission' => 10000.00 * 0.015,
            'city' => 'Giza',
            'district' => '6th October',
            'full_address' => '22 Oasis Rd, 6th October',
            'area' => 110,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_rent', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2018,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['parking']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/apartment4.jpg',
            'property_code' => 'PROP009',
            'user_id' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Villa in El Gouna',
            'slug' => 'villa-el-gouna',
            'description' => 'Exclusive villa with lagoon view.',
            'type' => 'villa', // Matches ENUM
            'price' => 6000000.00,
            'commission' => 6000000.00 * 0.03,
            'city' => 'El Gouna',
            'district' => 'Marina',
            'full_address' => '5 Lagoon Dr, El Gouna',
            'area' => 400,
            'bedrooms' => 6,
            'bathrooms' => 5,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'completed', // Matches ENUM
            'building_year' => 2022,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['pool', 'lagoon access', 'garage']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'properties/villa3.jpg',
            'property_code' => 'PROP010',
            'user_id' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Land in Madinaty',
            'slug' => 'land-madinaty',
            'description' => 'Plot in a gated community.',
            'type' => 'land', // Matches ENUM
            'price' => 1800000.00,
            'commission' => null,
            'city' => 'Cairo',
            'district' => 'Madinaty',
            'full_address' => '14 Harmony St, Madinaty',
            'area' => 160,
            'bedrooms' => null,
            'bathrooms' => null,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'pending', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => null,
            'legal_status' => 'unlicensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['security']),
            'payment_options' => json_encode(['installments']),
            'cover_image' => 'properties/land3.jpg',
            'property_code' => 'PROP011',
            'user_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Apartment in Mansoura',
            'slug' => 'apartment-mansoura',
            'description' => 'Cozy apartment near university.',
            'type' => 'apartment', // Matches ENUM
            'price' => 700000.00,
            'commission' => 700000.00 * 0.02,
            'city' => 'Mansoura',
            'district' => 'University District',
            'full_address' => '9 Campus Rd, Mansoura',
            'area' => 95,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'rejected', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2016,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => false,
            'amenities' => json_encode(['elevator']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/apartment5.jpg',
            'property_code' => 'PROP012',
            'user_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Villa in Ain Sokhna',
            'slug' => 'villa-ain-sokhna',
            'description' => 'Relaxing villa with sea view.',
            'type' => 'villa', // Matches ENUM
            'price' => 950000.00,
            'commission' => null,
            'city' => 'Ain Sokhna',
            'district' => 'Stella Di Mare',
            'full_address' => '3 Sea Breeze, Ain Sokhna',
            'area' => 85,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2020,
            'legal_status' => 'licensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['pool', 'beach access']),
            'payment_options' => json_encode(['installments']),
            'cover_image' => 'properties/villa4.jpg',
            'property_code' => 'PROP013',
            'user_id' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Apartment in Hurghada',
            'slug' => 'apartment-hurghada',
            'description' => 'Bright apartment for rent.',
            'type' => 'apartment', // Matches ENUM
            'price' => 12000.00,
            'commission' => 12000.00 * 0.015,
            'city' => 'Hurghada',
            'district' => 'Sahl Hasheesh',
            'full_address' => '17 Coral St, Sahl Hasheesh',
            'area' => 100,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_rent', // Matches ENUM
            'construction_status' => 'under_construction', // Matches ENUM
            'approval_status' => 'pending', // Matches ENUM
            'transaction_status' => 'pending', // Matches ENUM
            'building_year' => 2017,
            'legal_status' => 'pending', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['balcony', 'security']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => 'properties/apartment6.jpg',
            'property_code' => 'PROP014',
            'user_id' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Property::create([
            'title' => 'Villa in Luxor',
            'slug' => 'villa-luxor',
            'description' => 'Historic villa near the Nile.',
            'type' => 'villa', // Matches ENUM
            'price' => 4000000.00,
            'commission' => 4000000.00 * 0.03,
            'city' => 'Luxor',
            'district' => 'East Bank',
            'full_address' => '8 Nile View, Luxor',
            'area' => 320,
            'bedrooms' => 5,
            'bathrooms' => 4,
            'listing_type' => 'for_sale', // Matches ENUM
            'construction_status' => 'available', // Matches ENUM
            'approval_status' => 'accepted', // Matches ENUM
            'transaction_status' => 'completed', // Matches ENUM
            'building_year' => 2015,
            'legal_status' => 'unlicensed', // Matches ENUM
            'furnished' => true,
            'amenities' => json_encode(['garden', 'pool', 'garage']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'properties/villa5.jpg',
            'property_code' => 'PROP015',
            'user_id' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}