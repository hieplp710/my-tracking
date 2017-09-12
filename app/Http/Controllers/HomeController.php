<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $site_url = config('app.url');
        return view('home',["url" => $site_url]);
    }

    public function getUserProfile() {
        $user = Auth::user();
        return ["status" => true, "data" => $user->toArray()];
    }

    public function saveUserProfile(Request $request) {
        $user = Auth::user();
        $data = $request->get('data');
        $user->phone = isset($data['phone']) ? $data['phone'] : $user->phone;
        $user->email = isset($data['email']) ? $data['email'] : $user->email;
        $user->name = isset($data['name']) ? $data['name'] : $user->name;

        if (isset($data['password']) && !empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();
        return ["status" => true, "data" => $user->toArray()];
    }
}
