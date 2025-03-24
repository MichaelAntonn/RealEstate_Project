<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Get all reviews (Admin only)
    public function index()
    {
        $reviews = Review::with(['user', 'property'])->get();
        return response()->json($reviews);
    }

    // Get a specific review (Admin only)
    public function show($id)
    {
        $review = Review::with(['user', 'property'])->findOrFail($id);
        return response()->json($review);
    }

    // Create a new review (Any authenticated user)
    public function store(Request $request)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'review_type' => 'required|in:property,agent,location',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string',
            'anonymous_review' => 'boolean'
        ]);

        $review = Review::create([
            'user_id' => auth('api')->id(), // Current authenticated user
            'property_id' => $request->property_id,
            'review_type' => $request->review_type,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'anonymous_review' => $request->anonymous_review ?? 0
        ]);

        return response()->json($review, 201);
    }

    // Delete a review (Admin only)
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();
        return response()->json(['message' => 'Review deleted successfully']);
    }

    // Get reviews for a specific property (Public)
    public function getByProperty($propertyId)
    {
        $reviews = Review::where('property_id', $propertyId)
            ->with(['user'])
            ->get();
        return response()->json($reviews);
    }
}