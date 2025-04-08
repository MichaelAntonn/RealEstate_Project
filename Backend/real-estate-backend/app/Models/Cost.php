<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'amount', 
        'description', 
        'category', 
        'custom_category', // حقل جديد للفئات المخصصة
        'type', 
        'month', 
        'year'
    ];    
    // أنواع المصاريف الثابتة
    const TYPE_FIXED = 'fixed';
    const TYPE_VARIABLE = 'variable';
    
    
    
    // تعديل قائمة الفئات لتشمل "أخرى" كخيار
    const CATEGORIES = [
        'Hosting',
        'Domain',
        'Marketing',
        'Staff',
        'Office Expenses',
        'Transaction Costs',
        'Legal',
        'Software',
        'Other' // إضافة خيار "أخرى"
    ];

    // الحصول على جميع الفئات
    public static function getCategories()
    {
        return self::CATEGORIES;
    }

    // الحصول على أنواع المصاريف
    public static function getTypes()
    {
        return [
            self::TYPE_FIXED => 'Fixed',
            self::TYPE_VARIABLE => 'Variable'
        ];
    }

    // علاقة مع المستخدم
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // نطاق للحصول على مصاريف شهر وسنة معينة
    public function scopeForMonth($query, $month, $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    // نطاق للحصول على مصاريف حسب النوع
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
    public static function getTotalCostsByType(string $type): float
{
    return self::where('type', $type)->sum('amount');
}
}