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
    public static function getGeneralReportData($device_id, $start_data, $end_date, $tojson = false) {

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
                if ($idx == 0){
                    $temp = array();
                    $temp["Stt"] = (count($data_by_date) + 1);
                    $temp["Ngày"] = $item_date;
                    $temp["Tg Bắt Đầu"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('H:i:s');
                    $report_date = $item_date;
                }
                if ($item_date != $report_date || $idx == count($report_data) - 1) {
                    //normal, finish the before block and init the new block
                    //complete old location and start new location
                    $last_loc = null;
                    $last_loc = isset($report_data[$idx - 1]) ? $report_data[$idx - 1] : $report_data[$idx];
                    $maxSpeed = ($maxSpeed < $item['max_vel'] ? $item['max_vel'] : $maxSpeed);
                    $totalSpeed += $item['avg_vel'];
                    if ($item['avg_vel'] != 0)
                        $idx_date++;
                    $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('H:i:s');
                    if (Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('d/m/Y') != $temp["Ngày"]){
                        $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['start_time'])->format('H:i:s');
                    }
                    if ($idx == count($report_data) - 1 && $item_date == $report_date) {
                        //nếu location thay đổi tại element cuối cùng, tính toán và thêm vào element cuối
                        $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['end_time'])->format('H:i:s');
                        if (Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('d/m/Y') != $temp["Ngày"]){
                            $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('H:i:s');
                        }
                        $maxSpeed = ($maxSpeed < $item['max_vel'] ? $item['max_vel'] : $maxSpeed);
                        $totalSpeed += $item['avg_vel'];
                        if ($item['avg_vel'] != 0)
                            $idx_date++;
                    }
                    $totalDistance += $item['km'];
                    $temp["Tổng Km"] = round($totalDistance / 1000, 1). 'km';
                    $temp['VT Tối Đa'] = round($maxSpeed , 1). 'km/h';
                    $temp["VT Trung Bình"] = $idx_date != 0 ? round($totalSpeed / $idx_date, 1) . 'km/h' : "0km/h";
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
                    if ($idx == count($report_data) - 1 && $item_date != $report_date) {
                        //nếu location thay đổi tại element cuối cùng, tính toán và thêm vào element cuối
                        $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['end_time'])->format('H:i:s');
                        if (Carbon::createFromFormat('Y-m-d H:i:s', $last_loc['end_time'])->format('d/m/Y') != $temp["Ngày"]){
                            $temp["Tg Kết Thúc"] = Carbon::createFromFormat('Y-m-d H:i:s', $item['start_time'])->format('H:i:s');
                        }
                        $temp["Tổng Km"] = round($item['km'] / 1000, 1). 'km';
                        $temp['VT Tối Đa'] = round($item['max_vel'], 1) . 'km/h';
                        $temp["VT Trung Bình"] = $item['avg_vel'] . 'km/h';
                        $data_by_date[] = array_merge([], $temp);
                    }
                    $report_date = $item_date;
                }
                //sum * count
                $totalDistance += $item['km'];
                $maxSpeed = ($maxSpeed < $item['max_vel'] ? $item['max_vel'] : $maxSpeed);
                $totalSpeed += $item['avg_vel'];
                if ($item['avg_vel'] != 0)
                    $idx_date++;
            }
        }
        if ($tojson) {
            //build to view report on web
            $device = Tracking_device::find($device_id);
            $dataJson = new ReportJsonData();
            $dataJson->title = "Báo cáo tổng hợp";
            $dataJson->columns = ["Stt", "Ngày", "Tg Bắt Đầu", "Tg Kết Thúc", "Tổng Km", 'VT Tối Đa', "VT Trung Bình"];
            $dataJson->columnSize = [5, 20, 15, 15 , 10, 15, 20];
            $dataJson->deviceName = $device->device_number;
            $resultJson = [];
            $report_total_km = 0;
            $start_date_obj = Carbon::createFromFormat('Y-m-d H:i:s', $start_data);
            $end_date_obj = Carbon::createFromFormat('Y-m-d H:i:s', $end_date);
            $date_report = "Ngày " . $start_date_obj->format('d/m/Y');
            if ($start_date_obj->diffInDays($end_date_obj, false) > 0) {
                $date_report = "Từ " . $start_date_obj->format('d/m/Y') . " đến " . $end_date_obj->format('d/m/Y');
            }
            $dataJson->reportDay = $date_report;
            foreach($data_by_date as $item) {
                $temp = [];
                foreach ($dataJson->columns as $col => $field) {
                    if (isset($item[$field])) {
                        $temp[] = $item[$field];

                    }
                }
                $report_total_km += floatval(preg_replace('/[^0-9\.]+/', '',$item["Tổng Km"]));
                $resultJson[] = $temp;
            }
            $dataJson->data = $resultJson;
            $dataJson->resume = ["Tổng Km" => $report_total_km];
            return $dataJson;
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
        $first_loop_location = null;
        $debug_array = array();
        $tem = 0;
        $totalKmAll = 0;
        foreach($locations as $index => $loc) {
            $date_created = Carbon::createFromFormat('Y-m-d H:i:s', $loc->created_at, 'UTC');
            $date_created->setTimezone('Asia/Ho_Chi_Minh');
            $loc->created_at = $date_created->format('Y-m-d H:i:s');
            if ($index == 0) {
                //begin scan the list
                $current_loc = ['status' => $loc->status, "km" => 0];
                $startCoord = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $beginTime = $loc->created_at;
                $current_status = $loc->status;
                $first_loop_location = $loc;
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
                //count & sum continue
                //for last of block location
                $vel += floatval($loc->velocity);
                $max_vel = $loc->velocity > $max_vel ? $loc->velocity : $max_vel;
                $count_loc++;
                //tính từ điểm bắt đầu đến điểm thay đổi trạng thái
                $current_loc['end_coord'] = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $current_loc['start_time'] = $beginTime;
                $current_loc['end_time'] = $loc->created_at;
                $debug_array[] = ["start_time" => $first_loop_location->created_at, "end_time"=> $loc->created_at,
                    "start_pos" => ($first_loop_location->lat . ',' . $first_loop_location->lng), "end_pos" => ($loc->lat . ',' . $loc->lng)];
                $current_loc['km'] += floatval(self::getDistanceLocal($first_loop_location, $loc));
                $current_loc['max_vel'] = $current_loc['status'] > 0 ? $max_vel * Tracking_device::VELOCITY_RATIO : 0;
                $current_loc['avg_vel'] = $current_loc['status'] > 0 ? round($vel / $count_loc, 2) * Tracking_device::VELOCITY_RATIO : 0;
                $report_data[] = array_merge([], $current_loc);
                $current_status = $loc->status;
                //begin coordinate
                $current_loc = null;
                $current_loc = ['status' => $loc->status, "km" => 0];
                $startCoord = round(floatval($loc->lat), 6) . ',' . round(floatval($loc->lng), 6);
                $beginTime = $loc->created_at;
                $vel = 0;
                $max_vel = 0;
                $count_loc = 0;
                $first_loop_location = null;
            }
            //mark as start point to calculate distance
            if ($first_loop_location == null){
                $first_loop_location = $loc;
            }
            if (isset($current_loc['km']) ){
                $current_loc['km'] += floatval(self::getDistanceLocal($first_loop_location, $loc));
                $debug_array[] = ["start_time" => $first_loop_location->created_at, "end_time"=> $loc->created_at,
                    "start_pos" => ($first_loop_location->lat . ',' . $first_loop_location->lng), "end_pos" => ($loc->lat . ',' . $loc->lng)];
            }
            $first_loop_location = $loc;
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

    /**
     * @param $original
     * @param $destination
     * @return float|int return distance by meters
     */
    private static function getDistanceLocal($original, $destination){
        $latOrg = floatval($original->lat);
        $latDest = floatval($destination->lat);
        $lngOrg = floatval($original->lng);
        $lngDest = floatval($destination->lng);
        return self::distance($latOrg, $lngOrg, $latDest, $lngDest);
    }

    /*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
    /*::                                                                         :*/
    /*::  This routine calculates the distance between two points (given the     :*/
    /*::  latitude/longitude of those points). It is being used to calculate     :*/
    /*::  the distance between two locations using GeoDataSource(TM) Products    :*/
    /*::                                                                         :*/
    /*::  Definitions:                                                           :*/
    /*::    South latitudes are negative, east longitudes are positive           :*/
    /*::                                                                         :*/
    /*::  Passed to function:                                                    :*/
    /*::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :*/
    /*::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :*/
    /*::    unit = the unit you desire for results                               :*/
    /*::           where: 'M' is statute miles (default)                         :*/
    /*::                  'K' is kilometers                                      :*/
    /*::                  'N' is nautical miles
                          'm'  is meters                           :*/
    /*::  Worldwide cities and other features databases with latitude longitude  :*/
    /*::  are available at https://www.geodatasource.com                          :*/
    /*::                                                                         :*/
    /*::  For enquiries, please contact sales@geodatasource.com                  :*/
    /*::                                                                         :*/
    /*::  Official Web site: https://www.geodatasource.com                        :*/
    /*::                                                                         :*/
    /*::         GeoDataSource.com (C) All Rights Reserved 2017		   		     :*/
    /*::                                                                         :*/
    /*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
    private static function distance($lat1, $lon1, $lat2, $lon2, $unit = 'm') {

        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        $miles = is_nan($miles) ? 0 : $miles;
        //$unit = strtoupper($unit);

        if ($unit == "K") {
            return ($miles * 1.609344);
        } else if ($unit == "N") {
            return ($miles * 0.8684);
        } else if ($unit == "m"){
            return ($miles * 1.609344) * 1000;
        }else {
            return $miles;
        }
    }
}