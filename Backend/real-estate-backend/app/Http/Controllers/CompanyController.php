<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // دالة التسجيل (موجودة بالفعل)
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

    // دالة جلب بيانات شركة (GET)
    public function show($company_id)
    {
        $company = Company::find($company_id);

        if (!$company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        // إضافة روابط للملفات (اختياري)
        $company->commercial_registration_doc_url = asset('storage/' . $company->commercial_registration_doc);
        $company->tax_card_doc_url = asset('storage/' . $company->tax_card_doc);
        $company->proof_of_address_doc_url = asset('storage/' . $company->proof_of_address_doc);
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
        \Log::error('Company not found for ID: ' . $company_id);
        return response()->json(['message' => 'Company not found.'], 404);
    }

    // Log البيانات المُرسلة (بما في ذلك الملفات)
    \Log::info('Update request data (all):', $request->all());
    \Log::info('Update request data (input):', $request->input());
    \Log::info('Update request files:', $request->files->all());

    // التحقق من صحة البيانات
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

    // Log الحالة قبل التحديث
    \Log::info('Company before update:', $company->toArray());

    // تحديث الحقول النصية
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

    // Log البيانات التي سيتم تحديثها
    \Log::info('Data to update:', $dataToUpdate);

    $company->fill($dataToUpdate);

    // تحديث كلمة المرور إذا تم إرسالها
    if ($request->has('password')) {
        \Log::info('Updating password');
        $company->password = Hash::make($request->password);
    }

    // تحديث الملفات إذا تم رفع ملفات جديدة
    if ($request->hasFile('commercial_registration_doc')) {
        \Log::info('Updating commercial_registration_doc');
        if ($company->commercial_registration_doc) {
            Storage::disk('public')->delete($company->commercial_registration_doc);
        }
        $company->commercial_registration_doc = $request->file('commercial_registration_doc')->store('uploads/companies', 'public');
    }

    if ($request->hasFile('real_estate_license_doc')) {
        \Log::info('Updating real_estate_license_doc');
        if ($company->real_estate_license_doc) {
            Storage::disk('public')->delete($company->real_estate_license_doc);
        }
        $company->real_estate_license_doc = $request->file('real_estate_license_doc')->store('uploads/companies', 'public');
    } elseif ($request->has('real_estate_license_doc') && $request->real_estate_license_doc === null) {
        \Log::info('Removing real_estate_license_doc');
        if ($company->real_estate_license_doc) {
            Storage::disk('public')->delete($company->real_estate_license_doc);
            $company->real_estate_license_doc = null;
        }
    }

    if ($request->hasFile('tax_card_doc')) {
        \Log::info('Updating tax_card_doc');
        if ($company->tax_card_doc) {
            Storage::disk('public')->delete($company->tax_card_doc);
        }
        $company->tax_card_doc = $request->file('tax_card_doc')->store('uploads/companies', 'public');
    }

    if ($request->hasFile('proof_of_address_doc')) {
        \Log::info('Updating proof_of_address_doc');
        if ($company->proof_of_address_doc) {
            Storage::disk('public')->delete($company->proof_of_address_doc);
        }
        $company->proof_of_address_doc = $request->file('proof_of_address_doc')->store('uploads/companies', 'public');
    }

    // Log الحالة بعد التحديث وقبل الحفظ
    \Log::info('Company after changes, before save:', $company->toArray());

    // محاولة حفظ التغييرات
    try {
        $result = $company->save();
        \Log::info('Company save result: ' . ($result ? 'Success' : 'Failed'));
    } catch (\Exception $e) {
        \Log::error('Failed to save company: ' . $e->getMessage());
        return response()->json(['message' => 'Failed to update company.', 'error' => $e->getMessage()], 500);
    }

    // Log الحالة بعد الحفظ
    $company->refresh();
    \Log::info('Company after save:', $company->toArray());

    return response()->json(['message' => 'Company updated successfully.'], 200);
}
public function destroy($company_id)
{
    $company = Company::find($company_id);

    if (!$company) {
        \Log::error('Company not found for ID: ' . $company_id);
        return response()->json(['message' => 'Company not found.'], 404);
    }

    // Log قبل الحذف
    \Log::info('Deleting company with ID: ' . $company_id);

    // حذف الملفات المرتبطة إذا كانت موجودة
    $filesToDelete = [
        $company->commercial_registration_doc,
        $company->real_estate_license_doc,
        $company->tax_card_doc,
        $company->proof_of_address_doc,
    ];

    // حذف الملفات من التخزين
    foreach ($filesToDelete as $file) {
        if ($file && Storage::disk('public')->exists($file)) {
            Storage::disk('public')->delete($file);
            \Log::info('Deleted file: ' . $file);
        }
    }

    // حذف السجل من قاعدة البيانات
    try {
        $company->delete();
        \Log::info('Company deleted successfully with ID: ' . $company_id);
    } catch (\Exception $e) {
        \Log::error('Failed to delete company: ' . $e->getMessage());
        return response()->json(['message' => 'Failed to delete company.', 'error' => $e->getMessage()], 500);
    }

    return response()->json(['message' => 'Company deleted successfully.'], 200);
}
}

