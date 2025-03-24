<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Get all bookings with related user and property data
    public function index()
    {
        $bookings = Booking::with(['user', 'property'])->get();
        return response()->json($bookings);
    }

    // Get a specific booking by ID with related user and property data
    public function show($id)
    {
        $booking = Booking::with(['user', 'property'])->findOrFail($id);
        return response()->json($booking);
    }

    // Update the status of a specific booking
    public function updateStatus(Request $request, $id)
    {
        // Validate the status field to ensure it's one of the allowed values
        $request->validate([
            'status' => 'required|in:pending,confirmed,canceled'
        ]);

        // Find the booking by ID or throw a 404 if not found
        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        // Return a success response with the updated booking
        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
        ]);
    }

    // Create a new booking
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'user_id' => 'required|exists:users,id',         // Ensure user_id exists in users table
            'property_id' => 'required|exists:properties,id', // Ensure property_id exists in properties table
            'booking_date' => 'required|date',               // Ensure booking_date is a valid date
            'visit_date' => 'nullable|date',                 // visit_date is optional but must be a valid date
            'status' => 'in:pending,confirmed,canceled'      // Status must be one of these values
        ]);

        // Create the booking with the validated data
        $booking = Booking::create($request->all());
        return response()->json($booking, 201); // Return the created booking with 201 status
    }

    // Get only pending bookings
    public function getPending()
    {
        $bookings = Booking::where('status', 'pending')
            ->with(['user', 'property']) // Include user and property relationships
            ->get();
        return response()->json($bookings);
    }

    // Get only confirmed bookings
    public function getConfirmed()
    {
        $bookings = Booking::where('status', 'confirmed')
            ->with(['user', 'property']) // Include user and property relationships
            ->get();
        return response()->json($bookings);
    }

    // Get only canceled bookings
    public function getCanceled()
    {
        $bookings = Booking::where('status', 'canceled')
            ->with(['user', 'property']) // Include user and property relationships
            ->get();
        return response()->json($bookings);
    }
}