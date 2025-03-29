<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        Booking::create([
            'user_id' => 2, // Ahmed (Buyer)
            'property_id' => 2, // Cozy Apartment
            'booking_date' => '2025-03-25',
            'visit_date' => '2025-03-26',
            'status' => 'pending', // بدل under_review
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Booking::create([
            'user_id' => 2, // Ahmed (Buyer)
            'property_id' => 3, // Office Space
            'booking_date' => '2025-03-26',
            'visit_date' => '2025-03-27',
            'status' => 'confirmed', // بدل accepted
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}