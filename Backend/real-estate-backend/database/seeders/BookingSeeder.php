<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        Booking::create([
            'user_id' => 2, 
            'property_id' => 2, 
            'booking_date' => '2025-03-25',
            'visit_date' => '2025-03-26',
            'status' => 'pending', 
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Booking::create([
            'user_id' => 2, 
            'property_id' => 3,
            'booking_date' => '2025-03-26',
            'visit_date' => '2025-03-27',
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}