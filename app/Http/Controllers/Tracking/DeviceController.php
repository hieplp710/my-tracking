<?php
/**
 * Created by PhpStorm.
 * User: hiepl
 * Date: 6/19/2017
 * Time: 11:04 PM
 */
namespace App\Http\Controllers\Tracking;

use App\Models\Tracking_device;
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
        $lastPoint = Input::get('lastPoint');
        $options = !empty($lastPoint) ? ['last_point' => $lastPoint] : null;
        $result = Tracking_device::getUserDeviceLocation($user_id, $options);
        return response()->json($result);
    }

    public function location(Request $request){        
        if ($request->isMethod('post')){
            $data = $request->getContent();
            $location = new Tracking_device();
            $result = $location->handleLocation($data);
            return response()->json($result);
        }
        return response()->json(["status" => false, "error" => "Not support method"]);
    }
}