<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\User;
use App\Models\Property;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing bookings
        Booking::truncate();

        // Get all regular users (non-admin)
        $regularUsers = User::whereNotIn('user_type', ['super_admin', 'admin'])->pluck('id');
        
        // Get all properties
        $properties = Property::all();

        // Create bookings with proper relationships
        $bookings = [
            // Pending bookings (future visit dates)
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 1)->random()->id, // Property owned by user 1
                'booking_date' => Carbon::now()->subDays(2),
                'visit_date' => Carbon::now()->addDays(5),
                'status' => 'pending',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 2)->random()->id,
                'booking_date' => Carbon::now()->subDays(1),
                'visit_date' => Carbon::now()->addDays(3),
                'status' => 'pending',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 1)->random()->id,
                'booking_date' => Carbon::now()->subDays(3),
                'visit_date' => Carbon::now()->addDays(7),
                'status' => 'pending',
            ],

            // Confirmed bookings (future visit dates)
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 4)->random()->id,
                'booking_date' => Carbon::now()->subDays(5),
                'visit_date' => Carbon::now()->addDays(2),
                'status' => 'confirmed',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 5)->random()->id,
                'booking_date' => Carbon::now()->subDays(7),
                'visit_date' => Carbon::now()->addDays(1),
                'status' => 'confirmed',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 3)->random()->id,
                'booking_date' => Carbon::now()->subDays(4),
                'visit_date' => Carbon::now()->addDays(4),
                'status' => 'confirmed',
            ],

            // Canceled bookings (past visit dates)
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 2)->random()->id,
                'booking_date' => Carbon::now()->subDays(10),
                'visit_date' => Carbon::now()->subDays(3),
                'status' => 'canceled',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 1)->random()->id,
                'booking_date' => Carbon::now()->subDays(8),
                'visit_date' => Carbon::now()->subDays(2),
                'status' => 'canceled',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 3)->random()->id,
                'booking_date' => Carbon::now()->subDays(6),
                'visit_date' => Carbon::now()->subDays(1),
                'status' => 'canceled',
            ],

            // Completed visits (confirmed status with past visit dates)
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 4)->random()->id,
                'booking_date' => Carbon::now()->subDays(15),
                'visit_date' => Carbon::now()->subDays(5),
                'status' => 'confirmed',
            ],
            [
                'user_id' => $regularUsers->random(),
                'property_id' => $properties->where('user_id', 5)->random()->id,
                'booking_date' => Carbon::now()->subDays(12),
                'visit_date' => Carbon::now()->subDays(4),
                'status' => 'confirmed',
            ],
        ];

        // Create the bookings
        foreach ($bookings as $booking) {
            Booking::create([
                'user_id' => $booking['user_id'],
                'property_id' => $booking['property_id'],
                'booking_date' => $booking['booking_date'],
                'visit_date' => $booking['visit_date'],
                'status' => $booking['status'],
                'created_at' => $booking['booking_date'],
                'updated_at' => $booking['status'] === 'pending' 
                    ? $booking['booking_date'] 
                    : Carbon::parse($booking['booking_date'])->addDays(1),
            ]);
        }

        // Create additional random bookings to ensure pagination works
        for ($i = 0; $i < 15; $i++) {
            $status = ['pending', 'confirmed', 'canceled'][rand(0, 2)];
            $daysAgo = rand(1, 20);
            $daysFuture = rand(1, 14);
            $property = $properties->random();
            
            Booking::create([
                'user_id' => $regularUsers->random(),
                'property_id' => $property->id,
                'booking_date' => Carbon::now()->subDays($daysAgo),
                'visit_date' => $status === 'canceled' 
                    ? Carbon::now()->subDays(rand(1, 5)) 
                    : Carbon::now()->addDays($daysFuture),
                'status' => $status,
                'created_at' => Carbon::now()->subDays($daysAgo),
                'updated_at' => $status === 'pending' 
                    ? Carbon::now()->subDays($daysAgo)
                    : Carbon::now()->subDays($daysAgo - 1),
            ]);
        }
    }
}