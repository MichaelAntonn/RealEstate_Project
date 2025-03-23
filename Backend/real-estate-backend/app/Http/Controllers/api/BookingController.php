<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{

    public function index()
    {
        // $bookings = Booking::with(['user', 'property'])->get();
        $bookings = Booking::all();
        return response()->json($bookings);
    }


    public function show($id)
    {
        $booking = Booking::with(['user', 'property'])->findOrFail($id);
        return response()->json($booking);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,canceled'
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
            'booking_date' => 'required|date',
            'visit_date' => 'nullable|date',
            'status' => 'in:pending,accepted,rejected'
        ]);

        $booking = Booking::create($request->all());
        return response()->json($booking, 201);
    }
}