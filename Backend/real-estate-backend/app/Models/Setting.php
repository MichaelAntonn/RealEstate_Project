<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];
    protected $hidden = ['created_at', 'updated_at'];
    
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }
    
    public static function set($key, $value, $group = 'general')
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }
    public static function getCommissionRate()
    {
        return cache()->remember('commission_rate', now()->addDay(), function () {
            return (float) self::get('commission_rate', 0.05);
        });
    }
    
    // And clear cache when updating
    public static function updateCommissionRate($value)
    {
        cache()->forget('commission_rate');
        return self::set('commission_rate', $value, 'financial');
    }
}
