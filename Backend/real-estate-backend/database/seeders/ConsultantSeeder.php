<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConsultantSeeder extends Seeder
{
    public function run()
    {
        $consultants = [
            [
                'full_name' => 'Eng. Mohamed Youssef',
                'email' => 'mohamed.youssef@consulting.com',
                'phone' => '01012345678',
                'type' => 'Architect',
                'message' => 'Looking to consult on a new residential project in New Cairo.',
                'seen' => false,
            ],
            [
                'full_name' => 'Eng. Salma Adel',
                'email' => 'salma.adel@designhub.com',
                'phone' => '01123456789',
                'type' => 'Interior Designer',
                'message' => 'I would like to offer interior design consultation services for villas.',
                'seen' => true,
            ],
            [
                'full_name' => 'Dr. Ahmed Hany',
                'email' => 'ahmed.hany@urbanplan.org',
                'phone' => '01234567890',
                'type' => 'Urban Planner',
                'message' => 'Interested in participating in real estate development consultations.',
                'seen' => false,
            ],
            [
                'full_name' => 'Eng. Dina Mahmoud',
                'email' => 'dina.mahmoud@consultme.com',
                'phone' => '01087654321',
                'type' => 'Structural Engineer',
                'message' => 'Available for structural analysis and site consultation in Alexandria.',
                'seen' => true,
            ],
            [
                'full_name' => 'Mr. Yasser Fathy',
                'email' => 'yasser.fathy@bizadvisor.com',
                'phone' => '01555555555',
                'type' => 'Real Estate Advisor',
                'message' => 'I help companies select profitable investment properties.',
                'seen' => false,
            ],
        ];

        DB::table('consultants')->insert($consultants);
    }
}
