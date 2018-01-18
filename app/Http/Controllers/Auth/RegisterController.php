<?php

namespace App\Http\Controllers\Auth;

use App\Models\Tracking_device;
use App\User;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
         return Validator::make($data, [
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:6|confirmed',
            'username' => 'required|string|max:50|unique:users|regex:/(^([a-zA-Z]+)(\d+)?$)/u',
            'phone' => 'required|min:10|numeric',
            'device_id' => 'inactive|min:10|max:10',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'],
            'phone' => $data['phone'],
            'password' => bcrypt($data['password']),
        ]);
        if ($user instanceof User) {
            //update device to user
            $device = Tracking_device::where('id', '=', $data['device_id'])
                ->where('is_deleted', '=', 0)
                ->where(function ($query) {
                    $query->orWhere('user_id', '=', 0)
                        ->orWhereNull('user_id');
                })
                ->take(1)
                ->get();
            if ($device[0] instanceof Tracking_device) {
                $device[0]->user_id = $user->id;
                $device[0]->device_number = $data['device_name'] ? $data['device_name'] : $data['device_id'];
                //set activated at and expired at
                $now = Carbon::now('UTC');
                $nextYear = Carbon::now('UTC')->addYears(1);
                $device[0]->activated_at = $now->format(Tracking_device::DB_DATETIME_FORMAT);
                $device[0]->expired_at = $nextYear->format(Tracking_device::DB_DATETIME_FORMAT);
                $device[0]->save();
            }
        }
        return $user;
    }
}
