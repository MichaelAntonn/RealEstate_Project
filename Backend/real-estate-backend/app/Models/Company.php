<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $primaryKey = 'company_id';

    protected $fillable = [
        'company_name',
        'commercial_registration_number',
        'company_email',
        'company_phone_number',
        'company_address',
        'commercial_registration_doc',
        'real_estate_license_doc',
        'tax_card_doc',
        'proof_of_address_doc',
        'years_in_real_estate',
        'company_website',
        'date_of_establishment',
        'password',
        'accept_terms',
        'verification_status',
    ];

    protected $hidden = [
        'password', 
    ];
}