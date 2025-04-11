<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Http\Request;

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

    // Update the status of a specific booking (only the property owner can update)
    public function updateStatus(Request $request, $id)
{
    $user = $request->user();
    
    $validated = $request->validate([
        'status' => 'required|in:confirmed,canceled'
    ]);

    $booking = Booking::with(['property'])
        ->findOrFail($id);

    // Authorization - must be property owner
    if ($booking->property->user_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized: Only the property owner can update this booking'
        ], 403);
    }

    $booking->update(['status' => $validated['status']]);

    return response()->json([
        'message' => 'Booking status updated successfully',
        'booking' => $booking->fresh(['user', 'property'])
    ]);
}

    // Create a new booking
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
            'booking_date' => 'required|date',
            'visit_date' => 'nullable|date',
            'status' => 'in:pending,confirmed,canceled'
        ]);

        $booking = Booking::create($request->all());
        return response()->json($booking, 201);
    }

    // Get only pending bookings (filtered by user or Admin, paginated)
    public function getPending(Request $request)
{
    $user = $request->user();
    
    $query = Booking::where('status', 'pending')
        ->with(['user', 'property'])
        ->when($user->user_type === 'user', function ($query) use ($user) {
            // For regular users, only show pending bookings for their properties
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

    // Get only confirmed bookings (filtered by user or Admin, paginated)
    public function getConfirmed(Request $request)
{
    $user = $request->user();

    $query = Booking::where('status', 'confirmed')
        ->with(['user', 'property'])
        ->when($user->user_type === 'user', function ($query) use ($user) {
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

    // Get only canceled bookings (filtered by user or Admin, paginated)
    public function getCanceled(Request $request)
{
    $user = $request->user();

    $query = Booking::where('status', 'canceled')
        ->with(['user', 'property'])
        ->when($user->user_type === 'user', function ($query) use ($user) {
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
}