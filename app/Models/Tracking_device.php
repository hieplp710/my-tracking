<?php

namespace App\Models;

use App\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\CrudTrait;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Devicelocation;
use App\Models\Mobile_Detect;
use Illuminate\Support\Facades\Log;
use Monolog\Logger;

class Tracking_device extends Model
{
    use CrudTrait;
    use Helper;
    protected $fillable = ['id','device_number', 'setting', 'sim_infor', 'activated_at', 'user_id'];
    protected $table = 'tracking_devices';
    const REQUEST_TYPE_LOCATION = 1;
    const REQUEST_TYPE_LOCATION_ROLLBACK = 2;
    const REQUEST_TYPE_SIM_INFOR = 3;
    const DB_DATETIME_FORMAT = 'Y-m-d H:i:s';
    const DEVICE_DATETIME_FORMAT = 'y-m-d H:i:s';
    const ROADMAP_LIMIT = 1000;
    const ROADMAP_LIMIT_MOBILE = 1000;
     /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    //protected $table = 'tracking_devices';
    //protected $primaryKey = 'id';
    // public $timestamps = false;
    // protected $guarded = ['id'];
    // protected $fillable = [];
    // protected $hidden = [];
    // protected $dates = [];

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */
    public function getUserName(){
        $user = User::where('id', $this->user_id)
            ->get();
        return (isset($user) && $user->first()) ? $user->first()->name : '';
    }

    public function displayCreatedAt(){
        return Helper::formatDatetime($this->created_at);
    }

    public function displayActivatedAt(){
        return Helper::formatDatetime($this->activated_at);
    }

    public static function getUserDeviceLocation($user_id = 0, $options = []){
        $is_roadmap = isset($options['isRoadmap']) ? $options['isRoadmap'] : false;
        $query = '';
        $roadmapLimit = self::ROADMAP_LIMIT;
        $detecter = new Mobile_Detect();
        if ($detecter->isMobile()){
            $roadmapLimit = self::ROADMAP_LIMIT_MOBILE;
        }
        if (!$is_roadmap) {
            $last_point = isset($options["lastPoint"]) ?  (" AND l.created_at > '" . $options["lastPoint"]['last_point'] . "'") : '';
            $current_user = Auth::user()->getAuthIdentifier();
            $user_condition = !empty($user_id) ? " and d.user_id = $user_id" : " and d.user_id = $current_user";
            $date_current = new Carbon();
            $date_current->subDay(1);
            $yesterday = $date_current->format(self::DB_DATETIME_FORMAT);
            // and l.created_at >= '$yesterday'
            if ($last_point == '') {
                $query = "select d.id as device_id_main, IFNULL(d.device_number,'N/A') as device_number, l.* 
                    from tracking_devices as d
                        left join device_locations as l on d.id = l.device_id
                    where d.is_deleted = 0 $user_condition
                        and l.created_at >= (select MAX(l.created_at) 
                            from tracking_devices as d1
                            left join device_locations as l on d1.id = l.device_id  where d1.id = d.id)
                    group by d.id
                    order by d.id, l.created_at desc, l.status asc";
            } else {
                $query = "select d.id as device_id_main, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                inner join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 $last_point $user_condition
                order by d.id, l.created_at desc, l.status asc";
            }
        } else {
            $from_date = $options['dateFrom'] ? $options['dateFrom'] : '';
            $to_date = $options['dateTo'] ? $options['dateTo'] : '';
            $device_id = $options['deviceId'] ? $options['deviceId'] : '';
            $next_loc = (isset($options['nextLoc']) && !empty($options['nextLoc'])) ? $options['nextLoc'] : '';
            $from_date_obj = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $from_date, 'Asia/Ho_Chi_Minh');
            $from_date_obj->setTimezone('UTC');
            $to_date_obj = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $to_date, 'Asia/Ho_Chi_Minh');
            $to_date_obj->setTimezone('UTC');
            $from_date = $from_date_obj->format(self::DB_DATETIME_FORMAT);
            $to_date = $to_date_obj->format(self::DB_DATETIME_FORMAT);
            //if next loc defined, get only after next loc
            $condition_next_loc = '';
            if (!empty($next_loc)) {
                $condition_next_loc = " AND l.created_at > '$next_loc'";
            }
            $query = "select d.id as device_id_main, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                inner join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 and l.created_at >= '$from_date' and l.created_at <= '$to_date' and l.device_id='$device_id' $condition_next_loc
                order by d.id, l.created_at, l.status limit $roadmapLimit";
        }
//        echo '<pre>';
//        print_r($query);
//        echo '</pre>';
//        exit();
        $locations = DB::select($query, []);
        $location_devices = [];

        $result = ["status" => true, "error" => false, "data" => [], "last_points" => null, "hasMore" => false];
        $has_more = false;
        if ($is_roadmap) {
            $has_more = count($locations) >= $roadmapLimit ? true : false;
        }
        if ($locations){
            if (!$is_roadmap){
                $locations = array_reverse($locations);
            }
            $last_time = 0;
            foreach($locations as $location_device){
                $tempTime = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC')->format('U');
                if (intval($tempTime) > $last_time){
                    $last_point_item = $location_device;
                    $last_time = intval($tempTime);
                }
                if (!isset($location_devices[$location_device->device_id_main])){
                    $location_devices[$location_device->device_id_main] = [
                        "device_id" => $location_device->device_id_main,
                        "device_number" => $location_device->device_number,
                        "locations" => []
                    ];
                }
                if (isset($location_devices[$location_device->device_id_main]) && !empty($location_device->id)){
                    if (is_numeric($location_device->lat) && is_numeric($location_device->lng)) {
                        $location_device->last_point = $location_device->created_at;
                        $date_created = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC');
                        $date_created->setTimezone('Asia/Ho_Chi_Minh');
                        $location_device->created_at = $date_created->format('d-m-Y H:i:s');
                        $location_device->status = self::getStatusText(["status" => $location_device->status, 'velocity' => $location_device->velocity]);
                        $location_device->current_state = (!empty($location_device->current_state) && $location_device->current_state != '{}') ? $location_device->current_state : '';
                        $location_device->heading = self::getHeadingClass($location_device->heading);
                        $location_devices[$location_device->device_id_main]['locations'][] = $location_device;
                    }
                }
            }
            //$last_point_item = $locations[count($locations) - 1];//wrong here
            $location_devices = array_values($location_devices);
            $result = ["status" => true, "error" => false, "data" => $location_devices, "last_points" => $last_point_item, "hasMore" => $has_more];
        }
        return $result;

    }

    public function locations(){
        return $this->hasMany('App\Models\DeviceLocation');
    }

    /**
     * @param $data string encoded data
     * @return mixed
     * @description add device location
     */
    public function handleLocation($data){
        $result = ["status" => false, "error" => "Empty data!"];
        if (!empty($data)){
            $arrData = explode('|', $data);
            if (count($arrData) > 1) {
                Log::info($data);
            }
            if (count($arrData) == 0) {
                return ["status" => false, "error" => "Invalid data"];
            }
            foreach($arrData as $item) {
                $data_array = explode(',', trim($item));
                $device_id = $data_array[1];
                $device = Tracking_device::find($device_id);
                if (!($device instanceof Tracking_device)){
                    $result = ["status" => false, "error" => "Invalid device id"];
                    return $result;
                }
                $command = $data_array[2];

                //insert new location
                if ($command == self::REQUEST_TYPE_LOCATION || $command == self::REQUEST_TYPE_LOCATION_ROLLBACK){
                    $is_valid = $this->validate($data_array);
                    if (!$is_valid['status']){
                        return ["status" => false, "error" => $is_valid['error']];
                    }
                    if ($device instanceof Tracking_device) {
                        $is_valid['data']['current_state'] = $device->updateCurrentState($is_valid['data']);
                    }
                    $isSave = $this->addLocation($device, $is_valid['data']);
                    if ($isSave) $result = ["status" => true, "error" => false];
                } else if ($command == self::REQUEST_TYPE_SIM_INFOR){
                    $isSave = $this->updateDeviceInformation($device, $data_array);
                    if ($isSave) $result = ["status" => true, "error" => false];
                } else {
                    $result = ["status" => false, "error" => "Unknown command"];
                    return $result;
                }
            }
            return $result;

        }
        return false;
    }

    public function validate($data){
        if (empty($data[3])){
            return ["status" => false, "error" => "Empty time"];
        }
        $locationDate = \DateTime::createFromFormat(self::DB_DATETIME_FORMAT,$data[3]);
        if (!$locationDate){
            return ["status" => false, "error" => "Invalid time format"];
        }
        if (!is_numeric($data[4])){
            return ["status" => false, "error" => "Invalid status"];
        }
        if (!is_numeric($data[5])){
            return ["status" => false, "error" => "Invalid velocity"];
        }
        if (!is_numeric($data[6])){
            return ["status" => false, "error" => "Invalid direction"];
        }
        if (!is_numeric($data[7]) || !is_numeric($data[8])){
            return ["status" => false, "error" => "Invalid coordinates"];
        }
        if (!is_numeric($data[9])){
            return ["status" => false, "error" => "Invalid reverser"];
        }
        if (!is_numeric($data[10])){
            return ["status" => false, "error" => "Invalid checksum"];
        }
        $result = [
            "time" => $data[3],
            "status" => $data[4],
            "velocity" => $data[5],
            "heading" => $data[6],
            "lat" => $data[7],
            "lng" => $data[8],
            "reverser" => $data[9],
            "checksum" => $data[10],
            "command" => $data[2]
        ];
        return ["status" => true, "error" => false, "data" => $result];
    }

    private function addLocation($device, $data){
        $location = new Devicelocation();
        $location->device_id = $device->id;
        $location->lat = $data['lat'];
        $location->lng = $data['lng'];
        $location->status = $data['status'];
        $location->heading = $data['heading'];
        $location->velocity = intval($data['velocity'] * 1.85);
        $location->created_at = $data['time'];
        $location->reverser = $data['reverser'];
        $location->checksum = $data['checksum'];
        $location->updated_at = date(self::DB_DATETIME_FORMAT);
        $location->command = $data['command'];
        $location->current_state = !empty($data['current_state']) ? $data['current_state'] : '{}';
        $location->is_deleted = 0;

        return $location->save();
    }
    /**
     * @param $data
     * @description update device information
     * @return boolean
     */
    public function updateDeviceInformation($device, $data){
        if (isset($data[4]) && !empty($data[4])){
            $device->sim_infor = $data[4];
            return $device->save();
        }
        return false;
    }

    /**
     * @description update current_state field in order to calculate status of device
     */
    private function updateCurrentState($location) {
        $current_state = $this->current_state;
        $statusText = '';
        if (empty($current_state) || $current_state == '{}') {
            //update new device with first state
            $this->current_state = json_encode($location);
            $this->save();
        } else {
            //for update
            $current_state_obj = json_decode($current_state, true);
            $current_time = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $current_state_obj['time']);
            $location_time = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $location['time']);
            $different = 0;

            if ($current_time < $location_time) {
                //for normal location
                if ($current_state_obj['status'] == $location['status']) {
                    //expand status time in current status
                    $different = $current_time->diffInSeconds($location_time);
                    $statusText = self::getDifferentTime($different);
                } else {
                    //$statusText = self::getStatusText($location);
                    $this->current_state = json_encode($location);
                }
                $this->save();

            } else {
                //for rollback location
                //get location that nearest of rollback update
                $nearest_ago_loc = Devicelocation::where('created_at' , '<', $location_time->format(self::DB_DATETIME_FORMAT))
                    ->orderBy('created_at', 'desc')->take(1)->first();
                $nearest_later_loc = Devicelocation::where('created_at' , '>', $location_time->format(self::DB_DATETIME_FORMAT))
                    ->orderBy('created_at', 'asc')->take(1)->first();
                //update status for later loc
                $statusLatterText = '';
                if ($nearest_later_loc instanceof Devicelocation) {
                    if ($location['status'] == $nearest_later_loc->status) {
                        //expand status time in current status
                        $later_location_time = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $nearest_later_loc->created_at);
                        $different = $location_time->diffInSeconds($later_location_time);
                        //$statusLatterText = self::getStatusText($nearest_later_loc->toArray()) . ' trong ' . self::getDifferentTime($different);
                        $statusLatterText = self::getDifferentTime($different);
                    } else {
                        //$statusLatterText = self::getStatusText($nearest_later_loc->toArray());
                    }
                    $nearest_later_loc->current_state = $statusLatterText;
                    $nearest_later_loc->save();
                }

                //update status
                if ($nearest_ago_loc instanceof Devicelocation) {
                    if ($location['status'] == $nearest_ago_loc->status) {
                        //expand status time in current status
                        $ago_location_time = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $nearest_ago_loc->created_at);
                        $different = $ago_location_time->diffInSeconds($location_time);
                        //$statusText = self::getStatusText($location) . ' trong ' . self::getDifferentTime($different);
                        $statusText = self::getDifferentTime($different);
                    } else {
                        //$statusText = self::getStatusText($location);
                    }
                }
            }
        }
        return $statusText;
    }

    public static function getStatusText($location) {
        $text = '';
        if ($location['status'] == 1 && $location['velocity'] > 0) {
            $text = 'Đang chạy';
        } else if ($location['status'] == 1 && $location['velocity'] <= 0) {
            $text = 'Dừng';
        } else {
            $text = 'Đỗ';
        }
        return $text;
    }

    public static function getDifferentTime($diff_in_seconds = 0)
    {
        $textTime = '';
        $hours = intval($diff_in_seconds / 3600);
        $mins = intval(($diff_in_seconds % 3600) / 60);
        $secs = ($diff_in_seconds % 60);
        $textTime = "$secs giây";
        if ($mins > 0) {
            $textTime = "$mins phút, " . $textTime;
        }
        if ($hours > 0) {
            $textTime = "$hours giờ, " . $textTime;
        }
        return $textTime;
    }

    public static function getHeadingClass($heading = 0) {
        $headingClass = "";
        if ($heading >= 0 && $heading <= 22.5){
            $headingClass = "hd1";
        } else if ($heading <= 45){
            $headingClass = "hd2";
        } else if ($heading <= 67.5) {
            $headingClass = "hd3";
        } else if ($heading <= 90) {
            $headingClass = "hd4";
        } else if ($heading <= 112.5) {
            $headingClass = "hd5";
        } else if ($heading <= 135) {
            $headingClass = "hd6";
        } else if ($heading <= 157.5) {
            $headingClass = "hd7";
        } else if ($heading <= 180) {
            $headingClass = "hd8";
        } else if ($heading <= 202.5) {
            $headingClass = "hd9";
        } else if ($heading <= 225) {
            $headingClass = "hd10";
        } else if ($heading <= 247.5) {
            $headingClass = "hd11";
        } else if ($heading <= 270) {
            $headingClass = "hd12";
        } else if ($heading <= 292.5) {
            $headingClass = "hd13";
        } else if ($heading <= 315) {
            $headingClass = "hd14";
        } else if ($heading <= 337.5) {
            $headingClass = "hd15";
        } else if ($heading <= 360) {
            $headingClass = "hd16";
        }
        return $headingClass;
    }

}
