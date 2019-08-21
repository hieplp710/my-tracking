<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Request;
use App\Models\Tracking_device;

class BulkEditStatusController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function bulkEditStatusDevice() {
        $user = Auth::user();
        if (!$user->hasRole('Admin')){
            echo "Không có quyền truy cập!";
            return false;
        }
        return view('vendor/backpack/base/bulk_edit_status');
    }

    public function doDeleteLocation(Request $request) {
        $time = Input::get('time');
        $date = Carbon::createFromFormat('d/m/Y', $time);
        $current = Carbon::now();
        $diff = $date->diffInMonths($current);
        $user = Auth::user();
        if (!$user->hasRole('Admin')){
            return response()->json(['status' => false, 'error' => "Bạn không có quyền thực hiện hành động này"]);
        }
        if ($diff < 2) {
            return response()->json(['status' => false, 'error' => "Trước tháng hiện tại 2 tháng hoặc hơn"]);
        }
        $date->setTime(23, 59, 59);
        $dateStr = $date->format('Y-m-d H:i:s');
        $statement = "delete from device_locations where created_at <= '$dateStr';";
        $deleted = DB::delete($statement);
        return response()->json(['status' => true, 'error' => false]);
    }

    public function getExpiredDevices(Request $request) {
        //get time
        $begin_time = Input::get('begin_time');
        $end_time   = Input::get('end_time');
        $filter_date = [];        
        if (isset($begin_time) && isset($end_time)) {
            $begin_date = Carbon::createFromFormat('d/m/Y', $begin_time);
            $end_date   = Carbon::createFromFormat('d/m/Y', $end_time);
            $filter_date = [
                "begin_date" => $begin_date,
                "end_date"   => $end_date,
            ];
        }        
        $devices = Tracking_device::getExpiredDevices($filter_date);
        return response()->json(['status' => true, "data" => $devices, 'error' => false]);
    }

    public function updateDeviceStatus(Request $request) {
        //get time
        $data = Input::get('data');        
        $result = Tracking_device::bulkUpdateStatus($data);
        return response()->json($result);
    }
}
