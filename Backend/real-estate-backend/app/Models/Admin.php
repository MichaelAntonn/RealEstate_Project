<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use HasApiTokens,Notifiable;
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'country',
        'city',
        'address',
        'terms_and_conditions',
        'password',
        'profile_image',

    ];
    // Use the same table as users
    protected $table = 'users';

    // Ensure the 'user_type' attribute is cast to a string
    protected $casts = [
        'user_type' => 'string',
    ];

    // Default attributes
    protected $attributes = [
        'user_type' => 'admin',
    ];

    // Scope to filter admin users
    public function scopeIsAdmin($query)
    {
        return $query->where('user_type', 'admin');
    }


}
