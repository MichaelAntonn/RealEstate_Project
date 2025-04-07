<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'PropertyID',
        'MediaURL',
        'MediaType'
    ];

    public function property()
    {
        return $this->belongsTo(Property::class, 'PropertyID');
    }
}
