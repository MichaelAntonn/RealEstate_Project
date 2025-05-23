<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            // 'property_id' => 'required|exists:properties,id',
            'property_id' => [
                'required_if:review_type,property',
                'nullable',
                'exists:properties,id'
            ],
            'review_type' => 'required|in:property,agent,location',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string',
            'anonymous_review' => 'boolean'
        ]);

        // Check if user already reviewed this property
        $existingReview = Review::where('user_id', auth('api')->id())
            ->where('property_id', $request->property_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already submitted a review for this property.'
            ], 422);
        }

        $review = Review::create([
            'user_id' => auth('api')->id(), // Current authenticated user
            'property_id' => $request->property_id,
            'review_type' => $request->review_type,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'anonymous_review' => $request->anonymous_review ?? false
        ]);

        return response()->json($review, 201);
    }

    public function destroy($id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        $user = Auth::user();
        $isAdmin = $user->user_type === UserType::ADMIN || $user->user_type === UserType::SUPER_ADMIN;

        if ($review->user_id !== $user->id && !$isAdmin) {
            return response()->json(['message' => 'You are not authorized to delete this review.'], 403);
        }

        $review->delete();

        return response()->json(null, 204);
    }

    // Get reviews for a specific property (Public)
    public function getByProperty($propertyId)
    {
        $reviews = Review::where('property_id', $propertyId)
        ->with(['user'])
        ->get()
        ->map(function ($review) {
            return [
                'id' => $review->id,
                'user_id' => $review->user_id,
                'property_id' => $review->property_id,
                'review_type' => $review->review_type,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'anonymous_review' => $review->anonymous_review,
                'created_at' => $review->created_at,
                'updated_at' => $review->updated_at,
                'user_name' => $review->anonymous_review ? 'Anonymous' : ($review->user ? $review->user->name : 'Unknown')
            ];
        });

    return response()->json($reviews);
    }
}
