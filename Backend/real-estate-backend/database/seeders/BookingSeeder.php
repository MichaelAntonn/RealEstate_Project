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
         // Booking for Luxury Villa in Cairo (PROP001)
         Booking::create([
            'user_id' => 4, // Matches user who owns PROP001
            'property_id' => 1, // PROP001
            'booking_date' => '2025-03-20',
            'visit_date' => '2025-04-01',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Downtown Apartment (PROP002)
        Booking::create([
            'user_id' => 5, // Matches user who owns PROP002
            'property_id' => 2, // PROP002
            'booking_date' => '2025-03-22',
            'visit_date' => '2025-04-03',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Beachfront Land (PROP003)
        Booking::create([
            'user_id' => 6, // Matches user who owns PROP003
            'property_id' => 3, // PROP003
            'booking_date' => '2025-03-23',
            'visit_date' => '2025-04-05',
            'status' => 'canceled', // Fixed from 'cancelled'
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Office in Giza (PROP004)
        Booking::create([
            'user_id' => 7, // Matches user who owns PROP004
            'property_id' => 4, // PROP004
            'booking_date' => '2025-03-25',
            'visit_date' => '2025-04-07',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Apartment in Zamalek (PROP005)
        Booking::create([
            'user_id' =>8, // Matches user who owns PROP005
            'property_id' => 5, // PROP005
            'booking_date' => '2025-03-27',
            'visit_date' => '2025-04-09',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Villa in Maadi (PROP006)
        Booking::create([
            'user_id' => 4, // Different user booking PROP006
            'property_id' => 6, // PROP006
            'booking_date' => '2025-03-29',
            'visit_date' => null, // No visit scheduled yet
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Apartment in Heliopolis (PROP007)
        Booking::create([
            'user_id' => 4,
            'property_id' => 7, // PROP007
            'booking_date' => '2025-03-31',
            'visit_date' => '2025-04-12',
            'status' => 'canceled',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Land in Sharm (PROP008)
        Booking::create([
            'user_id' => 5,
            'property_id' => 8, // PROP008
            'booking_date' => '2025-04-02',
            'visit_date' => '2025-04-14',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Apartment in 6th October (PROP009)
        Booking::create([
            'user_id' => 5,
            'property_id' => 9, // PROP009
            'booking_date' => '2025-04-04',
            'visit_date' => '2025-04-16',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Villa in El Gouna (PROP010)
        Booking::create([
            'user_id' => 6,
            'property_id' => 10, // PROP010
            'booking_date' => '2025-04-06',
            'visit_date' => '2025-04-18',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Land in Madinaty (PROP011)
        Booking::create([
            'user_id' => 7,
            'property_id' => 11, // PROP011
            'booking_date' => '2025-04-08',
            'visit_date' => null,
            'status' => 'canceled',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Apartment in Mansoura (PROP012)
        Booking::create([
            'user_id' => 8,
            'property_id' => 12, // PROP012
            'booking_date' => '2025-04-10',
            'visit_date' => '2025-04-20',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Villa in Ain Sokhna (PROP013)
        Booking::create([
            'user_id' => 4,
            'property_id' => 13, // PROP013
            'booking_date' => '2025-04-12',
            'visit_date' => '2025-04-22',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Apartment in Hurghada (PROP014)
        Booking::create([
            'user_id' => 5,
            'property_id' => 14, // PROP014
            'booking_date' => '2025-04-14',
            'visit_date' => '2025-04-24',
            'status' => 'canceled',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Booking for Villa in Luxor (PROP015)
        Booking::create([
            'user_id' => 8,
            'property_id' => 15, // PROP015
            'booking_date' => '2025-04-16',
            'visit_date' => '2025-04-26',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        }
    }
