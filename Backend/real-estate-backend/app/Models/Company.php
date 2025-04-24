<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens; // ✅ ضروري لـ Sanctum
use Illuminate\Foundation\Auth\User as Authenticatable; // ✅ لازم يمتد من ده علشان التوكن يشتغل

class Company extends Authenticatable // ✅ تغيير من Model إلى Authenticatable
{
    use HasApiTokens; // ✅ لتفعيل إنشاء التوكنات

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
        'accept_terms' => 'boolean',
        'date_of_establishment' => 'date',
        'verification_status' => 'string',
        'has_used_trial' => 'boolean',
    ];

    protected $dates = [
        'date_of_establishment',
        'created_at',
        'updated_at',
    ];
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
}