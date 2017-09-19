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
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Input;

class DeviceController extends BaseController
{
    public function __construct()
    {
        //$this->middleware('auth');
    }

    public function getDeviceLocations(Request $request, $user_id = 0){
        $this->middleware('auth');
        $options = Input::get('options');
        $result = Tracking_device::getUserDeviceLocation($user_id, $options);
        return response()->json($result);
    }

    public function location(Request $request){        
        if ($request->isMethod('post')){
            $data = $request->getContent();
            $location = new Tracking_device();
            $result = $location->handleLocation($data);
            $responseCode = 200;
            if (!$result['status']) {
                $responseCode = 500;
            }
            return response()->json($result, $responseCode);
        }
        return response()->json(["status" => false, "error" => "Not support method"], 500);
    }

    public function generateDeviceId() {
        $is_valid = false;
        $device_id = '';
        do {
            $temp = self::getRandomString();
            $device = Tracking_device::find($temp);
            if (!($device instanceof Tracking_device)) {
                $is_valid = true;
                $device_id = $temp;
            }
        }while (!$is_valid);
        return $device_id;
    }
    private static function getRandomString() {
        $year = Carbon::now('UTC')->format('y');
        $rans = mt_rand(9,9999999);
        $device_id = "1" . $year . str_pad($rans,7,0,STR_PAD_LEFT);
        return $device_id;
    }
    public function updateDeviceName(Request $request) {
        $this->middleware('auth');
        $deviceId = $request->get('device_id');
        $deviceName = $request->get('name');
        $device = Tracking_device::find($deviceId);
        if ($device instanceof Tracking_device) {
            $device->device_number = $deviceName;
            $device->save();
            return response()->json(["status" => true, "error" => false]);
        }
        return response()->json(["status" => false, "error" => "Not support method"], 500);
    }
}