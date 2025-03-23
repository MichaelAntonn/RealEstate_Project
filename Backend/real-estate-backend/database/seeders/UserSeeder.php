<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
 
        // Ahmed
        if (!User::where('email', 'ahmed@example.com')->exists()) {
            User::create([
                'first_name' => 'Ahmed',
                'last_name' => 'Mohamed',
                'email' => 'ahmed@example.com',
                'password' => Hash::make('password123'),
                'phone_number' => '0987654322',
                'address' => '456 Buyer St',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Alexandria',
                'email_verified_at' => now(),
                'terms_and_conditions' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Sara
        if (!User::where('email', 'sara@example.com')->exists()) {
            User::create([
                'first_name' => 'Sara',
                'last_name' => 'Ali',
                'email' => 'sara@example.com',
                'password' => Hash::make('password123'),
                'phone_number' => '1122334466',
                'address' => '789 Seller St',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Giza',
                'email_verified_at' => now(),
                'terms_and_conditions' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}