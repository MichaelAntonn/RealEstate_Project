<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies'; // تحديد اسم الجدول صراحةً

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
        'logo',
        'rejection_reason',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'accept_terms' => 'boolean', // التعامل مع accept_terms كـ boolean
        'date_of_establishment' => 'date', // التعامل مع date_of_establishment كتاريخ
        'verification_status' => 'string', // التأكد من أن verification_status يُعامل كنص
        'has_used_trial' => 'boolean',
    ];

    protected $dates = [
        'date_of_establishment', // التأكد من تحويل التاريخ بشكل صحيح
        'created_at',
        'updated_at',
    ];
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
    


}