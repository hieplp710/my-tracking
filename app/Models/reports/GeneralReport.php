<?php
/**
 * Created by PhpStorm.
 * User: hiepl
 * Date: 4/14/2018
 * Time: 9:18 PM
 */
namespace App\Models\Reports;

use App\Models\Tracking_device;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class GeneralReport {
    public static function getGeneralReportData($device_id, $start_data, $end_date) {

        if (empty($start_data) || empty($end_date)) {
            return ["status" => false, "error" => "Empty input data"];
        }
        $start_date_str = Carbon::createFromFormat('Y-m-d H:i:s', $start_data)->format('Y-m-d H:i:s');
        $end_date_str = Carbon::createFromFormat('Y-m-d H:i:s', $end_date)->format('Y-m-d H:i:s');
        $query = "select d.id as device_id_main,d.current_state as current_state_device, d.expired_at, IFNULL(d.device_number,'N/A') as device_number, l.* 
                    from tracking_devices as d
                        left join device_locations as l on d.id = l.device_id
                    where d.is_deleted = 0 and d.status = 1 and d.id = '$device_id'
                        and l.created_at >= '$start_date_str' and l.created_at <= '$end_date_str'
                    order by d.id, l.created_at, l.status asc, l.updated_at desc";
        //change code 
        $locations = DB::select($query, []);
        $report_data = self::executeReportData($locations);
        //data for report
        $data_final = [];
        $report_date = '';
        $maxSpeed = 0;
        $totalSpeed = 0;
        $totalDistance = 0;
        $data_by_date = [];
        $idx_date = 0;
        if ($report_data) {
            foreach($report_data as $idx => $item) {
                //compose data
                //group by date
                $item_date = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('d/m/Y');
                if ($item_date != $report_date || $idx == count($report_data) - 1) {
                    if ($idx == 0){
                        $temp = array();
                        $temp["Stt"] = (count($data_by_date) + 1);
                        $temp["Ngày"] = $item_date;
                        $temp["Tg Bắt Đầu"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('H:i:s');
                    } else {
                        //normal, finish the before block and init the new block
                        //complete old location and start new location
                        $last_loc = null;
                        if ($idx == (count($locations) - 1)) {
                            //end of locations
                            $last_loc = $item;
                        } else {
                            //change of status
                            $last_loc = $report_data[$idx - 1];
                        }
                        $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('H:i:s');
                        if (Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('d/m/Y') != $temp["Ngày"]){
                            $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['start_time'])->format('H:i:s');
                        }
                        $temp["Tổng Km"] = round($totalDistance / 1000, 0). 'km';
                        $temp['VT Tối Đa'] = $maxSpeed . 'km/h';
                        $temp["VT Trung Bình"] = round($totalSpeed / $idx_date, 1) . 'km/h';
                        $data_by_date[] = array_merge([], $temp);
                        //init new block
                        $temp = array();
                        $temp["Stt"] = (count($data_by_date) + 1);
                        $temp["Ngày"] = $item_date;
                        $temp["Tg Bắt Đầu"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('H:i:s');
                        $totalDistance = 0;
                        $maxSpeed = 0;
                        $totalSpeed = 0;
                        $idx_date = 0;
                    }
                    $report_date = $item_date;
                }
                $totalDistance += $item['km'];
                $maxSpeed = ($maxSpeed < $item['max_vel'] ? $item['max_vel'] : $maxSpeed);
                $totalSpeed += $item['avg_vel'];
                if ($item['avg_vel'] != 0)
                    $idx_date++;
            }
        }
        return $data_by_date;
    }

    private static function executeReportData($locations = []) {
        $totalKm = 0;
        $km = 0;
        $current_status = -1;
        $report_data = [];
        $googleApiKey = 'AIzaSyC6wjnpjfBcfyyQYpnuXDKEzKombAnFdjc';
        $startCoord = '';
        $beginTime = '';
        $endTime = '';
        $vel = 0;
        $count_loc = 0;
        $max_vel = 0;
        //$resp = self::getDistance($original, $destination);
        $current_loc = null;
        foreach($locations as $index => $loc) {
            $date_created = Carbon::createFromFormat('Y-m-d H:i:s', $loc->created_at, 'UTC');
            $date_created->setTimezone('Asia/Ho_Chi_Minh');
            $loc->created_at = $date_created->format('Y-m-d H:i:s');
            if ($index == 0) {
                //begin scan the list
                $current_loc = ['status' => $loc->status];
                $startCoord = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $beginTime = $loc->created_at;
                $current_status = $loc->status;
            }
            if ($loc->status != $current_status || $index == (count($locations) - 1)) {
                //complete old location and start new location
                if ($index == (count($locations) - 1)) {
                    //end of locations
                    $last_loc = $loc;
                } else {
                    //change of status
                    $last_loc = $locations[$index - 1];
                }
                $current_loc['start_coord'] = $startCoord;
                //tính từ điểm bắt đầu đến điểm thay đổi trạng thái
                $current_loc['end_coord'] = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $current_loc['start_time'] = $beginTime;
                $current_loc['end_time'] = $loc->created_at;
                $current_loc['km'] = ($last_loc->status != 0) ? self::getDistance($current_loc['start_coord'], $current_loc['end_coord']): 0;
                $current_loc['max_vel'] = $current_loc['status'] > 0 ? $max_vel * Tracking_device::VELOCITY_RATIO : 0;
                $current_loc['avg_vel'] = $current_loc['status'] > 0 ? round($vel / $count_loc, 2) * Tracking_device::VELOCITY_RATIO : 0;
                $report_data[] = array_merge([], $current_loc);
                $current_status = $loc->status;
                //begin coordinate
                $current_loc = null;
                $current_loc = ['status' => $loc->status];
                $startCoord = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $beginTime = $loc->created_at;
                $vel = 0;
                $max_vel = 0;
                $count_loc = 0;
            }
            //count & sum continue
            $vel += floatval($loc->velocity);
            $max_vel = $loc->velocity > $max_vel ? $loc->velocity : $max_vel;
            $count_loc++;
        }
        return $report_data;
    }
    private static function getDistance($original, $destination) {
        $url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=$original&destinations=$destination&mode=driving&language=pl-PL";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_PROXYPORT, 3128);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $response = curl_exec($ch);
        curl_close($ch);
        $response_a = json_decode($response, true);
        if (isset($response_a['rows']) && !empty($response_a['rows']) && isset($response_a['rows'][0]['elements'])
            && !empty($response_a['rows'][0]['elements']) && !empty($response_a['rows'][0]['elements'][0]['distance']['text'])) {
            return $response_a['rows'][0]['elements'][0]['distance']['value'];
        }
        return 0;
    }
}