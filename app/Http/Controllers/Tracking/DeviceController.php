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
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Input;
use Maatwebsite\Excel\Excel;

class DeviceController extends BaseController
{
    public function __construct()
    {
        //$this->middleware('auth');
        //test
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
        $deviceNewId = $request->get('deviceNewId');
        $device = Tracking_device::find($deviceId);
        //check if id is changed
        if ($deviceNewId != $deviceId) {
            $newDevice = Tracking_device::find($deviceNewId);
            if (!($newDevice instanceof Tracking_device) || !empty($newDevice->user_id) || $newDevice->status != Tracking_device::STATUS_ACTIVE){
                return response()->json(["status" => false, "error" => "Thiết bị không có thật hoặc đã có chủ"], 200);
            }
            //copy information from old device to new device
            $newDevice->activated_at = $device->activated_at;
            $newDevice->updated_at =  $device->updated_at;
            $newDevice->expired_at =  $device->expired_at;
            $newDevice->current_state =  $device->current_state;
            $newDevice->user_id = $device->user_id;
            $newDevice->device_number = $deviceName;
            $newDevice->save();
            //set old device to in-active
            $device->status = Tracking_device::STATUS_IN_ACTIVE;
            $device->save();
            return response()->json(["status" => true, "error" => false, "reload" => true]);
        } else {
            //change only device's name
            $this->changeDeviceName($device, $deviceName);
            return response()->json(["status" => true, "error" => false]);
        }
        return response()->json(["status" => false, "error" => "Not support method"], 500);
    }

    private function changeDeviceName(Tracking_device $device, $deviceName) {
        if ($device instanceof Tracking_device) {
            $device->device_number = $deviceName;
            $device->save();
        }
    }

    public function exportExport() {
        $excelHandler = App::make('excel');
        $filename = "Flock_DataAdmin_" . \Date::now()->format('Ymd');

        $excelHandler->create($filename, function($excel) {
            // Call writer methods here
            // Set the title
            $excel->setTitle('Danh sách thiết bị');
            // Chain the setters
            $excel->setCreator('Flock.vn')
                ->setCompany('Flock.vn');
            $excel->sheet('Sheetname', function($sheet) {
                $sheet->mergeCells('A1:I1');
                $sheet->cell('A1', function($cell) {
                    // manipulate the cell
                    $cell->setValue('DANH SÁCH THIẾT BỊ');
                    // Set font size
                    $cell->setFontSize(16);
                    // Set font weight to bold
                    $cell->setFontWeight('bold');
                    // Set alignment to center
                    $cell->setAlignment('center');
                });
                $data = Tracking_device::getExportDeviceData();

                $len = count($data) + 2;
                $sheet->cells("A2:I$len", function($cells) {
                    // manipulate the range of cells
                    // Set all borders (top, right, bottom, left)
                    // Set borders with array
                    $cells->setBorder(array(
                        'top'   => array(
                            'style' => 'solid'
                        ),
                    ));
                });
                $sheet->setBorder("A2:I$len", 'solid');
                $sheet->fromArray($data, null, 'A2', true);

            });

        })->export('xlsx');
    }
}