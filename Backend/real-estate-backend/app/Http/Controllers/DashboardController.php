<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller

    {
        public function index(Request $request)
        {
            $userType = $request->user()->user_type;
    
            if ($userType === UserType::SUPER_ADMIN) {
                // Return super-admin dashboard with super-admin options
                return response()->json([
                    'success' => 'Super Admin Dashboard',
                    
                ]);
            } elseif ($userType === UserType::ADMIN) {
                // Return admin dashboard without super-admin options
                return response()->json([
                    'success' => 'Admin Dashboard',
                   
                ]);
            }
    
            // Fallback response
            return response()->json(['error' => 'Unauthorized access'], 403);
        }
         /**
     * Create a new admin user (only accessible by super-admin).
     */
    public function createAdmin(Request $request)
    {
        // Ensure the authenticated user is a super-admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can create admins.'], 403);
        }

        // Validate the request data
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone_number' => 'required|string|unique:users,phone_number',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        // Create the admin user
        $admin = User::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone_number' => $validatedData['phone_number'],
            'country' => $validatedData['country'],
            'city' => $validatedData['city'],
            'address' => $validatedData['address'],
            'user_type' => 'admin',
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => $admin,
        ], 201);
    }

/**
 * Delete a regular user (accessible by both super-admin and admin).
 */
public function destroyUser(Request $request, $userId)
{
    // Ensure the authenticated user is either a super-admin or an admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins and admins can delete users.'], 403);
    }

    // Find the user to delete
    $user = User::find($userId);

    // Check if the user exists
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Prevent users from deleting themselves
    if ($user->id === $request->user()->id) {
        return response()->json(['error' => 'You cannot delete yourself.'], 403);
    }

    // Ensure the target user is a regular user
    if ($user->user_type !== UserType::USER) {
        return response()->json(['error' => 'Forbidden. You can only delete regular users.'], 403);
    }

    // Delete the user
    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully',
    ], 200);
}

/**
 * Delete an admin (accessible only by super-admin).
 */
public function destroyAdmin(Request $request, $adminId)
{
    // Ensure the authenticated user is a super-admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can delete admins.'], 403);
    }

    // Find the admin to delete
    $admin = User::find($adminId);

    // Check if the admin exists
    if (!$admin) {
        return response()->json(['error' => 'Admin not found'], 404);
    }

    // Prevent super-admin from deleting themselves
    if ($admin->id === $request->user()->id) {
        return response()->json(['error' => 'You cannot delete yourself.'], 403);
    }

    // Ensure the target user is an admin
    if ($admin->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. You can only delete admins.'], 403);
    }

    // Delete the admin
    $admin->delete();

    return response()->json([
        'message' => 'Admin deleted successfully',
    ], 200);
}
     /**
     * Show all users (accessible by super-admin and admin).
     */
    public function showUsers(Request $request)
    {
        // Ensure the authenticated user is either a super-admin or an admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins and admins can view users.'], 403);
        }

        // Fetch all users except super-admin
    $users = User::where('user_type', '!=', UserType::SUPER_ADMIN)->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Show all admins (accessible only by super-admin).
     */
    public function showAdmins(Request $request)
    {
        // Ensure the authenticated user is a super-admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view admins.'], 403);
        }

        // Fetch all admins except super-admin
    $admins = User::where('user_type', UserType::ADMIN)->get();

        return response()->json([
            'success' => true,
            'admins' => $admins,
        ]);
    }
}
