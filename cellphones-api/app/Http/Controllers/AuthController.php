<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    // Đăng ký (đơn giản)
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'user',
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
        ], 201);
    }

    // Đăng nhập (session-based)
    public function login(Request $request)
    {
        $cred = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        if (!Auth::attempt($cred)) {
            throw ValidationException::withMessages([
                'email' => ['Sai email hoặc mật khẩu.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user'    => Auth::user(),
        ], 200);
    }

    // Lấy user hiện tại (đã đăng nhập)
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }
}
