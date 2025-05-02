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
            'first_name.required' => 'Please enter your first name.',
            'first_name.string' => 'First name must be a valid string.',
    
            'last_name.required' => 'Please enter your last name.',
            'last_name.string' => 'Last name must be a valid string.',
    
            'email.required' => 'Please enter your email address.',
            'email.string' => 'Email must be a valid string.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
    
            'phone_number.phone' => 'The phone number is invalid for the selected country.',
    
            'country.string' => 'Country must be a valid string.',
    
            'city.string' => 'City must be a valid string.',
    
            'address.string' => 'Address must be a valid string.',
    
            'terms_and_conditions.required' => 'You must accept the terms and conditions to register.',
            'terms_and_conditions.accepted' => 'You must accept the terms and conditions to register.',
    
            'password.required' => 'Please enter a password.',
            'password.string' => 'Password must be a valid string.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        ];
    }
}
