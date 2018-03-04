<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Request;

class ToolController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function deleteLocation() {
        return view('vendor/backpack/base/tool');
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
}
