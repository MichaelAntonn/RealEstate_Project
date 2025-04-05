<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        // Start with all properties
        $query = Property::query();

        // Apply filters
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }
        if ($request->has('construction_status')) {
            $query->where('construction_status', $request->input('construction_status'));
        }
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->input('approval_status'));
        }

        // Paginate the results
        $properties = $query->paginate(5);

        return response()->json([
            'success' => true,
            'properties' => $properties,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:properties,slug',
            'description' => 'required|string',
            'type' => 'required|in:land,apartment,villa,office',
            'price' => 'required|numeric|min:0',
            'city' => 'required|string',
            'district' => 'required|string',
            'full_address' => 'nullable|string',
            'area' => 'required|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'listing_type' => 'required|in:for_sale,for_rent',
            'construction_status' => 'required|in:available,under_construction',
            'transaction_status' => 'nullable|in:pending,completed',
            'approval_status' => 'sometimes|in:pending,accepted,rejected',
            'building_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'legal_status' => 'nullable|in:licensed,unlicensed,pending',
            'furnished' => 'nullable|boolean',
            'amenities' => 'nullable|json',
            'payment_options' => 'nullable|json',
            'cover_image' => 'nullable|string',
            'property_code' => 'required|string|unique:properties,property_code',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Add the authenticated user's ID to the request data
        $data = $request->all();
        $data['user_id'] = Auth::id();

        // Set the initial status to 'pending' for regular users
        if (Auth::user()->user_type === UserType::USER) {
            $data['approval_status'] = 'pending';
        }

        // Create the property
        $property = Property::create($data);

        return response()->json([
            'success' => 'Property created successfully',
            'property' => $property,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        return response()->json([
            'success' => true,
            'property' => $property,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Find the property
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        // Check if the authenticated user is the owner, admin, or super-admin
        $user = Auth::user();
        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN && $property->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden. You do not have permission to update this property.'], 403);
        }

        // Validate the request data
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:properties,slug,' . $property->id,
            'description' => 'sometimes|string',
            'type' => 'sometimes|in:land,apartment,villa,office',
            'price' => 'sometimes|numeric|min:0',
            'city' => 'sometimes|string',
            'district' => 'sometimes|string',
            'full_address' => 'nullable|string',
            'area' => 'sometimes|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'listing_type' => 'sometimes|in:for_sale,for_rent',
            'construction_status' => 'sometimes|in:available,under_construction',
            'transaction_status' => 'nullable|in:pending,completed',
            'building_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'legal_status' => 'nullable|in:licensed,unlicensed,pending',
            'furnished' => 'nullable|boolean',
            'amenities' => 'nullable|json',
            'payment_options' => 'nullable|json',
            'cover_image' => 'nullable|string',
            'property_code' => 'sometimes|string|unique:properties,property_code,' . $property->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Update the property
        $property->update($request->all());

        return response()->json([
            'success' => 'Property updated successfully',
            'property' => $property,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(string $id)
    {
        // Find the property
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        // Check if the authenticated user is the owner, admin, or super-admin
        $user = Auth::user();
        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN && $property->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden. You do not have permission to delete this property.'], 403);
        }

        // Delete the property
        $property->delete();

        return response()->json([
            'success' => 'Property deleted successfully',
        ], 200);
    }





    /**
     * Accept a property (accessible by admin and super-admin).
     */
    public function acceptProperty($id)
    {
        // Find the property
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        // Ensure the authenticated user is an admin or super-admin
        $user = Auth::user();
        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only admins and super-admins can accept properties.'], 403);
        }


        // Update the status to 'accepted'
        $property->approval_status = 'accepted';
        $property->save();


        return response()->json([
            'message' => 'Property accepted successfully',
            'property' => $property,
        ], 200);
    }

    /**
     * Reject a property (accessible by admin and super-admin).
     */
    public function rejectProperty($id)
    {
        // Find the property
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        // Ensure the authenticated user is an admin or super-admin
        $user = Auth::user();
        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only admins and super-admins can reject properties.'], 403);
        }

        // Update the status to 'rejected'
        $property->approval_status = 'rejected';
        $property->save();

        return response()->json([
            'message' => 'Property rejected successfully',
            'property' => $property,
        ], 200);
    }
    public function search(Request $request)
    {
        try {
            $query = Property::query();

            // البحث بالعنوان
            if ($request->has('title')) {
                $query->where('title', 'like', '%' . $request->title . '%');
            }

            // البحث بنوع العقار
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // البحث بنطاق السعر
            if ($request->has('price_min')) {
                $query->where('price', '>=', $request->price_min);
            }
            if ($request->has('price_max')) {
                $query->where('price', '<=', $request->price_max);
            }

            // البحث بالمدينة
            if ($request->has('city')) {
                $query->where('city', 'like', '%' . $request->city . '%');
            }

            // البحث بالحي
            if ($request->has('district')) {
                $query->where('district', 'like', '%' . $request->district . '%');
            }

            // البحث بالمساحة
            if ($request->has('area_min')) {
                $query->where('area', '>=', $request->area_min);
            }
            if ($request->has('area_max')) {
                $query->where('area', '<=', $request->area_max);
            }

            // البحث بعدد غرف النوم
            if ($request->has('bedrooms')) {
                $query->where('bedrooms', $request->bedrooms);
            }

            // البحث بعدد الحمامات
            if ($request->has('bathrooms')) {
                $query->where('bathrooms', $request->bathrooms);
            }

            // البحث بنوع العرض (بيع/إيجار)
            if ($request->has('listing_type')) {
                $query->where('listing_type', $request->listing_type);
            }

            // البحث بحالة البناء
            if ($request->has('construction_status')) {
                $query->where('construction_status', $request->construction_status);
            }

            // الترتيب
            if ($request->has('sort_by')) {
                $direction = $request->get('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $direction);
            }

            // عدد النتائج في الصفحة
            $perPage = $request->get('per_page', 10);
            $properties = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $properties
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
