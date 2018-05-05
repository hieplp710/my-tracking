<?php

namespace App\Console\Commands;

use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Mail;

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
        $excelHandler = App::make('excel');
        $filename = "Flock_DataAdmin_" . Carbon::now()->format('Ymd');

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
                    $cell->setValue('DANH SÁCH THIẾT BỊ SẮP HOẶC ĐÃ HẾT HẠN');
                    // Set font size
                    $cell->setFontSize(16);
                    // Set font weight to bold
                    $cell->setFontWeight('bold');
                    // Set alignment to center
                    $cell->setAlignment('center');
                });
                $data = Tracking_device::getWarningDevices();
                if (count($data) > 0) {
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
                } else {
                    $sheet->mergeCells('A2:I2');
                    $sheet->cell('A2', function($cell) {
                        // manipulate the cell
                        $cell->setValue('Không có thiết bị sắp hết hạn hoặc đã hết hạn');
                        // Set font size
                        $cell->setFontSize(12);
                    });
                }
            });
        })->store('xlsx');
        //send mail
        Mail::send('emails.test', [], function ($message) {
            $message->from('hieplp710@gmail.com', 'Laravel');
            $message->to('hieplp710@gmail.com');
        });
        echo 'hello world!!!!';
    }
}
