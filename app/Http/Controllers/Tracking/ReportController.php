<?php
/**
 * Created by PhpStorm.
 * User: hiepl
 * Date: 6/19/2017
 * Time: 11:04 PM
 */
namespace App\Http\Controllers\Tracking;

use App\Models\Reports\GeneralReport;
use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Input;
use Maatwebsite\Excel\Excel;

class ReportController extends BaseController
{
    const DB_DATETIME_FORMAT = 'Y-m-d H:i:s';
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function generalReport(Request $request) {
        $excelHandler = App::make('excel');
        $start_date = Input::get('startDate');
        $end_date = Input::get('endDate');
        $device_id = Input::get('deviceId');
        $toJson = Input::get('tojson', false);
        $from_date_obj = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $start_date, 'Asia/Ho_Chi_Minh');
        $from_date_obj->setTimezone('UTC');
        $to_date_obj = Carbon::createFromFormat(self::DB_DATETIME_FORMAT, $end_date, 'Asia/Ho_Chi_Minh');
        $to_date_obj->setTimezone('UTC');
        $from_date = $from_date_obj->format(self::DB_DATETIME_FORMAT);
        $to_date = $to_date_obj->format(self::DB_DATETIME_FORMAT);
        $device_id = !empty($device_id) ? $device_id : '0';
        $filename = "Flock_Bao_Cao_Tong_Hop_" . \Date::now()->format('Ymd');
        $data = GeneralReport::getGeneralReportData($device_id, $from_date, $to_date, $toJson);
        if ($toJson){
            //to json for view on web
            return response()->json(["status" => true, "data" => $data]);
        }
//        return ['status' => true, "data" => $data];
        //check the report
        $excelHandler->create($filename, function($excel) use ($data, $device_id){
            // Call writer methods here
            // Set the title
            $report_data = $data;
            $excel->setTitle('Báo cáo tổng hợp');
            // Chain the setters
            $excel->setCreator('Flock.vn')
                ->setCompany('Flock.vn');
            $excel->sheet('Sheetname', function($sheet) use ($report_data, $device_id){
                $sheet->mergeCells('A1:G1');
                $sheet->cell('A1', function($cell) {
                    // manipulate the cell
                    $cell->setValue('BÁO CÁO TỔNG HỢP');
                    // Set font size
                    $cell->setFontSize(16);
                    // Set font weight to bold
                    $cell->setFontWeight('bold');
                    // Set alignment to center
                    $cell->setAlignment('center');
                });
                $data = $report_data;
                $device = Tracking_device::find($device_id);
                if (!empty($data)) {
                    $sheet->mergeCells('A2:G2');
                    $sheet->cell('A2', function($cell) use ($device) {
                        // manipulate the cell
                        $cell->setValue('Xe: ' . $device->device_number );
                        // Set font size
                        $cell->setFontSize(14);
                        // Set font weight to bold
                        $cell->setFontWeight('bold');
                        // Set alignment to center
                        $cell->setAlignment('left');
                    });
                    $len = count($data) + 3;
                    $sheet->cells("A3:G$len", function($cells) {
                        // manipulate the range of cells
                        // Set all borders (top, right, bottom, left)
                        // Set borders with array
                        $cells->setBorder(array(
                            'top'   => array(
                                'style' => 'solid',
                            ),
                        ));
                    });
                    $sheet->setBorder("A3:G$len", 'solid');
                    $sheet->fromArray($data, null, 'A3', true);
                } else {
                    $sheet->mergeCells('A2:G2');
                    $sheet->cell('A2', function($cell) use ($device) {
                        // manipulate the cell
                        $cell->setValue('Xe: ' . $device->device_number );
                        // Set font size
                        $cell->setFontSize(14);
                        // Set font weight to bold
                        $cell->setFontWeight('bold');
                        // Set alignment to center
                        $cell->setAlignment('left');
                    });
                    $sheet->cell('A3', function($cell){
                        // manipulate the cell
                        $cell->setValue('Stt');
                    });
                    $sheet->cell('B3', function($cell) {
                        // manipulate the cell
                        $cell->setValue('Ngày');
                    });
                    $sheet->cell('C3', function($cell){
                        // manipulate the cell
                        $cell->setValue('Tg Bắt Đầu' );
                    });
                    $sheet->cell('D3', function($cell) {
                        // manipulate the cell
                        $cell->setValue("Tg Kết Thúc");
                    });
                    $sheet->cell('E3', function($cell){
                        // manipulate the cell
                        $cell->setValue("Tổng Km");
                    });
                    $sheet->cell('F3', function($cell){
                        // manipulate the cell
                        $cell->setValue('VT Tối Đa');
                    });
                    $sheet->cell('G3', function($cell){
                        // manipulate the cell
                        $cell->setValue("VT Trung Bình");
                    });
                    $sheet->mergeCells('A4:G4');
                    $sheet->cell('A4', function($cell){
                        // manipulate the cell
                        $cell->setValue("Không có dữ liệu báo cáo");
                    });
                }


            });

        })->export('xlsx');
    }
}