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
        ->when(!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN]), function ($query) use ($user) {
            // For normal users, only show bookings for their properties
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
        $booking = Booking::with('property')->findOrFail($id);
        $user = $request->user();
    
        $this->authorizeAdminOrSelf($request, $booking->property->user_id);
    
        $validated = $request->validate([
            'status' => 'required|in:confirmed,canceled'
        ]);
    
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
    
        $property = Property::findOrFail($validated['property_id']);
    
        // Check if user is trying to book his own property
        if ($property->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot book your own property.'
            ], 403);
        }
    
        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'property_id' => $validated['property_id'],
            'booking_date' => $validated['booking_date'],
            'visit_date' => $validated['visit_date'] ?? null,
            'status' => $validated['status'] ?? 'pending',
        ]);
    
        $property->user->notify(new PropertyBooked($booking, $property));
    
        return response()->json(['message' => 'Booking created successfully', 'booking' => $booking], 201);
    }
    
    // Get only pending bookings (filtered by  Admin, paginated)

    public function getPending(Request $request)
{
    $user = $request->user();

    $query = Booking::where('status', 'pending')
        ->with(['user', 'property'])
        ->when(!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN]), function ($query) use ($user) {
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

    

    // Get only confirmed bookings (filtered by Admin, paginated)
    public function getConfirmed(Request $request)
    {
        $user = $request->user();
    
        $query = Booking::where('status', 'confirmed')
            ->with(['user', 'property'])
            ->when(!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN]), function ($query) use ($user) {
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
    

    public function getCanceled(Request $request)
    {
        $user = $request->user();
    
        $query = Booking::where('status', 'canceled')
            ->with(['user', 'property'])
            ->when(!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN]), function ($query) use ($user) {
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
    
protected function authorizeSuperAdmin(Request $request): void
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        abort(403, 'Forbidden. Only super-admins can perform this action.');
    }
}

protected function authorizeAdmin(Request $request): void
{
    if (!in_array($request->user()->user_type, [UserType::SUPER_ADMIN, UserType::ADMIN])) {
        abort(403, 'Forbidden. Only admins can perform this action.');
    }
}

protected function authorizeAdminOrSelf(Request $request, int $userId): void
{
    $user = $request->user();
    if (!in_array($user->user_type, [UserType::SUPER_ADMIN, UserType::ADMIN]) && $user->id !== $userId) {
        abort(403, 'Forbidden. You can not perform this action.');
    }
}
}
