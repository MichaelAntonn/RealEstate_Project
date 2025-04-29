<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Blog extends Model
{
    protected $fillable = [
        'title', 'excerpt', 'content', 'author', 'date', 'featuredImage',
        'tags', 'category', 'readTime', 'likes', 'comments', 'liked'
    ];
    protected $casts = [
        'tags' => 'array',
    ];
    
    public function getFeaturedImageUrlAttribute()
    {
        return $this->featuredImage ? Storage::url($this->featuredImage) : null;
    }
}
