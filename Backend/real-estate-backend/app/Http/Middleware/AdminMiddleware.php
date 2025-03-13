<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{  /**
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
   
       // Check if the authenticated user is an admin
       if (Auth::guard('sanctum')->user()->user_type !== 'admin') {
           return response()->json(['error' => 'Forbidden. Admin access only.'], 403);
       }
   
       return $next($request);
   }
}
