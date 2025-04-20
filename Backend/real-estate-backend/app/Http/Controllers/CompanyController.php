<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::all()->map(function ($company) {
            $company->commercial_registration_doc_url = $company->commercial_registration_doc 
                ? asset('storage/' . $company->commercial_registration_doc)
                : null;
            $company->tax_card_doc_url = $company->tax_card_doc 
                ? asset('storage/' . $company->tax_card_doc)
                : null;
            $company->proof_of_address_doc_url = $company->proof_of_address_doc 
                ? asset('storage/' . $company->proof_of_address_doc)
                : null;
            $company->real_estate_license_doc_url = $company->real_estate_license_doc 
                ? asset('storage/' . $company->real_estate_license_doc)
                : null;
            $company->logo_url = $company->logo 
                ? asset('storage/' . $company->logo)
                : null;

            return $company;
        });

        return response()->json($companies, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'commercial_registration_number' => 'required|string|max:50|unique:companies',
            'company_email' => 'required|email|unique:companies,company_email',
            'company_phone_number' => 'required|string|max:20',
            'company_address' => 'required|string',
            'commercial_registration_doc' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'real_estate_license_doc' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'tax_card_doc' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'proof_of_address_doc' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'years_in_real_estate' => 'nullable|integer|min:0',
            'company_website' => 'nullable|url',
            'date_of_establishment' => 'nullable|date',
            'password' => 'required|string|min:8|confirmed',
            'accept_terms' => 'required|accepted',
        ]);

        $commercialRegistrationPath = $request->file('commercial_registration_doc')->store('companies/documents', 'public');
        $realEstateLicensePath = $request->hasFile('real_estate_license_doc')
            ? $request->file('real_estate_license_doc')->store('companies/documents', 'public')
            : null;
        $taxCardPath = $request->file('tax_card_doc')->store('companies/documents', 'public');
        $proofOfAddressPath = $request->file('proof_of_address_doc')->store('companies/documents', 'public');
        $logoPath = $request->hasFile('logo')
            ? $request->file('logo')->store('uploads/companies/logos', 'public')
            : null;

        $company = Company::create([
            'company_name' => $request->company_name,
            'commercial_registration_number' => $request->commercial_registration_number,
            'company_email' => $request->company_email,
            'company_phone_number' => $request->company_phone_number,
            'company_address' => $request->company_address,
            'commercial_registration_doc' => $commercialRegistrationPath,
            'real_estate_license_doc' => $realEstateLicensePath,
            'tax_card_doc' => $taxCardPath,
            'proof_of_address_doc' => $proofOfAddressPath,
            'logo' => $logoPath,
            'years_in_real_estate' => $request->years_in_real_estate,
            'company_website' => $request->company_website,
            'date_of_establishment' => $request->date_of_establishment,
            'password' => Hash::make($request->password),
            'accept_terms' => true,
            'verification_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Company registered successfully. Awaiting verification.',
            'data' => $company
        ], 201);
    }

    public function show($id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        $company->commercial_registration_doc_url = $company->commercial_registration_doc 
            ? asset('storage/' . $company->commercial_registration_doc)
            : null;
        $company->tax_card_doc_url = $company->tax_card_doc 
            ? asset('storage/' . $company->tax_card_doc)
            : null;
        $company->proof_of_address_doc_url = $company->proof_of_address_doc 
            ? asset('storage/' . $company->proof_of_address_doc)
            : null;
        $company->real_estate_license_doc_url = $company->real_estate_license_doc 
            ? asset('storage/' . $company->real_estate_license_doc)
            : null;
        $company->logo_url = $company->logo 
            ? asset('storage/' . $company->logo)
            : null;

        return response()->json($company, 200);
    }

    public function update(Request $request, $id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'commercial_registration_number' => 'sometimes|string|max:50',
            'company_email' => 'sometimes|email|unique:companies,company_email,' . $id . ',company_id',
            'company_phone_number' => 'sometimes|string|max:20',
            'company_address' => 'sometimes|string',
            'commercial_registration_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'real_estate_license_doc' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'tax_card_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'proof_of_address_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'years_in_real_estate' => 'nullable|integer|min:0',
            'company_website' => 'nullable|url',
            'date_of_establishment' => 'nullable|date',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        $company->fill($request->only([
            'company_name',
            'commercial_registration_number',
            'company_email',
            'company_phone_number',
            'company_address',
            'years_in_real_estate',
            'company_website',
            'date_of_establishment',
        ]));

        if ($request->has('password')) {
            $company->password = Hash::make($request->password);
        }

        if ($request->hasFile('logo')) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $company->logo = $request->file('logo')->store('uploads/companies/logos', 'public');
        }

        $company->save();

        return response()->json(['message' => 'Company updated successfully.'], 200);
    }

    public function destroy($id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        $filesToDelete = [
            $company->commercial_registration_doc,
            $company->real_estate_license_doc,
            $company->tax_card_doc,
            $company->proof_of_address_doc,
            $company->logo,
        ];

        foreach ($filesToDelete as $file) {
            if ($file && Storage::disk('public')->exists($file)) {
                Storage::disk('public')->delete($file);
            }
        }

        $company->delete();

        return response()->json(['message' => 'Company deleted successfully.'], 200);
    }
}
