<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title', 'excerpt', 'content', 'author', 'date', 'featuredImage',
        'tags', 'category', 'readTime', 'likes', 'comments', 'liked'
    ];
}
