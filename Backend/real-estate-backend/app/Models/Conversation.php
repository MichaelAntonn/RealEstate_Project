<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
// app/Models/Conversation.php
public function messages() {
    return $this->hasMany(Message::class);
}}
