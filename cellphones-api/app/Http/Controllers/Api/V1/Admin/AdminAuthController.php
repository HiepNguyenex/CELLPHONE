<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    // POST /api/v1/admin/login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Sai email hoặc mật khẩu'], 422);
        }
        if (($user->role ?? 'user') !== 'admin') {
            return response()->json(['message' => 'Tài khoản không có quyền admin'], 403);
        }

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login OK',
            'token'   => $token,
            'user'    => $user, // có appends is_admin
        ]);
    }

    // GET /api/v1/admin/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // POST /api/v1/admin/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Admin logout OK']);
    }
}
