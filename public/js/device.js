/**
 * Created by hiepl on 8/22/2017.
 */
$(document).ready(function() {
    if ($('input[type="number"].tracking_device_id')[0] == undefined) {
        return false;
    }
    if ($('input[type="number"].tracking_device_id').val() == ''){
        $.ajax({
            "url":"/device/get-deviceid",
            "method": "get",
            "success": function(resp) {
                console.log(resp,'ddddddd');
                $('input[type="number"].tracking_device_id').val(resp);
            },
            "error": function() {

            }
        })
    }

});