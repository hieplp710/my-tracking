<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "my_tracking";

try {
//    $conn = new PDO("mysql:host=$servername;dbname=floe9f1f_my_tracking", $username, $password);
//    // set the PDO error mode to exception
//    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    //echo "Connected successfully";
    //$,<Id>,<Command>,<Time>,<Status>,<Velocity>,<Direction>,<Lat>,<Long>,<Reverser>,<Checksum>,#
    $postdata = file_get_contents("php://input");
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    if (!empty($postdata)){
        $data_array = explode(',', $postdata);
        $device_id = $data_array[1];
        $command = $data_array[2];
        $time = $data_array[3];
        $status = $data_array[4];
        $velocity = $data_array[5];
        $heading = $data_array[6];
        $lat = $data_array[7];
        $lng = $data_array[8];
        $reverser = $data_array[9];
        $checksum = $data_array[10];
        $current = date('Y-m-d H:i:s');
        $query = "INSERT INTO `device_locations`(`device_id`,`command`,`lat`,`lng`,`status`,`heading`,`created_at`,`updated_at`,`current_state`,`velocity`,`reverser`,`checksum`)
VALUES ('$device_id',$command,$lat,$lng,$status,$heading,'$time','$current','',$velocity,$reverser,$checksum);";

        if ($conn->query($query) === TRUE) {
            echo "Record updated successfully";
        } else {
            echo "Error updating record: " . $conn->error;
            die();
        }
        $conn->close();
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST');
        header('content-type: application/json; charset=utf-8');
        echo '{"status":true}';
    }
}
catch(PDOException $e)
    {
    echo "Connection failed: " . $e->getMessage();
    }
?>