<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::all();
        return response()->json($blogs);
    }

    public function show($id)
    {
        $blog = Blog::findOrFail($id);
        return response()->json($blog);
    }

    public function store(Request $request)
    {
        $this->authorizeUser();

        if ($request->hasFile('featuredImage')) {
            $featuredImageUrl = $this->storeImage($request->file('featuredImage'));
        }

        $validated = $this->validateRequest($request);

        $blog = Blog::create([
            'title' => $request->title,
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'author' => $request->author,
            'date' => now(),
            'featuredImage' => $featuredImageUrl ?? null,
            'tags' => json_encode($request->tags),
            'category' => $request->category,
            'readTime' => $request->readTime,
            'likes' => 0,
            'comments' => 0,
            'liked' => false,
        ]);

        return response()->json($blog, 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeUser();

        $blog = Blog::findOrFail($id);

        if ($request->hasFile('featuredImage')) {
            $this->deleteImage($blog->featuredImage);
            $featuredImageUrl = $this->storeImage($request->file('featuredImage'));
        } else {
            $featuredImageUrl = $blog->featuredImage;
        }

        $validated = $this->validateRequest($request);

        $blog->update([
            'title' => $request->title,
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'author' => $request->author,
            'date' => now(),
            'featuredImage' => $featuredImageUrl,
            'tags' => json_encode($request->tags),
            'category' => $request->category,
            'readTime' => $request->readTime,
        ]);

        return response()->json($blog);
    }

    public function destroy($id)
    {
        $this->authorizeUser();

        $blog = Blog::findOrFail($id);

        $this->deleteImage($blog->featuredImage);

        $blog->delete();

        return response()->json([
            'status' => true,
            'message' => 'Blog deleted successfully.',
            'id' => $id,
        ]);
    }

    private function authorizeUser()
    {
        $user = Auth::user();
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }
    }

    private function storeImage($image)
    {
        $imagePath = $image->store('public/blogs');
        return Storage::url($imagePath);
    }

    private function deleteImage($imageUrl)
    {
        if ($imageUrl) {
            Storage::delete($imageUrl);
        }
    }

    private function validateRequest(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'author' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'category' => 'required|string|max:255',
            'readTime' => 'required|integer|min:1',
            'featuredImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
    }
}
