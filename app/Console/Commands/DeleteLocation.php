<?php

namespace App\Console\Commands;

use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteLocation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'Location:delete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete location within 3 month from latest location';

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
        $query = "select max(l.created_at) as latest_date
                  from device_locations as l;";
        $latest = DB::select($query, []);
        if ($latest) {
            $date = $latest[0]->latest_date;
            $dateObj = Carbon::createFromFormat(Tracking_device::DB_DATETIME_FORMAT, $date, 'UTC');
            $dateObj = $dateObj->subMonths(3)->startOfMonth();
            $deleteDate = $dateObj->format(Tracking_device::DB_DATETIME_FORMAT);
            $deleteQuery = "DELETE FROM device_locations WHERE created_at <= '$deleteDate'";
            $isDeleted = DB::delete($deleteQuery);
            echo 'Delete successfully!!!';
            return true;
        }
        echo 'There is nothing to delete!!!';
        return false;
    }
}
