<?php include "conn7.php";?>
<?php
$pageurl = $_REQUEST["pageurl"];
$granularity = $_REQUEST["granularity"];
$arr = explode("/",$pageurl);
$arr = array_filter($arr);
$code = end($arr);
$_SESSION["descriptor"] = $_REQUEST["descriptor"];
$_SESSION["granularity"] = $_REQUEST["granularity"];
$_SESSION["area"] = $_REQUEST["area"];
$_SESSION["tcount"] = trim($_REQUEST["tcount"]);
$sql = "select * from pages where dataset_code='$code'";
$resultado = $link->query($sql);
if ($page = $resultado->fetch_assoc()) {
	if ($resultado->num_rows === 0) {
		// continue
	} else {
		$pageid = $page["id"];
	}
}
?>
<form action="category.php" method="post">
Confirm or select a page:<br>
<select name="url">
<?php
$sql = "select * from pages order by url";
$resultado = $link->query($sql);
while ($page = $resultado->fetch_assoc()) {
	if ($pageid==$page["id"]) $sel=" selected"; else $sel="";
	echo "<option value='".$page["id"]."' ".$sel.">".$page["url"]."</option>";
}
?>
</select>
<br>
<input type="hidden" name="pageid" value="<?php echo $pageid?>">
<input type="submit" value="Next">
</form>
