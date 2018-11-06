<?php
/**
 * Created by PhpStorm.
 * User: hiepl
 * Date: 6/19/2017
 * Time: 11:04 PM
 */
namespace App\Http\Controllers\Tracking;

use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class DeviceMobileController extends BaseController
{
    public function __construct()
    {
        //$this->middleware('auth');
        //test
    }

    public function getDeviceLocations(Request $request){
        //$this->middleware('auth');
        $options = Input::get('options');
        $user = JWTAuth::parseToken()->authenticate();        
        $result = Tracking_device::getUserDeviceLocationMobile($user->id, $options);
        return response()->json($result);
    }

    public function login(Request $request) {
        $data = $request->getContent();
        $user_data = json_decode($data, true);
        $credentials = ['username' => $user_data['username'], 'password' => $user_data['password']];        
        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'invalid_credentials'], 400);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
        
        return response()->json(compact('token'));
    }
    
}