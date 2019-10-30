<?php include "conn7.php";?>
<?php
$pageid = $_REQUEST["pageid"];
$_SESSION["pageid"] = $pageid;

?>
PageID: <?php echo $pageid;?>
<form action="outline.php" method="post">
Confirm or select a <b>Collection</b> and <b>Category</b>:<br>
<select name="category_id">
<?php
echo $sql = "select categories.id catid, collection.id as colid,categories.name catname,collection.name as colname from categories inner join collection on collection.id=categories.collection_id order by collection.name, categories.name";
$resultado = $link->query($sql);
while ($category = $resultado->fetch_assoc()) {
	if ($_SESSION["category_id"]==$category["catid"]) $sel=" selected "; else $sel="";
	echo "<option $sel value='".$category["catid"]."'>".$category["colname"]."::".$category["catname"]."</option>";
}
?>
</select>
<br>
<input type="submit" value="Next">
</form>
