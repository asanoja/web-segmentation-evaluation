<?php include "conn7.php";?>

<?php
function getUserIpAddr(){
    if(!empty($_SERVER['HTTP_CLIENT_IP'])){
        //ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }elseif(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
        //ip pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }else{
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}
?>

<?php
$pageid=$_SESSION["pageid"];
$granularity=$_SESSION["granularity"];
$area=$_SESSION["area"];
$category_id=$_REQUEST["category_id"];
$tcount=$_SESSION["tcount"];
$_SESSION["category_id"]=$category_id;
echo "Page id: ".$pageid."<br>";
echo "Granularity: ".$granularity."<br>";
echo "Area: ".$area."<br>";
echo "Category id: ".$category_id."<br>";
echo "Wordcount: ".$tcount."<br>";
$sql = "select * from pages_category where page_id='".$pageid."' and category_id='".$category_id."'";
$chk = $link->query($sql);

if ($chk->num_rows === 0) {
	$sql = "insert into pages_category(page_id,category_id) values('".$pageid."','".$category_id."')";
	$ret=$link->query($sql);
	$pagecat = $link->insert_id;
} else {
	if ($rpc = $chk->fetch_assoc()) {
		$pagecat = $rpc["id"];
	} else {
		die("error");
	}
}

echo "Page category id: ".$pagecat."<br>";
$sql="select id from segmentation where page_category_id='".$pagecat."' and granularity='".$granularity."' and algo='BOM11'";
$rseg = $link->query($sql);
if ($rseg->num_rows===0) {
	//continue
} else {
	if ($r = $rseg->fetch_assoc()) {
		$segmentation_id=$r["id"];
		$sql = "delete from blocks where segmentation_id=$segmentation_id";
		$link->query($sql);
		$sql = "delete from segmentation where id=$segmentation_id";
		$link->query($sql);
	}
}


$userip=getUserIpAddr();
$arr = explode("##",$_SESSION["descriptor"]);
$queries = [];
$doc_w=0;
$doc_h=0;

for($i=0;$i<count($arr);$i++) {
	$query="chrome";
	if (substr( $arr[$i], 0, strlen($query) )) {
		//~ echo $arr[$i];
		$rec = explode("][",$arr[$i]);
		for ($j=0;$j<count($rec);$j++) {
			//~ echo "($j) $rec[$j] ";
			if ($j==3) $doc_w=$rec[$j];
			if ($j==4) $doc_h=$rec[$j];
			if ($j==5) $ecount=$rec[$j];
			if ($j==6) $gran=$rec[$j];
			if ($j==7) $bid=$rec[$j];
			if ($j==8) $x=$rec[$j];
			if ($j==9) $y=$rec[$j];
			if ($j==10) $w=$x+$rec[$j];
			if ($j==11) $h=$y+$rec[$j];
			if ($j==12) $tdcount=$rec[$j];
			if ($j==23) $images=$rec[$j];
			if ($j==24) $text=$rec[$j];
			if ($j==25) $label=$rec[$j];
			if ($j==26) $gran=$rec[$j];
		}
		//~ $segmentation_id="3088";
		$nx=100*$x/$doc_w;
		$nw=100*$w/$doc_w;
		$ny=100*$y/$doc_h;
		$nh=100*$h/$doc_h;
		$images=str_replace("'","",$images);
		$images=str_replace(",","|",$images);
		array_push($queries,"insert into blocks(doc_w,doc_h,bid,x,y,w,h,segmentation_id,ecount,tcount,importance,nx,ny,nw,nh,text,images,label,granularity) values('$doc_w','$doc_h','$bid','$x','$y','$w','$h','?segmentation_id?','$ecount','$tdcount','0',$nx,$ny,$nw,$nh,'$text',\"$images\",'$label','$gran');");
		//~ var_dump($images);
	}
}


$pageid=intval($pageid);
$tcount=intval($tcount);
$granularity=intval($granularity);
$area=intval($area);
$sql="insert into segmentation(page_id,page_category_id,source1,source2,algo,granularity,separation,browser,doc_w,doc_h,tdcount,align,area)  values('$pageid','$pagecat','$userip','','BOM11','$granularity',50,'chrome','$doc_w','$doc_h','$tcount','HV','$area')";
$link->query($sql);
$segmentation_id=$link->insert_id;
var_dump($link);
$ids = array();
foreach ($queries as $q) {
	$q=str_replace("?segmentation_id?",$segmentation_id,$q);
	//~ echo $q;
	$link->query($q);
	//~ var_dump($link);
	array_push($ids,$link->insert_id);
}
echo "Segmentation id: ".$segmentation_id."<br>";
echo "Blocks ids:<br>";
foreach ($ids as $i) {
	echo "<li>".$i."</li>";
}
?>
