<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CompanyController extends Controller
{
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'commercial_registration_number' => 'required|string|max:50',
            'company_email' => 'required|email|unique:companies,company_email',
            'company_phone_number' => 'required|string|max:20',
            'company_address' => 'required|string',
            'commercial_registration_doc' => 'required|file|mimes:pdf,jpg,png|max:5120', // 5MB max
            'real_estate_license_doc' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'tax_card_doc' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'proof_of_address_doc' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'years_in_real_estate' => 'nullable|integer|min:0',
            'company_website' => 'nullable|url',
            'date_of_establishment' => 'nullable|date',
            'password' => 'required|string|min:8|confirmed', // يجب أن يتطابق مع confirm_password
            'accept_terms' => 'required|accepted', // يجب الموافقة على الشروط
        ]);

        // التعامل مع رفع الملفات
        $commercialRegistrationPath = $request->file('commercial_registration_doc')->store('uploads/companies', 'public');
        $realEstateLicensePath = $request->hasFile('real_estate_license_doc')
            ? $request->file('real_estate_license_doc')->store('uploads/companies', 'public')
            : null;
        $taxCardPath = $request->file('tax_card_doc')->store('uploads/companies', 'public');
        $proofOfAddressPath = $request->file('proof_of_address_doc')->store('uploads/companies', 'public');

        // إنشاء سجل جديد للشركة
        $company = new Company();
        $company->company_name = $request->company_name;
        $company->commercial_registration_number = $request->commercial_registration_number;
        $company->company_email = $request->company_email;
        $company->company_phone_number = $request->company_phone_number;
        $company->company_address = $request->company_address;
        $company->commercial_registration_doc = $commercialRegistrationPath;
        $company->real_estate_license_doc = $realEstateLicensePath;
        $company->tax_card_doc = $taxCardPath;
        $company->proof_of_address_doc = $proofOfAddressPath;
        $company->years_in_real_estate = $request->years_in_real_estate;
        $company->company_website = $request->company_website;
        $company->date_of_establishment = $request->date_of_establishment;
        $company->password = Hash::make($request->password); // تشفير كلمة المرور
        $company->accept_terms = $request->accept_terms;
        $company->verification_status = 'Pending'; // الحالة الافتراضية
        $company->save();

        return response()->json(['message' => 'Company registered successfully. Awaiting verification.'], 201);
    }
}