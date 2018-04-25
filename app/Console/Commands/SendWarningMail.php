<?php

namespace App\Console\Commands;

use App\Models\Tracking_device;
use Illuminate\Console\Command;

class SendWarningMail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'device:sendwarningmail';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send mail to admin remind warning device';

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
        $devices = Tracking_device::getWarningDevices();
        echo 'hello world!!!!';
    }
}
