<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'plan_id', 'plan_name', 'price', 'duration_in_days',
        'starts_at', 'ends_at', 'status','auto_renew','payment_gateway', 'payment_reference', 'last_payment_attempt'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function getStatusLabelAttribute()
    {
        if ($this->ends_at && $this->ends_at < now()) {
            return 'expired';
        }
        return $this->status;
    }
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function isPaid()
    {
        return $this->payments()->where('status', 'completed')->exists();
    }

    public function isActive()
    {
        return $this->status === 'active' && $this->isPaid();
    }
}
