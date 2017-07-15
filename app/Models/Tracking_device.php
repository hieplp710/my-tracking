<?php

namespace App\Models;

use App\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\CrudTrait;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Devicelocation;

class Tracking_device extends Model
{
    use CrudTrait;
    use Helper;
    protected $fillable = ['id','device_number', 'setting', 'sim_infor', 'activated_at', 'user_id'];
    protected $table = 'tracking_devices';
    const REQUEST_TYPE_LOCATION = 1;
    const REQUEST_TYPE_LOCATION_ROLLBACK = 2;
    const REQUEST_TYPE_SIM_INFOR = 3;
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
        return $user->first()->name;
    }

    public function displayCreatedAt(){
        return Helper::formatDatetime($this->created_at);
    }

    public function displayActivatedAt(){
        return Helper::formatDatetime($this->activated_at);
    }

    public static function getUserDeviceLocation($user_id = 0, $options = []){
        $from = isset($options["from"]) ? \DateTime::createFromFormat('d-m-Y H:i:s', $options["from"]) : (new \DateTime())->sub(new \DateInterval("PT8M"));
        $from_format = $from->format('Y-m-d H:i:s');
        $last_point = isset($options["last_point"]) ?  (" AND l.created_at > '" . $options["last_point"]['last_point'] . "'") : '';
        //for test
        //$from_format = '2017-06-26 10:00:00';
        $current_user = Auth::user()->getAuthIdentifier();
        $user_condition = !empty($user_id) ? " and d.user_id = $user_id" : " and d.user_id = $current_user";
        $query = '';
        $date_current = new Carbon();
        $date_current->subDay(1);
        $yesterday = $date_current->format('Y-m-d H:i:s');
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
                    order by d.id, l.created_at desc";
        } else {
            $query = "select d.id as device_id_main, IFNULL(d.device_number,'N/A') as device_number, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                inner join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 $last_point $user_condition
                order by d.id, l.created_at desc";
        }

        $locations = DB::select($query, [$from_format]);
        $location_devices = [];

        $result = ["status" => true, "error" => false, "data" => []];
        if ($locations){
            $locations = array_reverse($locations);
            foreach($locations as $location_device){
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
                        $date_created = Carbon::createFromFormat('Y-m-d H:i:s', $location_device->created_at, 'UTC');
                        $date_created->setTimezone('Asia/Ho_Chi_Minh');
                        $location_device->created_at = $date_created->format('d-m-Y H:i:s');
                        $location_devices[$location_device->device_id_main]['locations'][] = $location_device;
                    }
                }
            }
            $last_point_item = $locations[count($locations) - 1];
            $location_devices = array_values($location_devices);
            $result = ["status" => true, "error" => false, "data" => $location_devices, "last_points" => $last_point_item];
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
            $data_array = explode(',', $data);
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
                $isSave = $this->addLocation($device, $is_valid['data']);
                if ($isSave) return ["status" => true, "error" => false];
            } else if ($command == self::REQUEST_TYPE_SIM_INFOR){
                $isSave = $this->updateDeviceInformation($device, $data_array);
                if ($isSave) return ["status" => true, "error" => false];
            } else {
                $result = ["status" => false, "error" => "Unknown command"];
                return $result;
            }

        }
        return false;
    }

    public function validate($data){
        if (empty($data[3])){
            return ["status" => false, "error" => "Empty time"];
        }
        $locationDate = \DateTime::createFromFormat('Y-m-d H:i:s',$data[3]);
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
        $location->velocity = $data['velocity'];
        $location->created_at = $data['time'];
        $location->reverser = $data['reverser'];
        $location->checksum = $data['checksum'];
        $location->updated_at = date('Y-m-d H:i:s');
        $location->command = $data['command'];
        $location->current_state = '{}';
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



}
