<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use Illuminate\Support\Facades\Hash;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::create([
            'company_name' => 'Al Fajr Real Estate',
            'commercial_registration_number' => 'CR12345678',
            'company_email' => 'info@alfajr.com',
            'company_phone_number' => '0501234567',
            'company_address' => 'Riyadh, King Fahd Road',
            'commercial_registration_doc' => 'docs/commercial_reg_1.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_1.pdf',
            'tax_card_doc' => 'docs/tax_card_1.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_1.pdf',
            'years_in_real_estate' => 10,
            'company_website' => 'https://www.alfajr.com',
            'date_of_establishment' => '2015-06-01',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => false,
            'verification_status' => 'Pending',
            'logo' => 'logos/logo1.png',
        ]);

        Company::create([
            'company_name' => 'Noor Housing',
            'commercial_registration_number' => 'CR87654321',
            'company_email' => 'contact@noorhousing.com',
            'company_phone_number' => '0559876543',
            'company_address' => 'Jeddah, Palestine Street',
            'commercial_registration_doc' => 'docs/commercial_reg_2.pdf',
            'real_estate_license_doc' => null,
            'tax_card_doc' => 'docs/tax_card_2.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_2.pdf',
            'years_in_real_estate' => 5,
            'company_website' => 'https://www.noorhousing.com',
            'date_of_establishment' => '2019-03-15',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => true,
            'verification_status' => 'Verified',
            'logo' => 'logos/logo2.png',
        ]);

        Company::create([
            'company_name' => 'Tamkeen Real Estate',
            'commercial_registration_number' => 'CR11223344',
            'company_email' => 'support@tamkeen.com',
            'company_phone_number' => '0561234567',
            'company_address' => 'Dammam, Corniche Road',
            'commercial_registration_doc' => 'docs/commercial_reg_3.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_3.pdf',
            'tax_card_doc' => 'docs/tax_card_3.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_3.pdf',
            'years_in_real_estate' => 8,
            'company_website' => 'https://www.tamkeen.com',
            'date_of_establishment' => '2017-08-20',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => false,
            'verification_status' => 'Rejected',
            'logo' => 'logos/logo3.png',
        ]);

        Company::create([
            'company_name' => 'Dar Al Imar',
            'commercial_registration_number' => 'CR44556677',
            'company_email' => 'hello@darimar.com',
            'company_phone_number' => '0579876543',
            'company_address' => 'Al Khobar, Prince Sultan Street',
            'commercial_registration_doc' => 'docs/commercial_reg_4.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_4.pdf',
            'tax_card_doc' => 'docs/tax_card_4.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_4.pdf',
            'years_in_real_estate' => 12,
            'company_website' => 'https://www.darimar.com',
            'date_of_establishment' => '2012-04-10',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => true,
            'verification_status' => 'Verified',
            'logo' => 'logos/logo4.png',
        ]);

        Company::create([
            'company_name' => 'Misk Properties',
            'commercial_registration_number' => 'CR99887766',
            'company_email' => 'admin@miskprops.com',
            'company_phone_number' => '0583344556',
            'company_address' => 'Makkah, Aziziyah',
            'commercial_registration_doc' => 'docs/commercial_reg_5.pdf',
            'real_estate_license_doc' => null,
            'tax_card_doc' => 'docs/tax_card_5.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_5.pdf',
            'years_in_real_estate' => 6,
            'company_website' => 'https://www.miskprops.com',
            'date_of_establishment' => '2018-11-30',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => false,
            'verification_status' => 'Pending',
            'logo' => 'logos/logo5.png',
        ]);

        Company::create([
            'company_name' => 'Al Anoud Development',
            'commercial_registration_number' => 'CR77665544',
            'company_email' => 'info@alanoud.dev',
            'company_phone_number' => '0592233445',
            'company_address' => 'Tabuk, King Abdulaziz Street',
            'commercial_registration_doc' => 'docs/commercial_reg_6.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_6.pdf',
            'tax_card_doc' => 'docs/tax_card_6.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_6.pdf',
            'years_in_real_estate' => 15,
            'company_website' => null,
            'date_of_establishment' => '2009-09-09',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => true,
            'verification_status' => 'Verified',
            'logo' => 'logos/logo6.png',
        ]);

        Company::create([
            'company_name' => 'Future Homes',
            'commercial_registration_number' => 'CR33445566',
            'company_email' => 'contact@futurehomes.sa',
            'company_phone_number' => '0509988776',
            'company_address' => 'Al Ahsa, Hofuf Center',
            'commercial_registration_doc' => 'docs/commercial_reg_7.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_7.pdf',
            'tax_card_doc' => 'docs/tax_card_7.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_7.pdf',
            'years_in_real_estate' => 7,
            'company_website' => 'https://www.futurehomes.sa',
            'date_of_establishment' => '2016-01-22',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => false,
            'verification_status' => 'Pending',
            'logo' => 'logos/logo7.png',
        ]);

        Company::create([
            'company_name' => 'Bayt Al Saadah',
            'commercial_registration_number' => 'CR11221122',
            'company_email' => 'support@baytsaadah.com',
            'company_phone_number' => '0527788990',
            'company_address' => 'Medina, Quba Road',
            'commercial_registration_doc' => 'docs/commercial_reg_8.pdf',
            'real_estate_license_doc' => null,
            'tax_card_doc' => 'docs/tax_card_8.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_8.pdf',
            'years_in_real_estate' => 3,
            'company_website' => null,
            'date_of_establishment' => '2020-02-02',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => true,
            'verification_status' => 'Rejected',
            'logo' => 'logos/logo8.png',
        ]);

        Company::create([
            'company_name' => 'Riyadh Real Estate Group',
            'commercial_registration_number' => 'CR55667788',
            'company_email' => 'info@riyadhgroup.sa',
            'company_phone_number' => '0534455667',
            'company_address' => 'Riyadh, Al Malaz',
            'commercial_registration_doc' => 'docs/commercial_reg_9.pdf',
            'real_estate_license_doc' => 'docs/real_estate_license_9.pdf',
            'tax_card_doc' => 'docs/tax_card_9.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_9.pdf',
            'years_in_real_estate' => 9,
            'company_website' => 'https://www.riyadhgroup.sa',
            'date_of_establishment' => '2014-05-05',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => false,
            'verification_status' => 'Verified',
            'logo' => 'logos/logo9.png',
        ]);

        Company::create([
            'company_name' => 'Afaq Real Estate',
            'commercial_registration_number' => 'CR22334455',
            'company_email' => 'contact@afaqreal.com',
            'company_phone_number' => '0511122334',
            'company_address' => 'Jazan, City Center',
            'commercial_registration_doc' => 'docs/commercial_reg_10.pdf',
            'real_estate_license_doc' => null,
            'tax_card_doc' => 'docs/tax_card_10.pdf',
            'proof_of_address_doc' => 'docs/proof_of_address_10.pdf',
            'years_in_real_estate' => 4,
            'company_website' => 'https://www.afaqreal.com',
            'date_of_establishment' => '2021-07-01',
            'password' => Hash::make('password123'),
            'accept_terms' => true,
            'has_used_trial' => true,
            'verification_status' => 'Pending',
            'logo' => 'logos/logo10.png',
        ]);
    }
}
