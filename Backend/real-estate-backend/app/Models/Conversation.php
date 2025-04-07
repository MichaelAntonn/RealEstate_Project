<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    // الحقول القابلة للتعبئة
    protected $fillable = ['user1_id', 'user2_id', 'property_id', 'start_date', 'last_message_date'];

    // العلاقة مع الرسائل
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // العلاقة مع المستخدم الأول
    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    // العلاقة مع المستخدم الثاني
    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    // العلاقة مع العقار (اختياري، بناءً على حقل property_id)
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    // دالة مساعدة لجلب المشاركين
    public function participants()
    {
        return collect([$this->user1, $this->user2]);
    }
}