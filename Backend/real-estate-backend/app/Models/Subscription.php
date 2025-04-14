<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'company_id', 'plan_name', 'price', 'duration_in_days',
        'starts_at', 'ends_at', 'status',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
    public function plan()
{
    return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
}
public function getStatusAttribute()
{
    if ($this->ends_at < now()) {
        return 'expired';
    }
    return $this->attributes['status'];
}
}
