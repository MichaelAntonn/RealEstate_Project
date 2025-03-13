<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens;

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