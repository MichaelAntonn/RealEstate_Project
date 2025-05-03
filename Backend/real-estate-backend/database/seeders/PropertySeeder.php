<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PropertySeeder extends Seeder
{
    // Egyptian cities and districts
    private $cities = [
        'Cairo' => [
            'districts' => ['Nasr City', 'Maadi', 'Zamalek', 'Heliopolis', '6th of October', 'New Cairo', 'Downtown', 'Giza'],
            'latitude' => 30.0444,
            'longitude' => 31.2357
        ],
        'Alexandria' => [
            'districts' => ['Montaza', 'Smouha', 'Roushdy', 'Sidi Gaber', 'Miami'],
            'latitude' => 31.2001,
            'longitude' => 29.9187
        ],
        'Giza' => [
            'districts' => ['Dokki', 'Mohandessin', 'Agouza', 'Haram', 'Faisal'],
            'latitude' => 29.9870,
            'longitude' => 31.2118
        ],
        'Luxor' => [
            'districts' => ['Karnak', 'Luxor City', 'Al Bayadieh'],
            'latitude' => 25.6872,
            'longitude' => 32.6396
        ],
        'Aswan' => [
            'districts' => ['Aswan City', 'Elephantine'],
            'latitude' => 24.0889,
            'longitude' => 32.8998
        ],
        'Sharm El Sheikh' => [
            'districts' => ['Naama Bay', 'Ras Um Sid', 'Hadaba'],
            'latitude' => 27.9158,
            'longitude' => 34.3300
        ],
    ];

    // Amenities options
    private $amenities = [
        'Swimming Pool', 'Garden', 'Parking', 'Elevator', 'Security', 
        'Balcony', 'Terrace', 'Fitness Center', 'Playground', '24/7 Water',
        'Natural Gas', 'Satellite', 'Internet', 'Air Conditioning'
    ];

    // Payment options
    private $paymentOptions = [
        'Cash', 'Installments', 'Bank Transfer', 'Cheque'
    ];

    public function run()
    {
        // Land for sale (12 properties)
        $this->createProperties('land', 'for_sale', 12);

        // Apartment for sale (12 properties)
        $this->createProperties('apartment', 'for_sale', 12);

        // Villa for sale (12 properties)
        $this->createProperties('villa', 'for_sale', 12);

        // Office for sale (12 properties)
        $this->createProperties('office', 'for_sale', 12);

        // Land for rent (12 properties)
        $this->createProperties('land', 'for_rent', 12);

        // Apartment for rent (12 properties)
        $this->createProperties('apartment', 'for_rent', 12);

        // Villa for rent (12 properties)
        $this->createProperties('villa', 'for_rent', 12);

        // Office for rent (12 properties)
        $this->createProperties('office', 'for_rent', 12);
    }

    private function createProperties($type, $listingType, $count)
    {
        for ($i = 1; $i <= $count; $i++) {
            $city = array_rand($this->cities);
            $district = $this->cities[$city]['districts'][array_rand($this->cities[$city]['districts'])];
            
            $price = $this->generatePrice($type, $listingType);
            $area = $this->generateArea($type);
            // Generate random coordinates near the city center
            $latitude = $this->cities[$city]['latitude'] + (rand(-500, 500) / 10000);
            $longitude = $this->cities[$city]['longitude'] + (rand(-500, 500) / 10000);
            $property = Property::create([
                'title' => $this->generateTitle($type, $listingType, $city),
                'slug' => Str::slug($this->generateTitle($type, $listingType, $city) . '-' . uniqid()),
                'description' => $this->generateDescription($type, $listingType, $city, $district),
                'type' => $type,
                'price' => $price,
                'city' => $city,
                'district' => $district,
                'full_address' => $this->generateAddress($district),
                'area' => $area,
                'bedrooms' => in_array($type, ['apartment', 'villa']) ? rand(1, 5) : null,
                'bathrooms' => in_array($type, ['apartment', 'villa']) ? rand(1, 3) : null,
                'listing_type' => $listingType,
                'construction_status' => $type === 'land' ? 'available' : (rand(0, 1) ? 'available' : 'under_construction'),
                'approval_status' => 'accepted',
                'transaction_status' => 'pending',
                'building_year' => $type !== 'land' ? rand(1990, 2023) : null,
                'legal_status' => $this->getRandomLegalStatus(),
                'furnished' => in_array($type, ['apartment', 'villa', 'office']) ? rand(0, 1) : false,
                'amenities' => $this->getRandomAmenities(),
                'payment_options' => $this->getRandomPaymentOptions(),
                'cover_image' => null, // Will be set after creating the property
                'property_code' => 'PROP-' . strtoupper(Str::random(3)) . '-' . rand(1000, 9999),
                'user_id' => rand(4, 8),
                'latitude' => $latitude,
                'longitude' => $longitude, // Assuming you have at least 10 users
            ]);

            $property->save();

        }
    }

    private function generateTitle($type, $listingType, $city)
    {
        $typeNames = [
            'land' => 'Land',
            'apartment' => 'Apartment',
            'villa' => 'Villa',
            'office' => 'Office Space'
        ];

        $action = $listingType === 'for_sale' ? 'For Sale' : 'For Rent';
        
        $features = [
            'Luxurious', 'Modern', 'Spacious', 'Cozy', 'Elegant', 
            'Premium', 'Beautiful', 'Excellent', 'Prime', 'Unique'
        ];

        $locations = [
            'in ' . $city,
            'in ' . $city . ' City',
            'near Downtown ' . $city,
            'in the heart of ' . $city,
            'in prestigious area of ' . $city
        ];

        return $features[array_rand($features)] . ' ' . $typeNames[$type] . ' ' . $action . ' ' . $locations[array_rand($locations)];
    }

    private function generateDescription($type, $listingType, $city, $district)
    {
        $typeNames = [
            'land' => 'land plot',
            'apartment' => 'apartment',
            'villa' => 'villa',
            'office' => 'office space'
        ];

        $descriptions = [
            "This wonderful $typeNames[$type] is located in the prestigious $district district of $city. It offers a great opportunity for " . ($listingType === 'for_sale' ? 'ownership' : 'rental') . " in one of the most sought-after areas.",
            "Beautiful $typeNames[$type] available for " . ($listingType === 'for_sale' ? 'sale' : 'rent') . " in $district, $city. Don't miss this chance to own a property in this prime location.",
            "This $typeNames[$type] is situated in the heart of $district, $city. It's a perfect choice for those looking for a " . ($listingType === 'for_sale' ? 'permanent investment' : 'temporary residence') . " in a great neighborhood.",
            "Exceptional $typeNames[$type] for " . ($listingType === 'for_sale' ? 'sale' : 'rent') . " in $city's $district area. The property is well-maintained and ready for immediate " . ($listingType === 'for_sale' ? 'purchase' : 'occupancy') . ".",
            "Prime location $typeNames[$type] available in $district, $city. This property represents an excellent " . ($listingType === 'for_sale' ? 'investment opportunity' : 'rental option') . " in a growing area."
        ];

        return $descriptions[array_rand($descriptions)];
    }

    private function generateAddress($district)
    {
        $streets = [
            'Main Street', 'Nile Street', 'Corniche', 'Garden Street', 
            'Palace Avenue', 'Mohamed Mazhar Street', 'El Tahrir Street'
        ];

        return rand(10, 200) . ' ' . $streets[array_rand($streets)] . ', ' . $district;
    }

    private function generatePrice($type, $listingType)
    {
        // Prices in EGP (Egyptian Pounds)
        $prices = [
            'land' => [
                'for_sale' => rand(500000, 5000000),
                'for_rent' => rand(5000, 50000)
            ],
            'apartment' => [
                'for_sale' => rand(1000000, 8000000),
                'for_rent' => rand(3000, 20000)
            ],
            'villa' => [
                'for_sale' => rand(3000000, 15000000),
                'for_rent' => rand(10000, 50000)
            ],
            'office' => [
                'for_sale' => rand(2000000, 10000000),
                'for_rent' => rand(8000, 40000)
            ]
        ];

        return $prices[$type][$listingType];
    }

    private function generateArea($type)
    {
        // Area in square meters
        $areas = [
            'land' => rand(100, 2000),
            'apartment' => rand(80, 300),
            'villa' => rand(200, 600),
            'office' => rand(50, 500)
        ];

        return $areas[$type];
    }

    private function getRandomLegalStatus()
    {
        $statuses = ['licensed', 'unlicensed', 'pending'];
        return $statuses[array_rand($statuses)];
    }

    private function getRandomAmenities()
    {
        $count = rand(3, 8);
        shuffle($this->amenities);
        return array_slice($this->amenities, 0, $count);
    }

    private function getRandomPaymentOptions()
    {
        $count = rand(1, 3);
        shuffle($this->paymentOptions);
        return array_slice($this->paymentOptions, 0, $count);
    }

  
}