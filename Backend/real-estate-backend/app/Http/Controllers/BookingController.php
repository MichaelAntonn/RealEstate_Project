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

        if ($user->user_type === 'super_admin' || $user->user_type === 'admin') {
            $bookings = Booking::with(['user', 'property'])->paginate(5);
        } else {
            $ownedProperties = Property::where('user_id', $user->id)->pluck('id');
            $bookings = Booking::whereIn('property_id', $ownedProperties)
                ->with(['user', 'property'])
                ->paginate(5);
        }

        return response()->json($bookings);
    }

    // Get a specific booking by ID (with authorization)
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['user', 'property'])->findOrFail($id);

        if ($user->user_type !== 'super_admin' && $user->user_type !== 'admin' && $booking->property->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized access to this booking'], 403);
        }

        return response()->json($booking);
    }

    // Update the status of a specific booking (only the property owner can update)
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        $request->validate([
            'status' => 'required|in:confirmed,canceled'
        ]);

        $booking = Booking::findOrFail($id);

        // Only property owner can update (already restricted to non-admin users)
        if ($booking->property->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized: Only the property owner can update this booking'], 403);
        }

        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
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

        if ($user->user_type === 'super_admin' || $user->user_type === 'admin') {
            $bookings = Booking::where('status', 'pending')
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        } else {
            $ownedProperties = Property::where('user_id', $user->id)->pluck('id');
            $bookings = Booking::where('status', 'pending')
                ->whereIn('property_id', $ownedProperties)
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        }

        return response()->json($bookings);
    }

    // Get only confirmed bookings (filtered by user or Admin, paginated)
    public function getConfirmed(Request $request)
    {
        $user = $request->user();

        if ($user->user_type === 'super_admin' || $user->user_type === 'admin') {
            $bookings = Booking::where('status', 'confirmed')
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        } else {
            $ownedProperties = Property::where('user_id', $user->id)->pluck('id');
            $bookings = Booking::where('status', 'confirmed')
                ->whereIn('property_id', $ownedProperties)
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        }

        return response()->json($bookings);
    }

    // Get only canceled bookings (filtered by user or Admin, paginated)
    public function getCanceled(Request $request)
    {
        $user = $request->user();

        if ($user->user_type === 'super_admin' || $user->user_type === 'admin') {
            $bookings = Booking::where('status', 'canceled')
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        } else {
            $ownedProperties = Property::where('user_id', $user->id)->pluck('id');
            $bookings = Booking::where('status', 'canceled')
                ->whereIn('property_id', $ownedProperties)
                ->with(['user', 'property'])
                ->latest()
                ->paginate(5);
        }

        return response()->json($bookings);
    }
}