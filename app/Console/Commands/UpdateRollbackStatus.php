<?php

namespace App\Console\Commands;

use App\Models\Devicelocation;
use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;


class UpdateRollbackStatus extends Command
{
    const DB_DATETIME_FORMAT = 'Y-m-d H:i:s';
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'device:updaterollback';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update status for rollback point';

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
        $begin_time = Carbon::now('Asia/Ho_Chi_Minh')
            ->setTime(0,0,0)->setTimezone('UTC')->format(self::DB_DATETIME_FORMAT);
        $end_time = Carbon::now('Asia/Ho_Chi_Minh')
            ->setTime(23,59,59)->setTimezone('UTC')->format(self::DB_DATETIME_FORMAT);
        //get all devices
        $deviceQuery = "select d.*
                    from tracking_devices as d
                    where d.is_deleted = 0 and d.status = 1";
        $devices = DB::select($deviceQuery, []);
        if ($devices) {
            foreach($devices as $device) {
                $this->fetchDeviceLocation($device, $begin_time, $end_time);
            }
        }
        echo 'Done';
    }

    private function fetchDeviceLocation($device, $begin_time, $end_time) {
        $device_id = $device->id;
        $query = "select l.* from device_locations as l 
            where l.device_id = '$device_id' and (l.current_state = '' or l.current_state = '{}') AND l.created_at BETWEEN '$begin_time' AND '$end_time' order by l.created_at asc";
        $locations = DB::select($query, []);
        if ($locations && count($locations) > 0) {
            foreach($locations as $location) {
                $this->updateLocationRollback($location, $device_id);
            }
        }
    }

    private function updateLocationRollback($location, $device_id) {
        //get location that nearest of rollback update
        //chi update point lien ke sau diem hien tai
        print_r("Update device $device_id \n");
        print_r("Location " . $location->created_at ." \n");
        $location_time = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $location->created_at, 'UTC');
        $str_location_time = $location_time->format(self::DB_DATETIME_FORMAT);
        $query_after = "select l.* from device_locations as l 
              where l.device_id = '$device_id' AND created_at > '$str_location_time' ORDER BY l.created_at ASC LIMIT 1";
        $nearest_later_loc = DB::select($query_after, []);

        //update status for later loc
        $statusLatterText = '';
        if (count($nearest_later_loc) > 0) {
            $nearest_later_loc = $nearest_later_loc[0];
            if ($location->status == $nearest_later_loc->status) {
                //expand status time in current status
                $later_location_time = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $nearest_later_loc->created_at);
                $different = $location_time->diffInSeconds($later_location_time);
                //$statusLatterText = self::getStatusText($nearest_later_loc->toArray()) . ' trong ' . self::getDifferentTime($different);
                $statusLatterText = Tracking_device::getDifferentTime($different);
            } else {
                //$statusLatterText = self::getStatusText($nearest_later_loc->toArray());
            }
            $loc = Devicelocation::find($nearest_later_loc->id);
            $loc->current_state = $statusLatterText;
            $loc->save();
        }
    }
}
