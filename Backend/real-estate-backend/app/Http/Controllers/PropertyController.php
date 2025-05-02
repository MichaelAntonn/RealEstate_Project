<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Admin;
use App\Models\Property;
use App\Models\PropertyMedia;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\NewPropertyAdded;
use App\Notifications\NewPropertySubmitted;
use App\Notifications\PropertyAccepted;
use App\Notifications\PropertyRejected;
use App\Services\PropertyMediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Property::query();
    
        // Keyword search with improved performance
        if ($request->has('keyword')) {
            $keyword = strtolower($request->input('keyword'));
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', $keyword.'%')
                  ->orWhere('city', 'LIKE', $keyword.'%')
                  ->orWhere('type', 'LIKE', $keyword.'%')
                  ->orWhere('description', 'LIKE', $keyword.'%');
            });
        }
    
        // Exact matches
        $exactFilters = ['city', 'type', 'listing_type', 'bedrooms', 
                        'bathrooms', 'construction_status', 'approval_status'];
        foreach ($exactFilters as $filter) {
            if ($request->has($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }
    
        // Range filters
        if ($request->has('min_price') && $request->has('max_price')) {
            $query->whereBetween('price', [$request->min_price, $request->max_price]);
        } else {
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }
        }
    
        // Similar for area
        if ($request->has('min_area') && $request->has('max_area')) {
            $query->whereBetween('area', [$request->min_area, $request->max_area]);
        } else {
            if ($request->has('min_area')) {
                $query->where('area', '>=', $request->min_area);
            }
            if ($request->has('max_area')) {
                $query->where('area', '<=', $request->max_area);
            }
        }
    
        // New building filter
        if ($request->boolean('is_new_building')) {
            $currentYear = now()->year;
            $query->where('building_year', '>=', $currentYear - 3)
                  ->whereNotNull('building_year');
        }
    
        // Sorting
        $sortOptions = [
            'newest' => ['created_at', 'desc'],
            'price_low' => ['price', 'asc'],
            'price_high' => ['price', 'desc']
        ];
        
        $sortBy = $request->input('sort_by', 'newest');
        [$sortColumn, $sortDirection] = $sortOptions[$sortBy] ?? $sortOptions['newest'];
        $query->orderBy($sortColumn, $sortDirection);
    
        // Pagination with caching
        $perPage = min($request->input('per_page', 10), 100); // Limit max per page
        $cacheKey = 'properties_'.md5(json_encode($request->all()));
        
        $properties = Cache::remember($cacheKey, now()->addHours(1), function() use ($query, $perPage) {
            return $query->paginate($perPage);
        });
    
        return response()->json([
            'data' => $properties->items(),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'total_pages' => $properties->lastPage(),
                'total_items' => $properties->total(),
                'per_page' => $properties->perPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    const subscribed = true;
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, PropertyMediaService $mediaService)
    {
        $user = Auth::user();
    
        // 1. Check if the user has an active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest()
            ->first();
    
        if (!$subscription) {
            $subscribed = false;
            return response()->json(['message' => 'You must have an active subscription to add a property.', $subscribed], 403);
        }
    
        // 2. Check the maximum number of properties allowed according to the plan
        $plan = $subscription->plan;
        $maxProperties = $plan->max_properties_allowed ?? null;
    
        if (!is_null($maxProperties) && $user->properties()->count() >= $maxProperties) {
            return response()->json(['message' => 'You have reached the maximum number of properties allowed in your plan.'], 403);
        }
    
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
            'cover_image' => 'nullable|file|mimes:jpg,jpeg,png|max:20480',
            'property_code' => 'required|string|unique:properties,property_code',
            'media' => 'nullable|array',
            'media.*' => 'file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        // Add the authenticated user's ID to the request data
        $data = $request->except(['media', 'cover_image']);
        $data['user_id'] = Auth::id();
    
        // Set the initial status to 'pending' for regular users
        if (Auth::user()->user_type === UserType::USER) {
            $data['approval_status'] = 'pending';
        }
    
        // Create the property
        $property = Property::create($data);
    
        // Handle cover image upload if present
        if ($request->hasFile('cover_image')) {
            $coverImage = $request->file('cover_image');
            $coverImagePath = $coverImage->store(
                'property_media/' . $property->id . '/cover_image',
                'public'
            );
    
            $property->cover_image = $coverImagePath;
            $property->save();
        }
    
        // Handle media uploads if present
        if ($request->hasFile('media')) {
            try {
                $uploadedMedia = $mediaService->handleUpload($property, $request->file('media'));
    
                // If no cover image was set but we have images, set the first one
                if (empty($property->cover_image)) {
                    $firstImage = collect($uploadedMedia)->firstWhere('MediaType', 'image');
                    if ($firstImage) {
                        $property->cover_image = $firstImage->MediaURL;
                        $property->save();
                    }
                }
            } catch (\Exception $e) {
                return response()->json([
                    'warning' => 'Property created but media upload failed: ' . $e->getMessage()
                ], 201);
            }
        }
    
        // Load the media relationship for the response
        $property->load('media');
    
        // Notifications
        $users = User::where('id', '!=', $request->user()->id)
            ->where('city', $request->user()->city)
            ->get();
    
        Notification::send($users, new NewPropertyAdded($property));
    
        $admins = Admin::whereIn('user_type', ['admin', 'super-admin'])->get();
        Notification::send($admins, new NewPropertySubmitted($property));
    
        return response()->json([
            'message' => 'Property created successfully',
            'success' => 'Property created successfully',
            'property' => $property,
        ], 201);
    }
    

    public function checkSlug(Request $request)
    {
        $slug = $request->query('slug');
        $validator = Validator::make(['slug' => $slug], [
            'slug' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $exists = Property::where('slug', $slug)->exists();
        return response()->json(['available' => !$exists]);
    }

    public function checkPropertyCode(Request $request)
    {
        $propertyCode = $request->query('property_code');
        $validator = Validator::make(['property_code' => $propertyCode], [
            'property_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $exists = Property::where('property_code', $propertyCode)->exists();
        return response()->json(['available' => !$exists]);
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

    public function showBySlug(string $slug)
    {
        $property = Property::where('slug', $slug)->first();

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
    public function update(Request $request, string $id, PropertyMediaService $mediaService)
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
            'approval_status' => 'sometimes|in:pending,accepted,rejected',
            'building_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'legal_status' => 'nullable|in:licensed,unlicensed,pending',
            'furnished' => 'nullable|boolean',
            'amenities' => 'nullable|json',
            'payment_options' => 'nullable|json',
            'cover_image' => 'nullable|file|mimes:jpg,jpeg,png|max:20480',
            'property_code' => 'sometimes|string|unique:properties,property_code,' . $property->id,
            'media' => 'nullable|array',
            'media.*' => 'file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480',
            'media_to_delete' => 'nullable|array',
            'media_to_delete.*' => 'exists:property_media,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        // Prepare data for update (excluding media fields)
        $data = $request->except(['media', 'media_to_delete', 'cover_image']);
    
        // Check for any critical changes to 'property_code' or 'slug'
        if ($request->has('property_code') && $request->input('property_code') !== $property->property_code) {
            return response()->json(['error' => 'You cannot change the property code.'], 400);
        }
    
        if ($request->has('slug') && $request->input('slug') !== $property->slug) {
            return response()->json(['error' => 'You cannot change the property slug.'], 400);
        }
    
        // Handle cover image upload if present
        if ($request->hasFile('cover_image')) {
            // Delete old cover image if exists
            if ($property->cover_image) {
                Storage::disk('public')->delete($property->cover_image);
            }
    
            // Upload new cover image
            $coverImage = $request->file('cover_image');
            $coverImagePath = $coverImage->store(
                'property_media/' . $property->id . '/cover_image',
                'public'
            );
    
            $data['cover_image'] = $coverImagePath;
        }
    
        // Update the property data
        $property->update($data);
    
        // Handle media deletions if requested
        if ($request->has('media_to_delete')) {
            foreach ($request->input('media_to_delete') as $mediaId) {
                $media = PropertyMedia::find($mediaId);
    
                // Verify the media belongs to this property
                if ($media && $media->PropertyID == $property->id) {
                    // Delete the file from storage
                    Storage::disk('public')->delete($media->MediaURL);
                    // Delete the media record
                    $media->delete();
                }
            }
        }
    
        // Handle new media uploads if present
        if ($request->hasFile('media')) {
            try {
                $uploadedMedia = $mediaService->handleUpload($property, $request->file('media'));
    
                // If no cover image was set but we have images, set the first one
                if (empty($property->cover_image)) {
                    $firstImage = collect($uploadedMedia)->firstWhere('MediaType', 'image');
                    if ($firstImage) {
                        $property->cover_image = $firstImage->MediaURL;
                        $property->save();
                    }
                }
            } catch (\Exception $e) {
                return response()->json([
                    'warning' => 'Property updated but media upload failed: ' . $e->getMessage()
                ], 200);
            }
        }
    
        // Refresh the property with its relationships
        $property->load('media');
    
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

        // Delete the property (the model event will handle media deletion)
        $property->delete();

        return response()->json([
            'success' => 'Property and all associated media deleted successfully',
        ], 200);
    }



    public function getPendingAcceptedProperties()
    {
        $properties = Property::where('approval_status', 'accepted')
        ->where(function ($query) {
            $query->where('transaction_status', 'pending')
                  ->orWhereNull('transaction_status');
        })

        ->join('users', 'properties.user_id', '=', 'users.id')
        ->leftJoin('subscriptions', 'subscriptions.user_id', '=', 'users.id')
        ->leftJoin('subscription_plans', 'subscription_plans.id', '=', 'subscriptions.plan_id')
        ->where('subscriptions.status', 'active') // نضمن أن الاشتراك نشط
        ->orderByRaw("
            FIELD(subscription_plans.name, 'Premium', 'Standard', 'Basic', 'Free Trial')
        ")
        ->orderBy('properties.created_at', 'desc') // ترتيب العقارات من الأحدث
        ->select('properties.*') // نرجع فقط بيانات العقارات
        ->paginate(10); // pagination حسب احتياجك

    return response()->json($properties, 200);    }



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

        $property->user->notify(new PropertyAccepted($property));

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

        $property->user->notify(new PropertyRejected($property, $validated['reason'] ?? null));

        return response()->json([
            'message' => 'Property rejected successfully',
            'property' => $property,
        ], 200);
    }


    public function getPendingProperties(Request $request)
    {
        $user = $request->user();
        $query = Property::where('approval_status', 'pending');

        if ($user->user_type === UserType::USER) {
            $query->where('user_id', $user->id);
        }

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('property_code', 'like', "%{$search}%");
            });
        }

        $properties = $query->latest()->paginate(5);

        return response()->json([
            'properties' => $properties
        ]);
    }

    public function getAcceptedProperties(Request $request)
    {
        $user = $request->user();
        $query = Property::where('approval_status', 'accepted');

        if ($user->user_type === UserType::USER) {
            $query->where('user_id', $user->id);
        }

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('property_code', 'like', "%{$search}%");
            });
        }

        $properties = $query->latest()->paginate(5);

        return response()->json([
            'properties' => $properties
        ]);
    }

    public function getRejectedProperties(Request $request)
    {
        $user = $request->user();
        $query = Property::where('approval_status', 'rejected');

        if ($user->user_type === UserType::USER) {
            $query->where('user_id', $user->id);
        }

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('property_code', 'like', "%{$search}%");
            });
        }

        $properties = $query->latest()->paginate(5);

        return response()->json([
            'properties' => $properties
        ]);
    }

    public function search(Request $request)
    {
        $query = Property::query();

        if ($request->has('keyword')) {
            $keyword = strtolower($request->input('keyword'));
            $query->where(function ($q) use ($keyword) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(city) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(type) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$keyword}%"]);
            });
        }

        if ($request->has('type') && $request->input('type') !== '') {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('city') && $request->input('city') !== '') {
            $query->where('city', $request->input('city'));
        }

        if ($request->has('listing_type') && $request->input('listing_type') !== '') {
            $query->where('listing_type', $request->input('listing_type'));
        }

        if ($request->has('is_new_building') && filter_var($request->input('is_new_building'), FILTER_VALIDATE_BOOLEAN)) {
            $currentYear = Carbon::now()->year;
            $newBuildingThreshold = $currentYear - 3;
            $query->where('building_year', '>=', $newBuildingThreshold)
                ->whereNotNull('building_year');
        }

        // Pagination
        $perPage = $request->input('per_page', 5); // Default 5 items per page
        $properties = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $properties->items(),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'total_pages' => $properties->lastPage(),
                'total_items' => $properties->total(),
                'per_page' => $properties->perPage(),
            ],
        ]);
    }

    public function getCities()
    {
        $cities = Property::where('approval_status', 'accepted')
            ->distinct()
            ->pluck('city')
            ->filter()
            ->values();

        return response()->json(['cities' => $cities]);
    }

    public function getMedia($propertyId)
    {
        $property = Property::findOrFail($propertyId);
        return response()->json([
            'media' => $property->media
        ]);
    }

    /**
     * Add media to an existing property
     */
    public function addMedia(Request $request, $propertyId, PropertyMediaService $mediaService)
    {
        // Check authorization
        $property = Property::findOrFail($propertyId);
        $user = Auth::user();

        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN && $property->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden. You do not have permission to add media to this property.'], 403);
        }

        // Handle the media upload using the service
        $uploadedMedia = $mediaService->handleUpload($property, $request->file('media'));

        return response()->json([
            'success' => 'Media added successfully',
            'media' => $uploadedMedia,
        ], 201);
    }

    /**
     * Delete specific media from a property
     */
    public function deleteMedia($propertyId, $mediaId, PropertyMediaService $mediaService)
    {
        // Check authorization
        $property = Property::findOrFail($propertyId);
        $media = PropertyMedia::where('PropertyID', $propertyId)->findOrFail($mediaId);
        $user = Auth::user();

        if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN && $property->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden. You do not have permission to delete media from this property.'], 403);
        }

        // Delete the media using the service
        $mediaService->deleteMedia($property, $media);

        return response()->json([
            'success' => 'Media deleted successfully'
        ], 200);
    }
}
