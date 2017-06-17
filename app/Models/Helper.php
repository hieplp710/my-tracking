<?php
namespace App\Models;

trait Helper{
    public static function formatDatetime($datetime, $format = 'Y-m-d H:i:s', $target_format = 'd-m-Y H:i:s'){
        $date = \DateTime::createFromFormat($format, $datetime);
        if ($date){
            return $date->format($target_format);
        }
        return date($target_format);
    }
}