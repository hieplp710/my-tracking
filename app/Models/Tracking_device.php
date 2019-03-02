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
use Jenssegers\Date\Date;
use Monolog\Logger;

class Tracking_device extends Model
{
    use CrudTrait;
    use Helper;
    protected $fillable = ['id','device_number', 'setting', 'sim_infor', 'activated_at', 'user_id', 'status', 'expired_at'];
    protected $table = 'tracking_devices';
    const REQUEST_TYPE_LOCATION = 1;
    const REQUEST_TYPE_LOCATION_ROLLBACK = 2;
    const REQUEST_TYPE_SIM_INFOR = 3;
    const DB_DATETIME_FORMAT = 'Y-m-d H:i:s';
    const DEVICE_DATETIME_FORMAT = 'y-m-d H:i:s';
    const ROADMAP_LIMIT = 1000;
    const ROADMAP_LIMIT_MOBILE = 1000;
    const VELOCITY_RATIO = 1.85;
    const STATUS_ACTIVE = 1;
    const STATUS_IN_ACTIVE = 0;
    const STATUS_EXTEND_EXPIRED = 2;
    const STATUS_UNUSED = 3;
    const ERROR_CODE_INVALID_LOCATION = '__error_loc_data__';

    const STATUS_DEVICE_RUN = 'RUN';
    const STATUS_DEVICE_STOP = 'STOP';
    const STATUS_DEVICE_PARK = 'PARK';
    const STATUS_DEVICE_LOST_GSM = 'LOST_GSM';
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
        return (isset($user) && $user->first()) ? $user->first()->username : '';
    }

    public function getStatus(){
        $values = ["1" => "Active", "0" => "In-Active", "2" => "Extend Expired", "3" => "Unused"];
        return isset($values[$this->status]) ? $values[$this->status] : '';
    }

    public function displayCreatedAt(){
        return Helper::formatDatetime($this->created_at);
    }

    public function displayExpiredAt() {
        return Helper::formatDatetime($this->expired_at);
    }

    public function displayActivatedAt(){
        return Helper::formatDatetime($this->activated_at);
    }

    public function getLastStatus(){ 
        return self::getMixedStatus($this->current_state_mobile);
    }

    public static function getMixedStatus($location_json) {
        $data = json_decode($location_json, true);
        if (!$data) {
            return "";
        }        
        $statusText = self::getStatusMapping(self::getStatusText($data));
        $last_status = "";
        if (isset($data['time']) && !empty($data['time'])){            
            $last_time = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $data['time']);
            $last_time->setTimezone('Asia/Ho_Chi_Minh');
            $last_status = $last_time->format('d-m-Y H:i:s') . ", ";                       
        }
        $last_status .= "$statusText, ";
        $velocity = (round(floatval($data['velocity']) * self::VELOCITY_RATIO, 1)) . "km/h";
        $last_status .= "$velocity";
        return $last_status; 
    }

    public static function get_client_ip() {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if(isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    public static function getUserDeviceLocation($user_id = 0, $options = []){
        //check user device
        //return ["status" => true, "error" => false, "data" => [], "last_points" => null, "hasMore" => false];
        $is_roadmap = isset($options['isRoadmap']) ? $options['isRoadmap'] : false;
        $query = '';
        $roadmapLimit = self::ROADMAP_LIMIT;
        $detecter = new Mobile_Detect();
        if ($detecter->isMobile()){
            $roadmapLimit = self::ROADMAP_LIMIT_MOBILE;
        }
        $last_point = '';
        $num_of_day = env('NUMBER_DAY_QUERY', 7);
        $locations = [];
        //check user that contact to server by range of ip
        $range_of_ip = env('IP_RANGE_TRACKING', '');
        $ip_requested = self::get_client_ip();

        if (!empty($range_of_ip)) {
            if (preg_match("/$range_of_ip/", $ip_requested) != 0) {
                //log to file
                $current_user = Auth::user()->getAuthIdentifier();
                Log::info("----------------- The user id $current_user is contact server abnormal at IP  $ip_requested -----------------\n");
            }
        }
        $current_user = Auth::user()->getAuthIdentifier();
        if (!$is_roadmap) {
            $last_point = isset($options["lastPoint"]) ?  (" AND l.created_at > '" . $options["lastPoint"]['last_point'] . "'") : '';
            $user_condition = !empty($user_id) ? " and d.user_id = $user_id" : " and d.user_id = $current_user";
            $date_current = new Carbon();
            $date_current->subDay($num_of_day);
            $yesterday = $date_current->format(self::DB_DATETIME_FORMAT);
            // and l.created_at >= '$yesterday'
            $retrist_time = "and l.created_at >= '$yesterday'";
            if ($last_point == '') {
                Log::info("----------------- First location, the user id $current_user is contact server abnormal at IP  $ip_requested -----------------\n");

                $deviceQuery = "select d.id as device_id_main,d.current_state as current_state_device, 
                      d.expired_at, IFNULL(d.device_number,'N/A') as device_number
                    from tracking_devices as d
                    where d.is_deleted = 0 and d.status = 1 $user_condition";
                $devices = DB::select($deviceQuery, []);
                if ($devices) {
                    for($i = 0; $i < count($devices); $i++){
                        $devices[$i]->command = '';
                        $devices[$i]->lat = '';
                        $devices[$i]->lng = '';
                        $devices[$i]->status = '';
                        $devices[$i]->heading = '';
                        $devices[$i]->created_at = '';
                        $devices[$i]->updated_at = '';
                        $devices[$i]->current_state = '';
                        $devices[$i]->velocity = '';
                        $devices[$i]->reverser = '';
                        $devices[$i]->checksum = '';
                        $devices[$i]->id = '';
                        $devId = $devices[$i]->device_id_main;
                        $queryLoc = "select l.* from device_locations as l where l.device_id = '$devId' $retrist_time order by l.created_at desc limit 1";
                        //current_state_device
                        $dev_loc = DB::select($queryLoc, []);
                        if ($dev_loc && count($dev_loc) > 0) {
                            $dev_loc = $dev_loc[0];
                            $devices[$i]->command = $dev_loc->command;
                            $devices[$i]->lat = $dev_loc->lat;
                            $devices[$i]->lng = $dev_loc->lng;
                            $devices[$i]->status = $dev_loc->status;
                            $devices[$i]->heading = $dev_loc->heading;
                            $devices[$i]->created_at = $dev_loc->created_at;
                            $devices[$i]->updated_at = $dev_loc->updated_at;
                            $devices[$i]->current_state = $dev_loc->current_state;
                            $devices[$i]->velocity = $dev_loc->velocity;
                            $devices[$i]->reverser = $dev_loc->reverser;
                            $devices[$i]->checksum = $dev_loc->checksum;
                            $devices[$i]->id = $dev_loc->id;
                        } else {
                            continue;
                        }
                        $locations[] = $devices[$i];
                    }
                }
            } else {
                Log::info("----------------- N times location, the user id $current_user is contact server abnormal at IP  $ip_requested -----------------\n");
                $query = "select d.id as device_id_main,d.current_state as current_state_device, d.expired_at, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                  left join tracking_devices as d on u.id = d.user_id
                  left join device_locations as l on (d.id = l.device_id $last_point)
                where d.is_deleted = 0 and d.status = 1 $user_condition 
                order by d.id, l.created_at desc, l.updated_at desc";
                $locations = DB::select($query, []);
            }

        } else {
            Log::info("----------------- Roadmap, the user id $current_user is contact server abnormal at IP  $ip_requested -----------------\n");
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
            $query = "select d.id as device_id_main,d.current_state as current_state_device, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                inner join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 and d.status = 1 and l.created_at >= '$from_date' and l.created_at <= '$to_date' and l.device_id='$device_id' $condition_next_loc
                order by d.id, l.created_at, l.status limit $roadmapLimit";
            $locations = DB::select($query, []);
        }
        $location_devices = [];
        $result = ["status" => true, "error" => false, "data" => [], "last_points" => null, "hasMore" => false];
        $has_more = false;
        if ($is_roadmap) {
            $has_more = count($locations) >= $roadmapLimit ? true : false;
        }
        $last_point_item = isset($options["lastPoint"]) ? $options["lastPoint"] : '';
        
        if ($locations){
            if (!$is_roadmap){
                $locations = array_reverse($locations);
            }
            $last_time = 0;
            $temp_array = [];
            if ($last_point == '' && !$is_roadmap) {
                //first time
                foreach($locations as $location_device){

                    if (isset($temp_array[$location_device->device_id_main]) &&
                        $temp_array[$location_device->device_id_main]->created_at == $location_device->created_at && $location_device->status == 1){
                        continue;
                    }
                    $temp_array[$location_device->device_id_main] = $location_device;
                }
                $temp_array = array_values($temp_array);
            } else {
                $temp_array = $locations;
            }
            foreach($temp_array as $location_device){
                if (!empty($location_device->id)){
                    $tempTime = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC')->format('U');
                    if (intval($tempTime) > $last_time){
                        $last_point_item = $location_device;
                        $last_time = intval($tempTime);
                    }
                }
                
                if (!isset($location_devices[$location_device->device_id_main])){
                    $location_devices[$location_device->device_id_main] = [
                        "device_id" => $location_device->device_id_main,
                        "device_number" => $location_device->device_number,
                        "expired_date" => isset($location_device->expired_at)
                            ? Carbon::createFromFormat('Y-m-d H:i:s', $location_device->expired_at)->format('d-m-Y') : '',
                        "is_expired" => 0,
                        "locations" => []
                    ];
                    //check if over expired, extend
                    if (isset($location_device->expired_at)) {
                        //nếu ngày hến hạn lớn hơn không quá 1 tháng so với ngày hiện tại
                        //thông báo cho user biết
                        $current_date = Carbon::now('utc');
                        $expired_date = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->expired_at);
                        if ($current_date->diffInMonths($expired_date, false) < -3 && $current_date->diffInDays($expired_date, false) < -7) {
                            //update date as invalid device as set null for user_id
                            $device = Tracking_device::find($location_device->device_id_main);
                            if ($device instanceof Tracking_device) {
                                $device->status = self::STATUS_EXTEND_EXPIRED;
                                $device->save();
                            }
                            //remove device on array
                            unset($location_devices[$location_device->device_id_main]);
                            continue; //end execute and loop to another device
                        }


                        if ($current_date->diffInMonths($expired_date, false) <= 0 && $current_date->diffInDays($expired_date, false) < 0) {
                            //extend expired date
                            $new_expired = $expired_date->addDay(7);
                            $location_devices[$location_device->device_id_main]['is_expired'] = 2;
                            $location_devices[$location_device->device_id_main] ['expired_date'] = $new_expired->format('d-m-Y');
                        } else if ($current_date->diffInMonths($expired_date, false) <= 0){
                            $location_devices[$location_device->device_id_main]['is_expired'] = 1;
                        }
                    }
                }

                if (isset($location_devices[$location_device->device_id_main]) && !empty($location_device->id)){
                    $device_state = json_decode($location_device->current_state_device);
                    $current_time_utc = Carbon::now('UTC');
                    $different_gsm = 0;
                    if (!empty($device_state) && !empty($device_state->time)){
                        $last_gsm_state = Carbon::createFromFormat('y-m-d H:i:s', $device_state->time, 'UTC');
                        $different_gsm = $current_time_utc->diffInSeconds($last_gsm_state);
                    }
                    if (is_numeric($location_device->lat) && is_numeric($location_device->lng)) {
                        $location_device->last_point = $location_device->created_at;
                        $date_created = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC');
                        $date_created->setTimezone('Asia/Ho_Chi_Minh');
                        $location_device->velocity = $location_device->status > 0 ? round(intval($location_device->velocity) * self::VELOCITY_RATIO) : 0;
                        $devID = $location_device->device_id_main;
                        $location_device->status = self::getStatusText(["status" => $location_device->status, 'velocity' => $location_device->velocity]);
                        //check if status is park
                        //no longer check park
                        if ($location_device->status == self::STATUS_DEVICE_PARK && !$is_roadmap){
                            $device = Tracking_device::find($location_device->device_id_main);
                            $current_state = !empty($device->current_state) && $device->current_state != '{}' ? json_decode($device->current_state) : null;
                            $location_device->created_at_org = isset($options['lastLocation'][$devID]) ? $options['lastLocation'][$devID]['time']
                                : (!empty($current_state) ? Carbon::createFromFormat('y-m-d H:i:s', $current_state->time, 'UTC')->format(self::DB_DATETIME_FORMAT) : $location_device->created_at);
                            $created_at_obj = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at, 'UTC');
                            $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at_org, 'UTC');
                            $different = $current_time_utc->diffInSeconds($last_time_utc);
                            //nếu gửi điểm lúc đổ thì căn cứ vào lastLocation của request trước hoặc created at
                            if ($created_at_obj < $last_time_utc) {
                                $different = $current_time_utc->diffInSeconds($created_at_obj);
                            }
                            $location_device->created_at = Carbon::now()->setTimezone('Asia/Ho_Chi_Minh')->format('d-m-Y H:i:s');
                            //if diff larger than 48h hours => lost gsm
                            if ($different > 48 * 3600 && $different_gsm > 48 * 3600) {
                                //only check if park time > 2 days
                                $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                                if ($is_lostGSM) {
                                    $location_device->status = "Mất GSM";
                                }
                            }
                            $statusText = self::getDifferentTime($different);
                            $location_device->current_state = $statusText;
                        } else {
                            $location_device->created_at_org = $location_device->created_at;
                            $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at_org, 'UTC');
                            $different = $current_time_utc->diffInSeconds($last_time_utc);
                            //if diff larger than 48h hours => lost gsm
                            if ($different > 48 * 3600 && $different_gsm > 48 * 3600 && !$is_roadmap) {
                                //only check if park time > 2 days
                                $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                                if ($is_lostGSM) {
                                    $location_device->status = "Mất GSM";
                                }
                            }
                            $location_device->created_at = $date_created->format('d-m-Y H:i:s');
                            $location_device->current_state = (!empty($location_device->current_state) && $location_device->current_state != '{}') ? $location_device->current_state : '';
                        }
                        $location_device->heading = self::getHeadingClass($location_device->heading);
                        $location_device->status = self::getStatusMapping($location_device->status);
                        $location_devices[$location_device->device_id_main]['locations'][] = $location_device;
                    }
                } else if (isset($location_devices[$location_device->device_id_main]) && !$is_roadmap) {
                    //get latest position of device
                    $device_state = json_decode($location_device->current_state_device);
                    $current_time_utc = Carbon::now('UTC');
                    $devID = $location_device->device_id_main;
                    $different_gsm = 0;
                    if (!empty($device_state) && !empty($device_state->time)){
                        $last_gsm_state = Carbon::createFromFormat('y-m-d H:i:s', $device_state->time, 'UTC');
                        $different_gsm = $current_time_utc->diffInSeconds($last_gsm_state);
                    }
                    if ($options['lastLocation'][$devID]['status'] == 'Đỗ' || $options['lastLocation'][$devID]['status'] == 'Mất GSM') {
                        $location_device->last_point = $options["lastPoint"]['last_point'];
                        $location_device->velocity = 0;
                        $location_device->created_at = Carbon::now()->setTimezone('Asia/Ho_Chi_Minh')->format('d-m-Y H:i:s');
                        $location_device->status = self::getStatusText(["status" => 0, 'velocity' => 0]);
                        //get the diffirence
                        //expand status time in current status
                        $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $options['lastLocation'][$devID]['time'], 'UTC');
                        $different = $current_time_utc->diffInSeconds($last_time_utc);
                        $statusText = self::getDifferentTime($different);
                        if ($different > 48 * 3600 && $different_gsm > 48 * 3600) {
                            //only check if park time > 2 days
                            $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                            if ($is_lostGSM) {
                                $location_device->status = "Mất GSM";
                            }
                        }
                        $location_device->current_state = $statusText;
                        $location_device->heading = $options["lastPoint"]['heading'];
                        $location_device->status = self::getStatusMapping($location_device->status);
                        if ($options['lastLocation'] && isset($options['lastLocation'][$devID])) {
                            $location_device->lat = $options['lastLocation'][$devID]['lat'];
                            $location_device->lng = $options['lastLocation'][$devID]['lng'];
                            $location_device->created_at_org = $options['lastLocation'][$devID]['time'];
                        }
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

    //check the device if lost gsm
    public static function checkLostGSM($device_id) {
        $date_current = new Carbon();
        $date_current->subDay(2);
        $yesterday = $date_current->format(self::DB_DATETIME_FORMAT);
        // and l.created_at >= '$yesterday'
        $devices = Tracking_device::where('id', $device_id)->get();
        if ($devices && ($devices[0] instanceof Tracking_device)) {
            $device = $devices[0];
            $current_status = json_decode($device->current_state, true);
            if ($current_status && isset($current_status['isLostGSM'])) {
                //not to check
                return true;
            }

            $retrist_time = " l.created_at >= '$yesterday'";
            $query = "select l.created_at, l.device_id
                    from device_locations as l 
                where $retrist_time and l.device_id = $device_id order by l.created_at desc limit 1";
            //check the last location
            $locations = DB::select($query, []);
            if ($locations && count($locations) > 0) {
                return false;
            } else {
                //mark as lost gsm so that on next time, not to check
                if ($current_status) {
                    $current_status['isLostGSM'] = 1;
                    $device->current_state = json_encode($current_status);
                } else {
                    $device->current_state = json_encode(['isLostGSM' => 1]);
                }
                $device->save();
                return true;
            }
        } else {
            return true;
        }
    }

    /**
     * @param $data string encoded data
     * @return mixed
     * @description add device location
     */
    public function handleLocation($data){
        //$,1183315674,1,18-08-18 14:02:06,1,001,230,+10.73977,+106.65921,12345678,37898,#
        $result = ["status" => false, "error" => "Empty data!"];
        //return ["status" => true, "error" => false];
        if (!empty($data)){
            $arrData = explode('|', $data);
            if (count($arrData) > 1) {
                Log::info($data);
            }
            if (count($arrData) == 0) {
                return ["status" => true, "error" => "Invalid data"];
            }
            $device = null;
            foreach($arrData as $item) {
                $data_array = explode(',', trim($item));
                $device_id = $data_array[1];
                if (!$device) {
                    $device = Tracking_device::find($device_id);
                }
                if (!($device instanceof Tracking_device)){
                    $result = ["status" => false, "error" => "Invalid device id"];
                    return $result;
                }
                $command = $data_array[2];
                //insert new location
                if ($command == self::REQUEST_TYPE_LOCATION || $command == self::REQUEST_TYPE_LOCATION_ROLLBACK){
                    $is_valid = $this->validate($data_array);
                    if ($command == 2) {
                        $is_valid['data']['time'] = Carbon::now('UTC')->format('y-m-d H:i:s');
                    }

                    //remove noise location status = 1 and duplicate time
                    if (isset($is_valid['data'])){
                        $time = $is_valid['data']['time'];
                    } else {
                        Log::info("Error data: " . self::ERROR_CODE_INVALID_LOCATION. " |" . $item . "|");
                        $result = ["status" => true, "error" => false];//pass this error
                        continue;
                    }

                    $time_format = Carbon::createFromFormat('y-m-d H:i:s',$time,'UTC')->format('Y-m-d H:i:s');
                    $query = "select l.* from device_locations as l where created_at = '$time_format' and l.device_id = '$device_id'";
                    $locations = DB::select($query, []);
                    $current_obj = null;
                    $utc_now = Carbon::now('UTC');
                    $location_dup = Carbon::createFromFormat('y-m-d H:i:s',$is_valid['data']['time'], 'UTC');
                    $diff = $utc_now->diffInSeconds($location_dup);
                    if ($diff < 0){
                        Log::info($item . ' - Time in future: current: ' . $utc_now->format('d-m-Y H:i:s') . ' location: '. $location_dup->format('d-m-Y H:i:s'));
                    }
                    if ($locations && count($locations) > 0) {
                        //duplicate                      

                        if ($diff >= 300){
                            Log::info($item . ' - duplicate');
                            //return ["status" => true, "error" => false];
                            return ["status" => true, "error" => false];
                        }
                    }

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
                    $result = ["status" => true, "error" => "Unknown command"];
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
        $location->velocity = intval($data['velocity']);
        if ($data['command'] == 2) {
            $location->created_at = Carbon::now('UTC')->format(self::DB_DATETIME_FORMAT);
        } else {
            $location->created_at = $data['time'];
        }
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
            $location['refTime'] = $location['time'];
            $this->current_state = json_encode($location);
            $this->current_state_mobile = json_encode($location);
            $this->save();
        } else {
            //for update
            $current_state_obj = json_decode($current_state, true);
            $refTime = isset($current_state_obj['refTime']) ? $current_state_obj['refTime'] : $current_state_obj['time'];
            $current_time = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $refTime);
            $location_time = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $location['time']);
            $different = 0;
            if ($current_time <= $location_time) {
                //for normal location
                if ($current_state_obj['status'] == 0 && $location['status'] == 1) {
                    //not check the first run status
                    $location['status'] = 2;
                }
                if ($current_state_obj['status'] == $location['status']) {
                    //expand status time in current status
                    $different = $current_time->diffInSeconds($location_time);
                    $statusText = self::getDifferentTime($different);
                    //update the current state without refTime
                    //the location is calculated by refTime
                    //it's only changed when change status
                    $new_current_state = array_merge([], $location);
                    $new_current_state['refTime'] = $refTime;
                    $new_current_state['current_state_text'] = $statusText; //show status + diff
                    $this->current_state_mobile = json_encode($new_current_state);

                } else {
                    //$statusText = self::getStatusText($location);
                    $location['refTime'] = $location['time'];
                    $status_code = self::getStatusText($location);
                    $new_current_state['current_state_text'] = self::getStatusMapping($status_code);//show status
                    $this->current_state = json_encode($location);
                    $this->current_state_mobile = json_encode($location);
                }
                $this->save();
            } 
        }
        return $statusText;
    }

    public static function getStatusText($location) {
        $text = '';
        if ($location['status'] == 1 && $location['velocity'] > 0) {
            $text = self::STATUS_DEVICE_RUN;
        } else if ($location['status'] == 1 && $location['velocity'] <= 0) {
            $text = self::STATUS_DEVICE_STOP;
        } else {
            $text = self::STATUS_DEVICE_PARK;
        }
        return $text;
    }

    public static function getStatusMapping($status_code){
        $text = '';
        switch ($status_code) {
            case self::STATUS_DEVICE_PARK: $text = "Đỗ"; break;
            case self::STATUS_DEVICE_RUN: $text = "Đang chạy"; break;
            case self::STATUS_DEVICE_STOP: $text = "Dừng"; break;
            default: $text = $status_code; break;
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

    public static function getExportDeviceData() {
        $query = "select d.id as device_id, d.device_number, d.sim_infor, d.activated_at, 
                d.expired_at, d.created_at, IFNULL(u.username, '') as username, IFNULL(u.name,'') as owner, IFNULL(u.phone, '') as phone
            from tracking_devices as d
                LEFT join users as u on d.user_id = u.id
            where d.is_deleted = 0
            order by d.activated_at asc;";
        $result = DB::select($query, []);
        $resp = [];
        if ($result) {
            foreach ($result as $item) {
                $temp = [
                    "Device Id" => $item->device_id,
                    "Device Number" => $item->device_number,
                    "SIM Info" => $item->sim_infor,
                    "Activated At" => !empty($item->activated_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->activated_at)->format('m/d/y') : '',
                    "Expired At" => !empty($item->expired_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->expired_at)->format('m/d/y') : '',
                    "Created At" => !empty($item->created_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->created_at)->format('m/d/y') : '',
                    "Username" => $item->username,
                    "Owner" => $item->owner,
                    "Phone" => $item->phone
                ];
                $resp[] = $temp;
            }
        }
        return $resp;
    }

    public static function getWarningDevices() {
        $current_date = Carbon::now('utc');
        //calculate the valid time
        $status_unused = self::STATUS_UNUSED;
        $inActive = self::STATUS_IN_ACTIVE;
        $valid_date = $current_date->addMonth(1)->format('Y-m-d H:i:s');
        $query = "select d.id as device_id, d.device_number, d.sim_infor, d.activated_at, d.status,
                d.expired_at, d.created_at, IFNULL(u.username, '') as username, IFNULL(u.name,'') as owner, IFNULL(u.phone, '') as phone,
                d.current_state_mobile
            from tracking_devices as d
                LEFT join users as u on d.user_id = u.id
            where d.is_deleted = 0 AND d.status !=$status_unused AND d.status != $inActive AND d.expired_at <= '$valid_date'
            order by d.expired_at asc;";
        $result = DB::select($query, []);
        $resp = [];
        if ($result) {
            foreach ($result as $item) {
                $temp = [
                    "Device Id" => $item->device_id,
                    "Device Number" => $item->device_number,
                    "SIM Info" => $item->sim_infor,
                    "Activated Date" => !empty($item->activated_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->activated_at)->format('m/d/y') : '',
                    "Expired Date" => !empty($item->expired_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->expired_at)->format('m/d/y') : '',
                    "Created Date" => !empty($item->created_at) ? Date::createFromFormat('Y-m-d H:i:s', $item->created_at)->format('m/d/y') : '',
                    "Username" => $item->username,
                    "Owner" => $item->owner,
                    "Phone" => $item->phone,
                    "Status" => self::getDeviceStatusText($item->status),
                    "Last Status" => self::getMixedStatus($item->current_state_mobile),
                ];
                $resp[] = $temp;
            }
        }
        return $resp;
    }

    public static function getUserDeviceLocationMobile($user_id = 0, $options = []){
        $status_active = self::STATUS_ACTIVE;
        //$valid_date = $current_date->addMonth(1)->format('Y-m-d H:i:s');
        $query = "select d.*
            from tracking_devices as d
            LEFT join users as u on d.user_id = u.id
            where d.is_deleted = 0 and d.user_id = $user_id AND d.status = $status_active
            order by d.activated_at asc;";        
        $result = DB::select($query, []);
        $resp = [];
        if ($result) {
            foreach ($result as $item) {
                $current_state_obj = !empty($item->current_state_mobile) && $item->current_state_mobile != '{}' ? json_decode($item->current_state_mobile, true) : json_decode($item->current_state, true);
                $device['device_id'] = $item->id;
                $device['device_number'] = $item->device_number;
                $device['activated_date'] =  $item->activated_at;
                $device['sim_infor'] = $item->sim_infor;
                $device['id'] = $item->id;                
                if (!empty($current_state_obj)) {
                    $status = self::getStatusText($current_state_obj);
                    $device['status'] = $status;
                    $device['statusText'] = self::getStatusMapping($status);
                    $device['lat'] = $current_state_obj['lat'];
                    $device['lng'] = $current_state_obj['lng'];
                    $device['velocity'] = $current_state_obj['velocity'];
                    //time
                    //calculate diffirent time
                    $refTime = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, (isset($current_state_obj['refTime']) ? $current_state_obj['refTime'] : $current_state_obj['time']));
                    $currentTime = Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $current_state_obj['time']);
                    $different = $refTime->diffInSeconds($currentTime);
                    $device['diffTime'] = self::getDifferentTime($different);
                } else {
                    $device['status'] = self::STATUS_DEVICE_PARK;
                    $device['statusText'] = $device['statusText'] = self::getStatusMapping(self::STATUS_DEVICE_PARK);
                    $device['diffTime'] = '';
                }
                $resp[] = $device;
            }
        }
        return $resp;
    }



    public static function getUserDeviceLocationNew($user_id = 0, $options = []){
        //check user device
        //return ["status" => true, "error" => false, "data" => [], "last_points" => null, "hasMore" => false];
        $is_roadmap = isset($options['isRoadmap']) ? $options['isRoadmap'] : false;
        $query = '';
        $roadmapLimit = self::ROADMAP_LIMIT;
        $detecter = new Mobile_Detect();
        if ($detecter->isMobile()){
            $roadmapLimit = self::ROADMAP_LIMIT_MOBILE;
        }
        $last_point = '';
        $num_of_day = env('NUMBER_DAY_QUERY', 7);
        $locations = [];
        $current_user = Auth::user()->getAuthIdentifier();
        if (!$is_roadmap) {
            $last_point = isset($options["lastPoint"]) ?  (" AND l.created_at > '" . $options["lastPoint"]['last_point'] . "'") : '';
            $user_condition = !empty($user_id) ? " and d.user_id = $user_id" : " and d.user_id = $current_user";
            $date_current = new Carbon();
            $date_current->subDay($num_of_day);
            $yesterday = $date_current->format(self::DB_DATETIME_FORMAT);
            // and l.created_at >= '$yesterday'
            $retrist_time = "and l.created_at >= '$yesterday'";
            if ($last_point == '') {
                $deviceQuery = "select d.id as device_id_main,d.current_state as current_state_device, 
                      d.expired_at, IFNULL(d.device_number,'N/A') as device_number
                    from tracking_devices as d
                    where d.is_deleted = 0 and d.status = 1 $user_condition";
                $devices = DB::select($deviceQuery, []);
                if ($devices) {
                    for($i = 0; $i < count($devices); $i++){
                        $device = $devices[$i];
                        $current_state_device = json_decode($device->current_state_device);
                        if ($current_state_device) {
                            $device->command = $current_state_device->command;
                            $device->lat = floatval($current_state_device->lat);
                            $device->lng = floatval($current_state_device->lng);
                            $device->status = $current_state_device->status;
                            $device->heading = $current_state_device->heading;
                            $device->created_at = !empty($current_state_device->time) ? Carbon::createFromFormat(self::DEVICE_DATETIME_FORMAT, $current_state_device->time, 'UTC')->format(self::DB_DATETIME_FORMAT) : Carbon::now()->format(self::DB_DATETIME_FORMAT);
                            $device->updated_at = '';
                            $device->current_state = isset($current_state_device->current_state_text) ? $current_state_device->current_state_text : '';
                            $device->velocity = $current_state_device->velocity;
                            $device->reverser = $current_state_device->reverser;
                            $device->checksum = $current_state_device->checksum;
                            $device->id = 'na';
                        } else {                            
                            $device->command = '';
                            $device->lat = '';
                            $device->lng = '';
                            $device->status = '';
                            $device->heading = '';
                            $device->created_at = '';
                            $device->updated_at = '';
                            $device->current_state = '';
                            $device->velocity = '';
                            $device->reverser = '';
                            $device->checksum = '';
                            $device->id = '';
                            $devId = $device->device_id_main;
                            $queryLoc = "select l.* from device_locations as l where l.device_id = '$devId' $retrist_time order by l.created_at desc limit 1";
                            //current_state_device
                            $dev_loc = DB::select($queryLoc, []);
                            if ($dev_loc && count($dev_loc) > 0) {
                                $dev_loc = $dev_loc[0];
                                $device->command = $dev_loc->command;
                                $device->lat = $dev_loc->lat;
                                $device->lng = $dev_loc->lng;
                                $device->status = $dev_loc->status;
                                $device->heading = $dev_loc->heading;
                                $device->created_at = $dev_loc->created_at;
                                $device->updated_at = $dev_loc->updated_at;
                                $device->current_state = $dev_loc->current_state;
                                $device->velocity = $dev_loc->velocity;
                                $device->reverser = $dev_loc->reverser;
                                $device->checksum = $dev_loc->checksum;
                                $device->id = $dev_loc->id;
                            } else {
                                continue;
                            }
                        }                        
                        $locations[] = $device;
                    }
                }
            } else {
                $query = "select d.id as device_id_main,d.current_state as current_state_device, d.expired_at, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                  left join tracking_devices as d on u.id = d.user_id
                  left join device_locations as l on (d.id = l.device_id $last_point)
                where d.is_deleted = 0 and d.status = 1 $user_condition 
                order by d.id, l.created_at desc, l.updated_at desc";
                $locations = DB::select($query, []);
            }

        } else {
            Log::info("----------------- Roadmap, the user id $current_user is contact server abnormal at IP  $ip_requested -----------------\n");
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
            $query = "select d.id as device_id_main,d.current_state as current_state_device, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                inner join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 and d.status = 1 and l.created_at >= '$from_date' and l.created_at <= '$to_date' and l.device_id='$device_id' $condition_next_loc
                order by d.id, l.created_at, l.status limit $roadmapLimit";
            $locations = DB::select($query, []);
        }
        $location_devices = [];
        $result = ["status" => true, "error" => false, "data" => [], "last_points" => null, "hasMore" => false];
        $has_more = false;
        if ($is_roadmap) {
            $has_more = count($locations) >= $roadmapLimit ? true : false;
        }
        $last_point_item = isset($options["lastPoint"]) ? $options["lastPoint"] : '';
        if ($locations){
            if (!$is_roadmap){
                $locations = array_reverse($locations);
            }
            $last_time = 0;
            $temp_array = [];
            if ($last_point == '' && !$is_roadmap) {
                //first time
                foreach($locations as $location_device){
                    if (isset($temp_array[$location_device->device_id_main]) &&
                        $temp_array[$location_device->device_id_main]->created_at == $location_device->created_at && $location_device->status == 1){
                        continue;
                    }
                    $temp_array[$location_device->device_id_main] = $location_device;
                }
                $temp_array = array_values($temp_array);
            } else {
                $temp_array = $locations;
            }
            foreach($temp_array as $location_device){
                if (!empty($location_device->id)){
                    $tempTime = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC')->format('U');
                    if (intval($tempTime) > $last_time){
                        $last_point_item = $location_device;
                        $last_time = intval($tempTime);
                    }
                }

                if (!isset($location_devices[$location_device->device_id_main])){
                    $location_devices[$location_device->device_id_main] = [
                        "device_id" => $location_device->device_id_main,
                        "device_number" => $location_device->device_number,
                        "expired_date" => isset($location_device->expired_at)
                            ? Carbon::createFromFormat('Y-m-d H:i:s', $location_device->expired_at)->format('d-m-Y') : '',
                        "is_expired" => 0,
                        "locations" => []
                    ];
                    //check if over expired
                    if (isset($location_device->expired_at)) {
                        //nếu ngày hến hạn lớn hơn không quá 1 tháng so với ngày hiện tại
                        //thông báo cho user biết
                        $current_date = Carbon::now('utc');
                        $expired_date = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->expired_at);
                        if ($current_date->diffInMonths($expired_date, false) < 0 && $current_date->diffInDays($expired_date, false) < -7) {
                            //update date as invalid device as set null for user_id
                            $device = Tracking_device::find($location_device->device_id_main);
                            if ($device instanceof Tracking_device) {
                                $device->status = self::STATUS_EXTEND_EXPIRED;
                                $device->save();
                            }
                            //remove device on array
                            unset($location_devices[$location_device->device_id_main]);
                            continue; //end execute and loop to another device
                        }


                        if ($current_date->diffInMonths($expired_date, false) <= 0 && $current_date->diffInDays($expired_date, false) < 0) {
                            //extend expired date
                            $new_expired = $expired_date->addDay(7);
                            $location_devices[$location_device->device_id_main]['is_expired'] = 2;
                            $location_devices[$location_device->device_id_main] ['expired_date'] = $new_expired->format('d-m-Y');
                        } else if ($current_date->diffInMonths($expired_date, false) <= 0){
                            $location_devices[$location_device->device_id_main]['is_expired'] = 1;
                        }
                    }
                }

                if (isset($location_devices[$location_device->device_id_main]) && !empty($location_device->id)){
                    $device_state = json_decode($location_device->current_state_device);
                    $current_time_utc = Carbon::now('UTC');
                    $different_gsm = 0;
                    if (!empty($device_state) && !empty($device_state->time)){
                        $last_gsm_state = Carbon::createFromFormat('y-m-d H:i:s', $device_state->time, 'UTC');
                        $different_gsm = $current_time_utc->diffInSeconds($last_gsm_state);
                    }
                    if (is_numeric($location_device->lat) && is_numeric($location_device->lng)) {
                        $location_device->last_point = $location_device->created_at;
                        $date_created = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC');
                        $date_created->setTimezone('Asia/Ho_Chi_Minh');
                        $location_device->velocity = $location_device->status > 0 ? round(intval($location_device->velocity) * self::VELOCITY_RATIO) : 0;
                        $devID = $location_device->device_id_main;
                        $location_device->status = self::getStatusText(["status" => $location_device->status, 'velocity' => $location_device->velocity]);
                        //check if status is park
                        //no longer check park
                        if ($location_device->status == self::STATUS_DEVICE_PARK && !$is_roadmap){
                            $device = Tracking_device::find($location_device->device_id_main);
                            $current_state = !empty($device->current_state) && $device->current_state != '{}' ? json_decode($device->current_state) : null;
                            $location_device->created_at_org = isset($options['lastLocation'][$devID]) ? $options['lastLocation'][$devID]['time']
                                : (!empty($current_state) ? Carbon::createFromFormat('y-m-d H:i:s', $current_state->time, 'UTC')->format(self::DB_DATETIME_FORMAT) : $location_device->created_at);
                            $created_at_obj = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at, 'UTC');
                            $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at_org, 'UTC');
                            $different = $current_time_utc->diffInSeconds($last_time_utc);
                            //nếu gửi điểm lúc đổ thì căn cứ vào lastLocation của request trước hoặc created at
                            if ($created_at_obj < $last_time_utc) {
                                $different = $current_time_utc->diffInSeconds($created_at_obj);
                            }
                            $location_device->created_at = Carbon::now()->setTimezone('Asia/Ho_Chi_Minh')->format('d-m-Y H:i:s');
                            //if diff larger than 48h hours => lost gsm
                            if ($different > 48 * 3600 && $different_gsm > 48 * 3600) {
                                //only check if park time > 2 days
                                $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                                if ($is_lostGSM) {
                                    $location_device->status = "Mất GSM";
                                }
                            }
                            $statusText = self::getDifferentTime($different);
                            $location_device->current_state = $statusText;
                        } else {
                            $location_device->created_at_org = $location_device->created_at;
                            $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at_org, 'UTC');
                            $different = $current_time_utc->diffInSeconds($last_time_utc);
                            //if diff larger than 48h hours => lost gsm
                            if ($different > 48 * 3600 && $different_gsm > 48 * 3600 && !$is_roadmap) {
                                //only check if park time > 2 days
                                $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                                if ($is_lostGSM) {
                                    $location_device->status = "Mất GSM";
                                }
                            }
                            $location_device->created_at = $date_created->format('d-m-Y H:i:s');
                            $location_device->current_state = (!empty($location_device->current_state) && $location_device->current_state != '{}') ? $location_device->current_state : '';
                        }
                        $location_device->heading = self::getHeadingClass($location_device->heading);
                        $location_device->status = self::getStatusMapping($location_device->status);
                        $location_devices[$location_device->device_id_main]['locations'][] = $location_device;
                    }
                } else if (isset($location_devices[$location_device->device_id_main]) && !$is_roadmap) {
                    //get latest position of device
                    $device_state = json_decode($location_device->current_state_device);
                    $current_time_utc = Carbon::now('UTC');
                    $devID = $location_device->device_id_main;
                    $different_gsm = 0;
                    if (!empty($device_state) && !empty($device_state->time)){
                        $last_gsm_state = Carbon::createFromFormat('y-m-d H:i:s', $device_state->time, 'UTC');
                        $different_gsm = $current_time_utc->diffInSeconds($last_gsm_state);
                    }
                    if ($options['lastLocation'][$devID]['status'] == 'Đỗ' || $options['lastLocation'][$devID]['status'] == 'Mất GSM') {
                        $location_device->last_point = $options["lastPoint"]['last_point'];
                        $location_device->velocity = 0;
                        $location_device->created_at = Carbon::now()->setTimezone('Asia/Ho_Chi_Minh')->format('d-m-Y H:i:s');
                        $location_device->status = self::getStatusText(["status" => 0, 'velocity' => 0]);
                        //get the diffirence
                        //expand status time in current status
                        $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $options['lastLocation'][$devID]['time'], 'UTC');
                        $different = $current_time_utc->diffInSeconds($last_time_utc);
                        $statusText = self::getDifferentTime($different);
                        if ($different > 48 * 3600 && $different_gsm > 48 * 3600) {
                            //only check if park time > 2 days
                            $is_lostGSM = self::checkLostGSM($location_device->device_id_main);
                            if ($is_lostGSM) {
                                $location_device->status = "Mất GSM";
                            }
                        }
                        $location_device->current_state = $statusText;
                        $location_device->heading = $options["lastPoint"]['heading'];
                        $location_device->status = self::getStatusMapping($location_device->status);
                        if ($options['lastLocation'] && isset($options['lastLocation'][$devID])) {
                            $location_device->lat = $options['lastLocation'][$devID]['lat'];
                            $location_device->lng = $options['lastLocation'][$devID]['lng'];
                            $location_device->created_at_org = $options['lastLocation'][$devID]['time'];
                        }
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

    public static function getRoadMapMobile($options) {
        $roadmapLimit = self::ROADMAP_LIMIT;
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
        $query = "select d.id as device_id_main,d.current_state as current_state_device, IFNULL(d.device_number,'N/A') as device_number, l.* 
            from users as u 
            inner join tracking_devices as d on u.id = d.user_id
            inner join device_locations as l on d.id = l.device_id
            where d.is_deleted = 0 and d.status = 1 and l.created_at >= '$from_date' and l.created_at <= '$to_date' and l.device_id='$device_id' $condition_next_loc
            order by d.id, l.created_at, l.status limit $roadmapLimit";
        $locations = DB::select($query, []);
        $has_more = count($locations) >= $roadmapLimit ? true : false;
        $location_devices = [];
        $last_point_item = isset($options["lastPoint"]) ? $options["lastPoint"] : '';
        $last_time = 0;
        foreach($locations as $location_device){
            if (!empty($location_device->id)){
                $tempTime = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC')->format('U');
                if (intval($tempTime) > $last_time){
                    $last_point_item = $location_device;
                    $last_time = intval($tempTime);
                }
            }

            if (!isset($location_devices[$location_device->device_id_main])){
                $location_devices[$location_device->device_id_main] = [
                    "device_id" => $location_device->device_id_main,
                    "device_number" => $location_device->device_number,
                    "expired_date" => isset($location_device->expired_at)
                        ? Carbon::createFromFormat('Y-m-d H:i:s', $location_device->expired_at)->format('d-m-Y') : '',
                    "is_expired" => 0,
                    "locations" => []
                ];                
            }

            if (isset($location_devices[$location_device->device_id_main]) && !empty($location_device->id)){
                $device_state = json_decode($location_device->current_state_device);
                $current_time_utc = Carbon::now('UTC');
                $different_gsm = 0;
                if (!empty($device_state) && !empty($device_state->time)){
                    $last_gsm_state = Carbon::createFromFormat('y-m-d H:i:s', $device_state->time, 'UTC');
                    $different_gsm = $current_time_utc->diffInSeconds($last_gsm_state);
                }
                if (is_numeric($location_device->lat) && is_numeric($location_device->lng)) {
                    $location_device->last_point = $location_device->created_at;
                    $date_created = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location_device->created_at, 'UTC');
                    $date_created->setTimezone('Asia/Ho_Chi_Minh');
                    $location_device->velocity = $location_device->status > 0 ? round(intval($location_device->velocity) * self::VELOCITY_RATIO) : 0;
                    $devID = $location_device->device_id_main;
                    $location_device->status = self::getStatusText(["status" => $location_device->status, 'velocity' => $location_device->velocity]);
                    //check if status is park
                    //no longer check park
                    $location_device->created_at_org = $location_device->created_at;
                    $last_time_utc = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at_org, 'UTC');
                    $different = $current_time_utc->diffInSeconds($last_time_utc);                    
                    $location_device->created_at = $date_created->format('d-m-Y H:i:s');
                    $location_device->current_state = (!empty($location_device->current_state) && $location_device->current_state != '{}') ? $location_device->current_state : '';
                    $location_device->heading = self::getHeadingClass($location_device->heading);
                    $location_device->status = self::getStatusMapping($location_device->status);
                    $location_devices[$location_device->device_id_main]['locations'][] = $location_device;
                }
            } 
        }
        //$last_point_item = $locations[count($locations) - 1];//wrong here
        $location_devices = array_values($location_devices);
        $result = ["status" => true, "error" => false, "data" => $location_devices, "last_points" => $last_point_item, "hasMore" => $has_more];
        return $result;
    }

    public static function getDeviceStatusText($status){
        $statusText = 'N/A';
        switch($status){
            case self::STATUS_ACTIVE: $statusText = 'Active'; break;
            case self::STATUS_IN_ACTIVE: $statusText = 'In active'; break;
            case self::STATUS_EXTEND_EXPIRED: $statusText = 'Extend expired'; break;
            case self::STATUS_UNUSED: $statusText = 'Unused'; break;
        }
        return $statusText;
    }

    public static function getStatusDeviceMapping(){
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_IN_ACTIVE => 'In active',
            self::STATUS_EXTEND_EXPIRED => 'Extend expired',
            self::STATUS_UNUSED => 'Unused'
        ];
    }

    public static function getDeviceList($user_id){
        $query = "select d.* 
                from join tracking_devices as d 
                where d.is_deleted = 0 and d.status = 1
                order by d.id";
        $devices = DB::select($query, []);
        $user_devices = [];
        foreach($device as $devices){
            $user_devices[] = $device;
        }
        return $user_devices;
    }
}
