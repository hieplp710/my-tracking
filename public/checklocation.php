<html>
<header>
    <title>Check location</title>
</header>
<style type="text/css" rel="stylesheet">
    .content table {
        width: 80%;
        border-spacing: 0;
        border-collapse: collapse;
    }

    .content th.td-col, td.td-col {
        width: 10%;
        text-align: center;
        border: 1px solid #cccccc;
        border-collapse: collapse;
        margin: 0;
        padding: 10px;
    }
</style>
<body>
<?php
//connect to db and get data
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "my_tracking";

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $sql = "SELECT * FROM device_locations ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $data = [];
    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $temp = array_merge([], $row);
            $data[] = $temp;
        }
    } else {
    }

}
catch(PDOException $e)
{
    echo "Connection failed: " . $e->getMessage();
}
?>
<h2>Location log</h2>
<div class="wrapper">
    <div class="content">
        <table class="header">
            <thead>
            <tr>
                <th class="td-col">Device id</th>
                <th class="td-col">Command</th>
                <th class="td-col">Status</th>
                <th class="td-col">Heading</th>
                <th class="td-col">Velocity</th>
                <th class="td-col">Latitude</th>
                <th class="td-col">Longitude</th>
                <th class="td-col">Time</th>
                <th class="td-col">Reverser</th>
                <th class="td-col">Checksum</th>
            </tr>
            </thead>
            <tbody></tbody>
        </table>
        <table class="content-table">
            <tbody>
            <?php if (count($data) > 0) {
                foreach($data as $item){
                    ?>
                    <tr>
                        <td class="td-col"><?php echo $item['device_id']; ?></td>
                        <td class="td-col"><?php echo $item['command']; ?></td>
                        <td class="td-col"><?php echo $item['status']; ?></td>
                        <td class="td-col"><?php echo $item['heading']; ?></td>
                        <td class="td-col"><?php echo $item['velocity']; ?></td>
                        <td class="td-col"><?php echo $item['lat']; ?></td>
                        <td class="td-col"><?php echo $item['lng']; ?></td>
                        <td class="td-col"><?php echo $item['created_at']; ?></td>
                        <td class="td-col"><?php echo $item['reverser']; ?></td>
                        <td class="td-col"><?php echo $item['checksum']; ?></td>
                    </tr>
                <?php }} else { ?>
                <tr><td colspan="10">Chưa có thông tin</td></tr>
            <?php } ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>