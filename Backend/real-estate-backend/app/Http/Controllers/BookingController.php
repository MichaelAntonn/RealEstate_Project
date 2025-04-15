<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Notifications\PropertyBooked;
use Illuminate\Http\Request;
use App\Constants\UserType;

class BookingController extends Controller
{
    // Get all bookings (filtered by user or Admin access)
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Booking::with(['user', 'property'])
            ->when($user->user_type === 'user', function ($query) use ($user) {
                // For regular users, only show bookings for properties they own
                $query->whereHas('property', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            ->latest();

        $bookings = $query->paginate(5);

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    // Get a specific booking by ID (with authorization)
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::with(['user', 'property'])
            ->findOrFail($id);

        // Authorization check - Admin or property owner can view
        if ($user->user_type === 'user' && $booking->property->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this booking'
            ], 403);
        }

        return response()->json([
            'booking' => $booking
        ]);
    }

    // Update the status of a specific booking (only the Admin can update)

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
    
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'message' => 'Unauthorized: Only admins can update booking status'
            ], 403);
        }
    
        $validated = $request->validate([
            'status' => 'required|in:confirmed,canceled'
        ]);
    
        $booking = Booking::with(['property'])
            ->findOrFail($id);
    
        $booking->update(['status' => $validated['status']]);
    
        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking->fresh(['user', 'property'])
        ]);
    }
    

    // Create a new booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'booking_date' => 'required|date',
            'visit_date' => 'nullable|date',
            'status' => 'in:pending,confirmed,canceled',
        ]);

        // إنشاء البوكينج
        $booking = Booking::create([
            'user_id' => $request->user()->id, // for more securety
            'property_id' => $validated['property_id'],
            'booking_date' => $validated['booking_date'],
            'visit_date' => $validated['visit_date'] ?? null,
            'status' => $validated['status'] ?? 'pending',
        ]);

        $property = Property::findOrFail($validated['property_id']);

        $property->user->notify(new PropertyBooked($booking, $property));

        return response()->json(['message' => 'Booking created successfully', 'booking' => $booking], 201);
    }

    // Get only pending bookings (filtered by  Admin, paginated)

    public function getPending(Request $request)
    {
        $user = $request->user();
    
        // السماح فقط للـ admin و super-admin
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    
        $query = Booking::where('status', 'pending')
            ->with(['user', 'property'])
            ->latest();
    
        $bookings = $query->paginate(5);
    
        return response()->json([
            'bookings' => $bookings
        ]);
    }
    

    // Get only confirmed bookings (filtered by Admin, paginated)
    public function getConfirmed(Request $request)
{
    $user = $request->user();

    if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $query = Booking::where('status', 'confirmed')
        ->with(['user', 'property'])
        ->latest();

    $bookings = $query->paginate(5);

    return response()->json([
        'bookings' => $bookings
    ]);
}

public function getCanceled(Request $request)
{
    $user = $request->user();

    if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $query = Booking::where('status', 'canceled')
        ->with(['user', 'property'])
        ->latest();

    $bookings = $query->paginate(5);

    return response()->json([
        'bookings' => $bookings
    ]);
}
}
