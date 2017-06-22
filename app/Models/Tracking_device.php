<?php

namespace App\Models;

use App\User;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\CrudTrait;
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
        $from = !empty($options["from"]) ? \DateTime::createFromFormat($options["from"],'d-m-Y H:i:s') : (new \DateTime())->sub(new \DateInterval("P5i"));
        $from_format = $from->format('Y-m-d H:i:s');
        $locations = DB::select('select d.id as device_id, l.* 
                from users as u 
                inner join tracking_devices as d on u.id = d.user_id
                left join device_locations as l on d.id = l.device_id
                where d.is_deleted = 0 and l.created_at >= ?
                order by d.id, l.created_at', [$from_format]);
        $location_devices = [];
        $result = ["status" => false, "error" => "Unknown error"];
        if ($locations){
            foreach($locations as $location_device){
                if (!isset($location_devices[$location_device['device_id']])){
                    $location_devices[$location_device['device_id']] = [
                        "device_id" => $location_device['device_id'],
                        "locations" => []
                    ];
                }
                if (isset($location_devices[$location_device['device_id']]) && !empty($location_device['id'])){
                    $location_devices[$location_device['device_id']]['locations'][] = $location_device;
                }
            }
            $location_devices = array_values($location_devices);
            $result = ["status" => true, "error" => false, "data" => $location_devices];
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
        $locationDate = \DateTime::createFromFormat($data[3], 'Y-m-d H:i:s');
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
        $location->lng = $device['lng'];
        $location->status = $device['status'];
        $location->heading = $device['heading'];
        $location->velocity = $device['velocity'];
        $location->created_at = $device['time'];
        $location->reverser = $device['reverser'];
        $location->checksum = $device['checksum'];
        $location->updated_at = date('Y-m-d H:i:s');
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
