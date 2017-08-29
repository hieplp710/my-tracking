<?php
namespace App\Models;

trait Helper{
    public static function formatDatetime($datetime, $format = 'Y-m-d H:i:s', $target_format = 'd-m-Y', $tz = 'Asia/Ho_Chi_Minh'){
        if (empty($datetime)) {
            return '';
        }
        $date = \DateTime::createFromFormat($format, $datetime, new \DateTimeZone($tz));
        if ($date){
            return $date->format($target_format);
        }
        return date($target_format);
    }
}