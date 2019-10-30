<?php

//$base_ip = "192.168.1.123";
//$base_ip = "192.168.1.102";
$base_ip = "localhost";
//~ $link = mysql_connect('localhost', 'bom', 'dtwjshLHJwUERR7Q');
// $link = mysql_connect('gateway.lip6.fr', 'bom', 'DL77ESuQZT2a3q6X');
 //~ $link = mysql_connect($base_ip, 'root', 'ccpdroot');
 $link = new mysqli($base_ip, 'root', 'ccpdroot', 'bom');

// $link = mysql_connect('192.168.1.123', 'root', 'ccpdroot');
//~ $link = mysql_connect('192.168.250.11', 'root', 'ccpdroot');
// $link = mysql_connect('192.168.1.102', 'root', 'ccpdroot');
//$link = mysql_connect('bom.ciens.ucv.ve', 'root', 'ccpdroot');
//$link = mysql_connect('ccpd.ciens.ucv.ve', 'bom', 'ccpdroot');
//~ $db = new PDO('mysql:host=localhost;dbname=bom;charset=utf8mb4', 'root', 'ccpdroot');
if (!$link) {
    die('Could not connect: ' . $mysqli->connect_errno);
}
//~ mysql_select_db("bom", $link);

// $api_url = "http://192.168.1.102:4567";
$api_url = $base_ip.":4567";
 //~ $api_url = "http://192.168.1.123:4567";

session_start();
?>
