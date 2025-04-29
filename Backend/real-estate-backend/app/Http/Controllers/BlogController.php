<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
class BlogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);

        $blogs = Blog::latest()->paginate($perPage);

        return response()->json([
            'blogs' => $blogs->items(),
            'current_page' => $blogs->currentPage(),
            'last_page' => $blogs->lastPage(),
            'per_page' => $blogs->perPage(),
            'total' => $blogs->total(),
        ], 200);
    }

  

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);
    
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'author' => 'required|string|max:255',
            'featuredImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tags' => 'nullable|array',
            'category' => 'required|string|max:255',
            'readTime' => 'required|integer|min:1',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $blog = Blog::create([
            'title' => $request->title,
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'author' => $request->author,
            'date' => now(),
            'tags' => json_encode($request->tags),
            'category' => $request->category,
            'readTime' => $request->readTime,
            'likes' => 0,
            'comments' => 0,
            'liked' => false,
            'featuredImage' => null,  
        ]);
    
        if ($request->hasFile('featuredImage')) {
            $image = $request->file('featuredImage');
            $imageName = $image->getClientOriginalName();
            $path = $image->storeAs('blogs/' . $blog->id, $imageName, 'public');
            
            $blog->update([
                'featuredImage' => 'storage/' . $path
            ]);
        }
    
        return response()->json(['blog' => $blog], 201);
    }
    

//     /**
//      * Display the specified resource.
//      */
    public function show(Blog $blog)
    {
        return response()->json(['blog' => $blog], 200);
    }

    public function update(Request $request, Blog $blog)
    {
        $this->authorizeAdmin($request);
    

        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'sometimes|required|string|max:500',
            'content' => 'sometimes|required|string',
            'author' => 'sometimes|required|string|max:255',
            'featuredImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tags' => 'sometimes|required|array',
            'category' => 'sometimes|required|string|max:255',
            'readTime' => 'sometimes|required|integer|min:1',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $data = $request->only([
            'title', 'excerpt', 'content', 'author', 'category', 'readTime'
        ]);
    
        if ($request->has('tags')) {
            $data['tags'] = json_encode($request->tags);
        }
    
        if ($request->hasFile('featuredImage')) {
            if ($blog->featuredImage && Storage::disk('public')->exists($blog->featuredImage)) {
                Storage::disk('public')->delete($blog->featuredImage);
            }
    
            $image = $request->file('featuredImage');
            $imageName = $image->getClientOriginalName();
            $path = $image->storeAs('blogs/' . $blog->id, $imageName, 'public');
            $data['featuredImage'] = 'storage/' . $path;
        }
    
        $blog->update($data);
        $blog->refresh();
    
        return response()->json(['blog' => $blog], 200);
    }
    public function destroy(Request $request, Blog $blog)
{
    $this->authorizeAdmin($request);

    if ($blog->featuredImage && Storage::disk('public')->exists($blog->featuredImage)) {
        Storage::disk('public')->delete($blog->featuredImage);
    }

    $blog->delete();

    return response()->json(['message' => 'Blog deleted successfully'], 200);
}


    protected function authorizeAdmin(Request $request): void
    {
        if (!in_array($request->user()->user_type, [UserType::SUPER_ADMIN, UserType::ADMIN])) {
            abort(403, 'Forbidden. Only admins can perform this action.');
        }
    }
}