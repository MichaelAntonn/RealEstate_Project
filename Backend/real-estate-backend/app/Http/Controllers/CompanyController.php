<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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
    public function getPendingCompanies()
{
    $companies = Company::where('verification_status', 'Pending')->get()->map(function ($company) {
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

public function verifyCompany(Request $request, $id)
{
    if (!Auth::guard('sanctum')->check()) {
        return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
    }

    $user = Auth::guard('sanctum')->user();
    if ($user->user_type !== 'admin' && $user->user_type !== 'super-admin') {
        return response()->json(['error' => 'Forbidden. Admin access only.'], 403);
    }

    $company = Company::find($id);
    if (!$company) {
        return response()->json(['message' => 'Company not found.'], 404);
    }

    $validated = $request->validate([
        'status' => 'required|in:Verified,Rejected',
        'rejection_reason' => 'nullable|string|required_if:status,Rejected',
    ]);

    $company->verification_status = $validated['status'];

    if ($validated['status'] === 'Rejected' && isset($validated['rejection_reason'])) {
        $company->rejection_reason = $validated['rejection_reason'];
    }

    $company->save();

    return response()->json([
        'message' => 'Company verification status updated successfully.',
        'data' => $company
    ], 200);
}

public function login(Request $request)
{
    $request->validate([
        'company_email' => 'required|email',
        'password' => 'required',
    ]);

    $company = Company::where('company_email', $request->company_email)->first();

    if (!$company || !Hash::check($request->password, $company->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    if ($company->verification_status === 'Pending') {
        return response()->json([
            'message' => 'تم استلام أوراقك وهي تحت المراجعة حالياً. سنقوم بالرد عليك قريباً.'
        ], 403);
    }

    if ($company->verification_status === 'Rejected') {
        return response()->json([
            'message' => 'تم رفض طلب تسجيل شركتك.',
            'reason' => $company->rejection_reason
        ], 403);
    }

    $token = $company->createToken('company-token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'token' => $token,
        'company' => $company
    ], 200);
}
/**
 * Get all verified companies.
 */
public function getVerifiedCompanies()
{
    $companies = Company::where('verification_status', 'Verified')->get()->map(function ($company) {
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

/**
 * Get all rejected companies.
 */
public function getRejectedCompanies()
{
    $companies = Company::where('verification_status', 'Rejected')->get()->map(function ($company) {
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

/**
 * Change a verified company's status to rejected.
 */
public function rejectVerifiedCompany(Request $request, $id)
{
    if (!Auth::guard('sanctum')->check()) {
        return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
    }

    $user = Auth::guard('sanctum')->user();
    if ($user->user_type !== 'admin' && $user->user_type !== 'super-admin') {
        return response()->json(['error' => 'Forbidden. Admin access only.'], 403);
    }

    $company = Company::find($id);
    if (!$company) {
        return response()->json(['message' => 'Company not found.'], 404);
    }

    if ($company->verification_status !== 'Verified') {
        return response()->json(['message' => 'Company must be verified to reject it.'], 400);
    }

    $validated = $request->validate([
        'rejection_reason' => 'required|string',
    ]);

    $company->verification_status = 'Rejected';
    $company->rejection_reason = $validated['rejection_reason'];
    $company->save();

    return response()->json([
        'message' => 'Company status updated to Rejected successfully.',
        'data' => $company
    ], 200);
}

/**
 * Change a rejected company's status to verified.
 */
public function verifyRejectedCompany(Request $request, $id)
{
    if (!Auth::guard('sanctum')->check()) {
        return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
    }

    $user = Auth::guard('sanctum')->user();
    if ($user->user_type !== 'admin' && $user->user_type !== 'super-admin') {
        return response()->json(['error' => 'Forbidden. Admin access only.'], 403);
    }

    $company = Company::find($id);
    if (!$company) {
        return response()->json(['message' => 'Company not found.'], 404);
    }

    if ($company->verification_status !== 'Rejected') {
        return response()->json(['message' => 'Company must be rejected to verify it.'], 400);
    }

    $company->verification_status = 'Verified';
    $company->rejection_reason = null; // إزالة سبب الرفض
    $company->save();

    return response()->json([
        'message' => 'Company status updated to Verified successfully.',
        'data' => $company
    ], 200);
}
}
