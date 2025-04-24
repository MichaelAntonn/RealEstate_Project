<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'amount',
        'payment_method',
        'payment_reference',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    // Relationship with the subscription
    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }


    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
