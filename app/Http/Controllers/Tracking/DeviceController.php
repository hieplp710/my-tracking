<?php
/**
 * Created by PhpStorm.
 * User: hiepl
 * Date: 6/19/2017
 * Time: 11:04 PM
 */
namespace App\Http\Controllers\Tracking;

use App\Models\Tracking_device;
use Illuminate\Routing\Controller as BaseController;

class DeviceController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function getDeviceLocations($user_id = 0){
        $result = Tracking_device::getUserDeviceLocation($user_id);
        return response()->json($result);
    }
}