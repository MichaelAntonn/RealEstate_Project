<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Propaganistas\LaravelPhone\Rules\Phone;

class RegisterFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => ['nullable', new Phone($this->country)],
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'terms_and_conditions' => 'required|accepted', 
            // One lowercase letter ([a-z]) One uppercase letter ([A-Z]) One digit (\d) One special character ([@$!%*?&])
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
        ];
    }
    public function messages()
    {
        return [
            'phone_number.phone' => 'The phone number is invalid for the selected country.',
            'terms_and_conditions.accepted' => 'You must accept the terms and conditions to register.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
