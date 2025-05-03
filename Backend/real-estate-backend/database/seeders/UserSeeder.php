<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            // Super Admin
            [
                'first_name' => 'Mostafa',
                'last_name' => 'El Sayed',
                'email' => 'superadmin@easyestate.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000001',
                'address' => 'Nasr City, Cairo',
                'user_type' => 'super-admin',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Cairo',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // Admin
            [
                'first_name' => 'Ahmed',
                'last_name' => 'Hassan',
                'email' => 'AhmedHassan@easyestate.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000002',
                'address' => 'Alexandria, Egypt',
                'user_type' => 'admin',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Alexandria',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // User 1
            [
                'first_name' => 'Omar',
                'last_name' => 'Youssef',
                'email' => 'OmarYoussef@gmail.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000003',
                'address' => 'Giza, Egypt',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Giza',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // User 2
            [
                'first_name' => 'Salma',
                'last_name' => 'Ali',
                'email' => 'SalmaAli@gmail.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000004',
                'address' => 'Cairo, Egypt',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Cairo',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // User 3
            [
                'first_name' => 'Yara',
                'last_name' => 'Mahmoud',
                'email' => 'YaraMahmoud@gmail.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000005',
                'address' => 'Tanta, Egypt',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Tanta',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // User 4
            [
                'first_name' => 'Mohamed',
                'last_name' => 'Khaled',
                'email' => 'MohamedKhaled@gmail.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000006',
                'address' => 'Zagazig, Egypt',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Zagazig',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],

            // User 5
            [
                'first_name' => 'Nour',
                'last_name' => 'Ibrahim',
                'email' => 'NourIbrahim@gmail.com',
                'password' => Hash::make('password'),
                'phone_number' => '+201000000007',
                'address' => 'Mansoura, Egypt',
                'user_type' => 'user',
                'account_status' => 'active',
                'country' => 'Egypt',
                'city' => 'Mansoura',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'terms_and_conditions' => true,
            ],
        ];

        // Insert all users
        foreach ($users as $userData) {
            User::create($userData);
        }
    }}