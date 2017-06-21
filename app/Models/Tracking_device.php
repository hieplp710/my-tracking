<?php

namespace App\Models;

use App\User;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\CrudTrait;
use Illuminate\Support\Facades\DB;

class Tracking_device extends Model
{
    use CrudTrait;
    use Helper;
    protected $fillable = ['id','device_number', 'setting', 'sim_infor', 'activated_at', 'user_id'];
    protected $table = 'tracking_devices';
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

}
