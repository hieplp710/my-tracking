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
use App\Models\Reports\GeneralReport;

class DeviceMobileController extends BaseController
{   
    const ROADMAP_LIMIT_MOBILE = 1000;
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

    public function getRoadmap(Request $request){
        $roadmapLimit = self::ROADMAP_LIMIT_MOBILE;
        $data = $request->getContent();
        $options = json_decode($data, true);
        $result = Tracking_device::getRoadMapMobile($options);
        return response()->json($result); 
    }

    public function getUserProfile(Request $request){
        $user = JWTAuth::parseToken()->authenticate();
        return response()->json($user);        
    }

    public function getGeneralReport(Request $request) {
        $data = $request->getContent();
        $device_data = json_decode($data, true);        
        $device = Tracking_device::find($device_data['deviceId']);
        if (!$device) {
            return response()->json(["status" => false, "error" => "Thiết bị không tồn tại"]);
        }
        $start_date = $device_data['startDate'];
        $end_date = $device_data['endDate'];
        $device_id = $device_data['deviceId'];
        $from_date_obj = Carbon::createFromFormat(Tracking_device::MOBILE_DATETIME_FORMAT, $start_date, 'Asia/Ho_Chi_Minh');
        $from_date_obj->setTimezone('UTC');
        $to_date_obj = Carbon::createFromFormat(Tracking_device::MOBILE_DATETIME_FORMAT, $end_date, 'Asia/Ho_Chi_Minh');
        $to_date_obj->setTimezone('UTC');
        $from_date = $from_date_obj->format(Tracking_device::DB_DATETIME_FORMAT);
        $to_date = $to_date_obj->format(Tracking_device::DB_DATETIME_FORMAT);
        $device_id = !empty($device_id) ? $device_id : '0';
        $filename = "Flock_Bao_Cao_Tong_Hop_" . \Date::now()->format('Ymd');
        $data = GeneralReport::getGeneralReportMobileData($device_id, $from_date, $to_date);
        return response()->json(["status" => true, "data" => $data]);
    }

    public function getDeviceList(Request $request) {
        $user = JWTAuth::parseToken()->authenticate();        
        $result = Tracking_device::getDeviceList($user->id);
        return response()->json($result);
    }

    public function changeDeviceName(Request $request){        
        $data = $request->getContent();
        $device_data = json_decode($data, true);
        $device = Tracking_device::find($device_data['deviceId']);
        if (!empty($device)) {
            $device->device_number = $device_data['deviceName'];
            $device->save();
            return response()->json(["status"=>true]);
        }
        return response()->json(["status"=>false, "error" => "Mã thiết bị không tồn tại"]); 
    }
    
    public function updatePassword(Request $request){        
        $dataRaw = $request->getContent();
        $data = json_decode($dataRaw, true);
        $user = JWTAuth::parseToken()->authenticate();
        if (isset($data['password']) && !empty($data['password'])) {
            $user->password = Hash::make($data['password']);
            $user->save();
            return response()->json(["status"=>true]); 
        }        
        return response()->json(["status"=>false, "error" => "Cập nhật mật khẩu không thành công"]); 
    }

    public function updateProfile(Request $request) {
        $user = JWTAuth::parseToken()->authenticate();
        $dataRaw = $request->getContent();
        $data = json_decode($dataRaw, true);
        $user->phone = isset($data['phone']) ? $data['phone'] : $user->phone;
        $user->email = isset($data['email']) ? $data['email'] : $user->email;
        $user->name = isset($data['name']) ? $data['name'] : $user->name;
        $user->save();
        return ["status" => true, "data" => $user->toArray()];
    }
}