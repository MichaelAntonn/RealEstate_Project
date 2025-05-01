<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        Property::create([
            'title' => 'Luxury Villa for Sale in New Cairo',
            'slug' => 'villa-sale-new-cairo',
            'description' => 'A luxurious villa located in a prime area in New Cairo, featuring 5 bedrooms and 6 bathrooms.',
            'type' => 'villa',
            'price' => 5000000,  // Price
            'city' => 'Cairo',
            'district' => 'New Cairo',
            'full_address' => 'Street 123, New Cairo, Egypt',
            'area' => 350,  // Area in square meters
            'bedrooms' => 5,
            'bathrooms' => 6,
            'listing_type' => 'for_sale',  // For sale
            'construction_status' => 'available',  // Ready for move-in
            'approval_status' => 'accepted',  // Pending approval
            'transaction_status' => 'pending',
            'building_year' => 2020,
            'legal_status' => 'licensed',  // Licensed
            'furnished' => true,  // Furnished
            'amenities' => json_encode(['Swimming Pool', 'Garden', 'Garage']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => 'villa_cover_image.jpg',  // Cover image
            'property_code' => 'VILLA-1234',  // Property code
            'latitude' => 30.033,  // Latitude for the location
            'longitude' => 31.210,  // Longitude for the location
            'user_id' => 1,  // Assuming user with ID 1 exists
        ]);
    
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
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
            'cover_image' => null,
            'property_code' => 'PROP015',
            'user_id' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // new seeds
        Property::create([
            'title' => 'Seafront Penthouse in Montaza',
            'slug' => 'seafront-penthouse-montaza',
            'description' => 'Stunning 300m² penthouse with panoramic sea views, 3 bedrooms, and private terrace.',
            'type' => 'apartment',
            'price' => 8500000.00,
            'commission' => 8500000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Montaza',
            'full_address' => '45 Corniche Street, Montaza',
            'area' => 300,
            'bedrooms' => 3,
            'bathrooms' => 3,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'transaction_status' => 'pending',
            'building_year' => 2023,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['sea_view', 'elevator', 'parking']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX001',
            'user_id' => 2,
        ]);

        Property::create([
            'title' => 'Modern Apartment in Smouha',
            'slug' => 'modern-apartment-smouha',
            'description' => '120m² apartment in quiet residential area, 2 bedrooms, recently renovated.',
            'type' => 'apartment',
            'price' => 2500000.00,
            'commission' => 2500000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Smouha',
            'full_address' => '12 Mohamed Naguib Street, Smouha',
            'area' => 120,
            'bedrooms' => 2,
            'bathrooms' => 2,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2015,
            'legal_status' => 'licensed',
            'furnished' => false,
            'amenities' => json_encode(['balcony', 'security']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => null,
            'property_code' => 'ALX002',
            'user_id' => 3,
        ]);

        Property::create([
            'title' => 'Furnished Studio for Rent in Gleem',
            'slug' => 'furnished-studio-gleem',
            'description' => 'Cozy 50m² studio near Stanley Bridge, fully furnished with utilities included.',
            'type' => 'apartment',
            'price' => 5000.00, // Monthly rent
            'commission' => 5000.00 * 1, // 1 month rent as commission
            'city' => 'Alexandria',
            'district' => 'Gleem',
            'full_address' => '8 Ahmed Orabi Street, Gleem',
            'area' => 50,
            'bedrooms' => 1,
            'bathrooms' => 1,
            'listing_type' => 'for_rent',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2018,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['wifi', 'ac', 'furnished']),
            'payment_options' => json_encode(['bank_transfer']),
            'cover_image' => null,
            'property_code' => 'ALX003',
            'user_id' => 4,
        ]);

        Property::create([
            'title' => 'Office Space in Downtown',
            'slug' => 'office-space-downtown',
            'description' => '200m² office space in central business district, ready for immediate use.',
            'type' => 'office',
            'price' => 3500000.00,
            'commission' => 3500000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Downtown',
            'full_address' => '22 Saad Zaghloul Street, Downtown',
            'area' => 200,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'pending',
            'building_year' => 2010,
            'legal_status' => 'licensed',
            'amenities' => json_encode(['elevator', 'security', 'parking']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => null,
            'property_code' => 'ALX004',
            'user_id' => 5,
        ]);

        Property::create([
            'title' => 'Residential Plot in Borg El Arab',
            'slug' => 'residential-plot-borg-el-arab',
            'description' => '1000m² plot in developing area, suitable for residential project.',
            'type' => 'land',
            'price' => 3000000.00,
            'commission' => 3000000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Borg El Arab',
            'full_address' => 'Plot 45, District 5, Borg El Arab',
            'area' => 1000,
            'listing_type' => 'for_sale',
            'construction_status' => 'under_construction',
            'approval_status' => 'accepted',
            'legal_status' => 'licensed',
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX005',
            'user_id' => 2,
        ]);

        Property::create([
            'title' => 'Heritage Villa in Raml Station',
            'slug' => 'heritage-villa-raml',
            'description' => '400m² historic villa with original architectural features, 5 bedrooms.',
            'type' => 'villa',
            'price' => 12000000.00,
            'commission' => 12000000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Raml Station',
            'full_address' => '15 Salah Salem Street, Raml Station',
            'area' => 400,
            'bedrooms' => 5,
            'bathrooms' => 4,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2023,
            'legal_status' => 'licensed',
            'amenities' => json_encode(['garden', 'historic']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX006',
            'user_id' => 2,
        ]);

        Property::create([
            'title' => 'Beach villa in Mamoura',
            'slug' => 'beach-villa-mamoura',
            'description' => 'Direct beach access, 2 bedrooms, private garden, perfect for vacations.',
            'type' => 'villa',
            'price' => 7500.00, // Monthly rent
            'commission' => 7500.00 * 1,
            'city' => 'Alexandria',
            'district' => 'Mamoura',
            'full_address' => 'villa 12, Mamoura Beach',
            'area' => 90,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'listing_type' => 'for_rent',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2015,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['beach_access', 'furnished']),
            'payment_options' => json_encode(['bank_transfer']),
            'cover_image' => null,
            'property_code' => 'ALX007',
            'user_id' => 3,
        ]);

        Property::create([
            'title' => 'Premium Office Space in San Stefano',
            'slug' => 'premium-office-san-stefano',
            'description' => '150m² modern office with sea view, AC, and high-speed internet included.',
            'type' => 'office',
            'price' => 18000.00, // Monthly rent
            'commission' => 18000.00 * 1,
            'city' => 'Alexandria',
            'district' => 'San Stefano',
            'full_address' => 'San Stefano Grand Plaza, Office 302',
            'area' => 150,
            'listing_type' => 'for_rent',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2019,
            'legal_status' => 'licensed',
            'amenities' => json_encode(['sea_view', 'ac', 'internet', 'elevator']),
            'payment_options' => json_encode(['bank_transfer']),
            'cover_image' => null,
            'property_code' => 'ALX008',
            'user_id' => 4,
        ]);

        Property::create([
            'title' => 'Spacious 3-Bedroom in Loran',
            'slug' => 'spacious-3bedroom-loran',
            'description' => '180m² family apartment near schools and parks, semi-furnished.',
            'type' => 'apartment',
            'price' => 3200000.00,
            'commission' => 3200000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Loran',
            'full_address' => '25 Gamal Abdel Nasser Street, Loran',
            'area' => 180,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'pending',
            'building_year' => 2012,
            'legal_status' => 'licensed',
            'furnished' => false,
            'amenities' => json_encode(['balcony', 'parking']),
            'payment_options' => json_encode(['cash', 'installments']),
            'cover_image' => null,
            'property_code' => 'ALX009',
            'user_id' => 5,
        ]);

        Property::create([
            'title' => 'Affordable Student Studio near University',
            'slug' => 'student-studio-sidi-gaber',
            'description' => '40m² studio 5 mins from Alexandria University, utilities included.',
            'type' => 'apartment',
            'price' => 2500.00, // Monthly rent
            'commission' => 2500.00 * 1,
            'city' => 'Alexandria',
            'district' => 'Sidi Gaber',
            'full_address' => '18 Al Horreya Road, Sidi Gaber',
            'area' => 40,
            'bedrooms' => 1,
            'bathrooms' => 1,
            'listing_type' => 'for_rent',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2010,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['wifi', 'furnished']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX010',
            'user_id' => 1,
        ]);

        Property::create([
            'title' => 'Luxury Stanley Penthouse with Private Pool',
            'slug' => 'luxury-penthouse-stanley',
            'description' => '350m² duplex penthouse with private pool and 360° sea views.',
            'type' => 'apartment',
            'price' => 15000000.00,
            'commission' => 15000000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Stanley',
            'full_address' => 'Stanley Tower, Penthouse Floor',
            'area' => 350,
            'bedrooms' => 4,
            'bathrooms' => 4,
            'listing_type' => 'for_sale',
            'construction_status' => 'available',
            'approval_status' => 'accepted',
            'building_year' => 2021,
            'legal_status' => 'licensed',
            'furnished' => true,
            'amenities' => json_encode(['pool', 'gym', 'security', 'smart_home']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX011',
            'user_id' => 2,
        ]);

        Property::create([
            'title' => '10 Acre Fertile Land in Abis',
            'slug' => 'agricultural-land-abis',
            'description' => '10 acre plot with water access, ideal for farming or greenhouse projects.',
            'type' => 'land',
            'price' => 2500000.00,
            'commission' => 2500000.00 * 0.05,
            'city' => 'Alexandria',
            'district' => 'Abis',
            'full_address' => 'Plot 89, Abis Agricultural Zone',
            'area' => 42000, // 10 acres ≈ 42,000 m²
            'listing_type' => 'for_sale',
            'construction_status' => 'under_construction',
            'approval_status' => 'pending',
            'legal_status' => 'licensed',
            'amenities' => json_encode(['water_access']),
            'payment_options' => json_encode(['cash']),
            'cover_image' => null,
            'property_code' => 'ALX013',
            'user_id' => 4,
        ]);

    }}