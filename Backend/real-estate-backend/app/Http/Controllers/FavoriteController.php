<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->favorites()->paginate();
    }

    public function store(Request $request, Property $property)
    {
        $request->user()->favorites()->syncWithoutDetaching([$property->id]);
        
        return response()->json([
            'message' => 'Property added to favorites',
            'is_favorite' => true
        ]);
    }

    public function destroy(Request $request, Property $property)
    {
        $request->user()->favorites()->detach($property->id);
        
        return response()->json([
            'message' => 'Property removed from favorites',
            'is_favorite' => false
        ]);
    }

    public function check(Request $request, Property $property)
    {
        $isFavorite = $request->user()->favorites()
            ->where('property_id', $property->id)
            ->exists();
            
        return response()->json(['is_favorite' => $isFavorite]);
    }
}
