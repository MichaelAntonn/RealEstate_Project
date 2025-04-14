<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // Allow unauthenticated access to these methods
   

    /**
     * Display a listing of all companies (accessible to unauthenticated users)
     */
    public function index()
    {
        $companies = Company::all()->map(function ($company) {
            // Add document URLs if needed
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
                
            return $company;
        });

        return response()->json($companies, 200);
    }

    /**
     * Store a newly created company (accessible to unauthenticated users)
     */
    public function store(Request $request)
    {
        // Validate the input data
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'commercial_registration_number' => 'required|string|max:50|unique:companies',
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
            'password' => 'required|string|min:8|confirmed',
            'accept_terms' => 'required|accepted',
        ]);
    
        // Handle file uploads
        $commercialRegistrationPath = $request->file('commercial_registration_doc')->store('companies/documents', 'public');
        $realEstateLicensePath = $request->hasFile('real_estate_license_doc')
            ? $request->file('real_estate_license_doc')->store('companies/documents', 'public')
            : null;
        $taxCardPath = $request->file('tax_card_doc')->store('companies/documents', 'public');
        $proofOfAddressPath = $request->file('proof_of_address_doc')->store('companies/documents', 'public');
    
        // Create new company record
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

    /**
     * Display the specified company (accessible to unauthenticated users)
     */
    public function show($company_id)
    {
        $company = Company::find($company_id);

        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        // Add document URLs
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

        return response()->json($company, 200);
    }

    // دالة تحديث بيانات شركة (PUT)
    public function update(Request $request, $company_id)
    {
        $company = Company::find($company_id);
    
        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }
    
        // Validate the data
        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'commercial_registration_number' => 'sometimes|string|max:50',
            'company_email' => 'sometimes|email|unique:companies,company_email,' . $company_id . ',company_id',
            'company_phone_number' => 'sometimes|string|max:20',
            'company_address' => 'sometimes|string',
            'commercial_registration_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'real_estate_license_doc' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'tax_card_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'proof_of_address_doc' => 'sometimes|file|mimes:pdf,jpg,png|max:5120',
            'years_in_real_estate' => 'nullable|integer|min:0',
            'company_website' => 'nullable|url',
            'date_of_establishment' => 'nullable|date',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);
    
        // Update text fields
        $dataToUpdate = $request->only([
            'company_name',
            'commercial_registration_number',
            'company_email',
            'company_phone_number',
            'company_address',
            'years_in_real_estate',
            'company_website',
            'date_of_establishment',
        ]);
    
        $company->fill($dataToUpdate);
    
        // Update password if provided
        if ($request->has('password')) {
            $company->password = Hash::make($request->password);
        }
    
        // Update files if new files are uploaded
        if ($request->hasFile('commercial_registration_doc')) {
            if ($company->commercial_registration_doc) {
                Storage::disk('public')->delete($company->commercial_registration_doc);
            }
            $company->commercial_registration_doc = $request->file('commercial_registration_doc')->store('uploads/companies', 'public');
        }
    
        if ($request->hasFile('real_estate_license_doc')) {
            if ($company->real_estate_license_doc) {
                Storage::disk('public')->delete($company->real_estate_license_doc);
            }
            $company->real_estate_license_doc = $request->file('real_estate_license_doc')->store('uploads/companies', 'public');
        } elseif ($request->has('real_estate_license_doc') && $request->real_estate_license_doc === null) {
            if ($company->real_estate_license_doc) {
                Storage::disk('public')->delete($company->real_estate_license_doc);
                $company->real_estate_license_doc = null;
            }
        }
    
        if ($request->hasFile('tax_card_doc')) {
            if ($company->tax_card_doc) {
                Storage::disk('public')->delete($company->tax_card_doc);
            }
            $company->tax_card_doc = $request->file('tax_card_doc')->store('uploads/companies', 'public');
        }
    
        if ($request->hasFile('proof_of_address_doc')) {
            if ($company->proof_of_address_doc) {
                Storage::disk('public')->delete($company->proof_of_address_doc);
            }
            $company->proof_of_address_doc = $request->file('proof_of_address_doc')->store('uploads/companies', 'public');
        }
    
        // Save changes
        try {
            $company->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update company.', 'error' => $e->getMessage()], 500);
        }
    
        return response()->json(['message' => 'Company updated successfully.'], 200);
    }
    
    public function destroy($company_id)
    {
        $company = Company::find($company_id);
    
        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }
    
        // Delete associated files if they exist
        $filesToDelete = [
            $company->commercial_registration_doc,
            $company->real_estate_license_doc,
            $company->tax_card_doc,
            $company->proof_of_address_doc,
        ];
    
        // Delete files from storage
        foreach ($filesToDelete as $file) {
            if ($file && Storage::disk('public')->exists($file)) {
                Storage::disk('public')->delete($file);
            }
        }
    
        // Delete record from database
        try {
            $company->delete();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete company.', 'error' => $e->getMessage()], 500);
        }
    
        return response()->json(['message' => 'Company deleted successfully.'], 200);
    }
}

