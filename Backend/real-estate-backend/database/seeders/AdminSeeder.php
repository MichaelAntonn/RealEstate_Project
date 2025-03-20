<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::create([
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'email' => 'admin@admin.com',
            'phone_number' => '1234567890',
            'country' => 'USA',
            'city' => 'New York',
            'address' => '123 Admin St',
            'terms_and_conditions' => true,
            'email_verified_at' => now(),
            'password' => Hash::make('admin12345'),
            'user_type' => 'super-admin',
            
        ]);
    }
}
