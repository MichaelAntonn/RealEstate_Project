<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'price', 'duration_in_days', 'description', 'features',
    ];

    protected $casts = [
        'is_trial' => 'boolean',
        'features' => 'array',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
 
}
