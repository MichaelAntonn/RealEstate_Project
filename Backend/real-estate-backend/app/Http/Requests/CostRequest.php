<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:500',
            'category' => 'required|string',
            'custom_category' => 'nullable|string|max:255|required_if:category,Other',
            'type' => 'required|in:fixed,variable',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000|max:2100',
        ];
    }
}