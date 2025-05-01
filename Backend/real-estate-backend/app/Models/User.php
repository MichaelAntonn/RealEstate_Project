<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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
        'user_type',
        'profile_image',
        'has_used_trial'
    ];
    /**
     * Get the properties owned by the user.
     */
    public function properties()
    {
        return $this->hasMany(Property::class);
    }
    public function favorites()
{
    return $this->belongsToMany(Property::class, 'favorites')->withTimestamps();
}

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'terms_and_conditions',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    protected $casts = [
        'has_used_trial' => 'boolean',
    ];
    
    /**
     * Define the broadcast channel name for notifications.
     *
     * @return string
     */
    public function receivesBroadcastNotificationsOn()
    {
        return 'Notifications.' . $this->id;
    }

    public function subscriptions()
{
    return $this->hasMany(Subscription::class, 'user_id');
}

}
