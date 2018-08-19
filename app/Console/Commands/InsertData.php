<?php

namespace App\Console\Commands;

use App\Models\Devicelocation;
use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class InsertData extends Command
{
    const DB_DATETIME_FORMAT = 'Y-m-d H:i:s';
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'device:insertdata';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Insert data for device at end of day of current day and begin of next day';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        //
        $device_id = env('INSERT_DEVICE_ID', '');
        $inserting_date =  env('INSERT_DATE', '');
        $cond = "";
        if (!empty($device_id)){
            $cond = " where d.id = '$device_id';";
        }
        $query = "select d.*
            from tracking_devices as d $cond";
        $result = DB::select($query, []);
        //process datetime;
        $current_date = Carbon::createFromFormat('Y-m-d',date('Y-m-d'), 'Asia/Ho_Chi_Minh');
        if (!empty($inserting_date)) {
            $current_date = Carbon::createFromFormat('Y-m-d',$inserting_date, 'Asia/Ho_Chi_Minh');
        }
        if ($current_date instanceof Carbon){
            $current_date->setTime(23, 59, 59);
        }
        //change to UTC
        $current_date->setTimezone('UTC');
        if ($result){
            foreach($result as $device) {
                $current_device_id = $device->id;
                $queryLoc = "select l.*
                    from device_locations as l where l.device_id = '$current_device_id' order by l.created_at desc limit 1;";
                $resultLoc = DB::select($queryLoc, []);
                //get the latest of device
                if ($resultLoc && count($resultLoc) > 0) {
                    //insert at end of day
                    $deviceLoc = $resultLoc[0];
                    $location = new Devicelocation();
                    $location->device_id = $current_device_id;
                    $location->lat = $deviceLoc->lat;
                    $location->lng =  $deviceLoc->lng;
                    $location->status = $deviceLoc->status;
                    $location->heading = $deviceLoc->heading;
                    $location->velocity = $deviceLoc->velocity;
                    $location->created_at = $current_date->format('Y-m-d H:i:s');
                    $location->reverser = $deviceLoc->reverser;
                    $location->checksum = $deviceLoc->checksum;
                    $location->updated_at = date(self::DB_DATETIME_FORMAT);
                    $location->command = $deviceLoc->command;
                    $location->current_state = $deviceLoc->current_state;
                    $location->is_deleted = 0;
                    $location->save();
                    //insert to begin of next day
                    $the_next_date = $current_date->addSecond(10);
                    $deviceLoc = $resultLoc[0];
                    $location = new Devicelocation();
                    $location->device_id = $current_device_id;
                    $location->lat = $deviceLoc->lat;
                    $location->lng =  $deviceLoc->lng;
                    $location->status = $deviceLoc->status;
                    $location->heading = $deviceLoc->heading;
                    $location->velocity = $deviceLoc->velocity;
                    $location->created_at = $the_next_date->format('Y-m-d H:i:s');
                    $location->reverser = $deviceLoc->reverser;
                    $location->checksum = $deviceLoc->checksum;
                    $location->updated_at = date(self::DB_DATETIME_FORMAT);
                    $location->command = $deviceLoc->command;
                    $location->current_state = $deviceLoc->current_state;
                    $location->is_deleted = 0;
                    $location->save();
                }
            }
        }
        echo 'Done';
    }
}
