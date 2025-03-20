<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{      /**
    * Handle an incoming request.
    *
    * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
    */
   public function handle(Request $request, Closure $next): Response
   {
    // Check if the user is authenticated using Sanctum
    if (!Auth::guard('sanctum')->check()) {
        return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
    }

    // Check if the authenticated user is an admin or super-admin
    $user = Auth::guard('sanctum')->user();
    if ($user->user_type !== 'admin' && $user->user_type !== 'super-admin') {
        return response()->json(['error' => 'Forbidden. Admin access only.'], 403);
    }

    // Attach the role to the request for further use in controllers
    $request->merge(['role' => $user->user_type]);

    return $next($request);
}
}
