//window.onload = function() {alert("cargo");carga()};

var lastLog = undefined;
var lastBlock = undefined;
var lastLog2 = undefined;
var lastBlock2 = undefined;

var lastEvent = undefined;
var editing = false;
var merging = false;
var marco = undefined;
var dialog = undefined;
var cargado = false;
var metaData = "";
var drawings = []; //delete me
var alldisabled = false;
var over = undefined;
var detailed = false;
var insert = false;
var insertcustom = false;
var insertcustomstep = 0;
var insertedblock = undefined;
var flatten = false;
var msginsert = undefined;
var mylogo = undefined;
var pac=3;
var trail = [];

var sourceurl="";

function bye() {
    self.port.emit("unload");
}

function fufu(e) {
	if (!e) e=event;
	console.log(e.keyCode);
	if ( (e.keyCode == 113) || (e.keyCode == 13) ) {
		console.log("F2");
		if (merging) domerge();
		if (editing) acceptBlock();
		return false;
	}
	if ( (e.keyCode == 115) || (e.keyCode == 46) || (e.keyCode == 8)) {
		console.log("F4");
		removeBlock();
		update_marco();
		return false;
	}
	if (e.keyCode == 123) {
		console.log("F12");
		 e.preventDefault();
		update_marco_submit();
		return false;
	}
	if (e.keyCode == 121) {
		console.log("F10");
		 e.preventDefault();
		toggle_marco();
		return false;
	}
	if (e.keyCode == 119) {
		detailed = !detailed;
		console.log("F8. Detailed:" + detailed);
		update_marco();
		return false;
	}
	if ( (e.keyCode == 120) || (e.keyCode == 18) ) {
		if (e.ctrlKey) {
			console.log("Ctrl-F9 insert arbitrary");
			insertcustom = true;
			insertcustomstep = 1;
			update_marco();
			insertCustom();
			return false;
		} else {
			insert = !insert;
			console.log("F9. inserting:" + insert);
			update_marco();
			return false;
		}
	}
    if (e.keyCode == 114) {
    	console.log("F3");
    	e.preventDefault();
		goparent();
		return false;
	}
	if (e.keyCode == 13) {
		console.log("ENTER");
		dale(lastEvent);
		return false;
	}
	if (e.keyCode == 118) {
		console.log("F7 flattening");
		flattenSeg();
		return false;
	}
	
	if (e.keyCode == 122) {
		console.log("F11 resolve overlapping");
		resolveOverlapping();
		return false;
	}
	if (e.keyCode == 38) {
		if (insert) {
			console.log("Top arrow");
			e.preventDefault();
			navElem('top')
		}
	}
	if (e.keyCode == 40) {
		if (insert) {
			console.log("Bottom arrow");
			e.preventDefault();
			navElem('down')
		}
	}
	if (e.keyCode == 27 || e.keyCode == 118) {
		console.log("ESCAPE OR F7");
		reset();
		return false;
	}
	
//	lastElement.value += e.keyCode;
	
	return true;
}

function reset() {
	discardBlock();
	insert = false;
	insertcustom = false;
	detailed = false;
	update_marco();
	hideLayout()
	trail = [];
	if (page) {page.block.style.zIndex = 1;}
}

function navElem(dir) {
	if (!lastLog) return;
	if (!lastLog.geometricObjects[0]) return;
	if (lastLog.geometricObjects.length>1) return;
	if (dir=='top') {
		if (lastLog.geometricObjects[0].element.parentElement) {
			if (lastLog.geometricObjects[0].element.parentElement.tagName.toUpperCase() == "BODY") return;
			var par = lastLog.geometricObjects[0].element.parentElement;
			trail.push(lastLog.geometricObjects[0]);
			//lastLog.geometricObjects.splice(lastLog.geometricObjects.indexOf(lastLog.geometricObjects[0]), 1);
			lastLog.removeGeometricObject(lastLog.geometricObjects[0]);
			var geo = createNewGeometricObject(par);
			lastLog.addGeometricObject(geo);
			
		}
	} else {
		var geo = trail.pop();
		if (geo) {
			lastLog.removeGeometricObject(lastLog.geometricObjects[0]);
			//lastLog.geometricObjects.splice(lastLog.geometricObjects.indexOf(lastLog.geometricObjects[0]), 1);
			lastLog.addGeometricObject(geo);
		}
	}
}

function insertCustom(px,py) {
	switch(insertcustomstep) {
	case 1 : 	//msginsert = new rectObj();
				//~ msginsert.build(200,200,500,100,"2px solid black","red","Click on the first x,y point","msg");
				insertcustomstep++;
				break;
	case 2 :    console.log("xlick" + px +" "+py);
				var geo = createNewGeometricObject(undefined,georoot);
				geo.geometry = {x:px,y:py,w:10,h:10}
				insertedblock = createNewLogicalObject(geo,page);
				//insertedblock.dim = {x:px,y:py,w:10,h:10}
				//~ msginsert.setContent("Click on the secod w,h point");
				insertcustomstep++;
				break;
	case 3 : 	console.log("whclick:" + px + " "+ py);
				insertedblock.dim.w = px - insertedblock.dim.x;
				insertedblock.dim.h = py - insertedblock.dim.y;
				insertedblock.updateBlock();
				//msginsert.clear();
				blocks.push(insertedblock);
				insertedblock = undefined;
				insertcustom = false;
				update_marco();
				break;
	}
}

function toggle_marco() {
	if (marco.ishidden())
		marco.show();
	else
		marco.hide();
}

function getOffset(obj) {
	pos = {x: 0, y: 0};
	el = obj;
	while (el) {
		pos.x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
		pos.y += (el.offsetTop - el.scrollTop + el.clientTop);
		console.log("E: "+getXPath(obj)+" CUR:"+el.tagName+" ("+pos.x+","+pos.y+")");
		el = el.offsetParent;
	}
	return(pos);
}

function getDim(block) {
	var dim = {w: 0, h: 0};
	dim.w = block.offsetWidth;
	dim.h = block.offsetHeight;
	return dim;
}

//~ function getRect2(obj) {
	//~ var of = getOffset(obj);
	//~ var di = getDim(obj);
	//~ return {left:of.x, top:of.y, width:di.w, height:di.h}
//~ }

//~ function getRect3(obj) {
	//~ return {left:$(obj).offset().left, top:$(obj).offset().top, width:$(obj).width(), height:$(obj).height()}
//~ }
//~ 
//~ function getRect(obj) {
	//~ dim = {x:0, y:0, w:0, h:0};
	//~ if (obj) {
		//~ r = getRect3(obj);
		//~ dim.x = r.left;
		//~ dim.y = r.top;
		//~ dim.w = r.width;
		//~ dim.h = r.height;
	//~ }
	//~ return dim;
//~ }

function dimension(block) {
	var rect = block.dim;
	return rect.x+","+rect.y+","+rect.w+","+rect.h;
}

function getDocHeight() {
	return Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]);
}

function getDocWidth() {
	return Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);
}
function update_over() {
	if (lastBlock) {
		over.style.left = getRect(lastBlock).x+"px";
		over.style.top = getRect(lastBlock).y+"px";
		over.style.width = getRect(lastBlock).w+"px";
		over.style.height = getRect(lastBlock).h+"px";
		over.innerHTML = "Element: "+getXPath(lastBlock); 
	} 
}

function newRect(element,size,style,color,bgcolor,type) {
	if (element)
		console.log("OVER IN "+element+ " "  + getRect(element).h);
	var nover = document.createElement("div");
	nover.id = "plmanualover_" + Math.floor(Math.random()*1001);
	nover.style.background = bgcolor;
	nover.style.border = size + "px "+ style +" black";
	nover.style.opacity = '0.8';
	nover.wordWrap = 'break-word';
	if (element) {
		rect = getRect(element);
		nover.style.left = rect.x+"px";
		nover.style.top = rect.y+"px";
		nover.style.width = rect.w+"px";
		nover.style.height = rect.h+"px";
	} 
	nover.style.position = "absolute";
	nover.style.zIndex = "10000";
	console.log("Element: "+getXPath(element));
	nover.innerHTML = "<span style='font-size:12px;line-height:100%;opacity:100%;color:"+color+"'>Element: "+element.tagName+" "+nover.style.left+","+nover.style.top+","+nover.style.width+","+nover.style.height+"</span>";
	if (type=='main') {
		nover.id = "plmanual_over";
		nover.style.border = '4px dotted #000000';
	}
	if (type=="geometry_error") {
		nover.style.opacity = '1';
		nover.innerHTML = "<span style='font-size:104px;line-height:100%;color:white'><center style='color:black'>Window geometry not corret the window width should be at most 1024 to work and zoom set to 100%. We suggest to install <a style='color:white' href='https://chrome.google.com/webstore/detail/window-resizer/kkelicaakdanhinjdeammmilcgefonfh'>Window Resize extension</a></center></span>";
	}
	document.body.appendChild(nover);
	return(nover);
}

function getMenu() {
	var cs8,cs9,cs2,cs12,csc;
	if (detailed) cs8="background-color:#1E90FF"
	if (insert) cs9="background-color:#1E90FF"
	if (insertcustom) csc="background-color:#1E90FF"
	if (merging) cs2="background-color:#1E90FF;float:left;height:auto;font:76%/150% \"Lucida Grande\", Geneva, Verdana, Arial, Helvetica, sans-serif;width:10em;text-align:center;white-space:nowrap;"
	var s="";
	//"<b>Blocks actions:</b><br>";
	s+="<span id='pmerge' style='"+cs2+"' class='bommarco'><span style='color:red' class='bommarco'>[F2]</span> merge</span><br class='bommarco' >";
	s+="<span id='pgoparent' class='bommarco'><span style='color:blue' class='bommarco'>[F3]</span> select parent</span><br class='bommarco' >";
	s+="<span id='pdelete' class='bommarco'><span style='color:blue' class='bommarco'>[F4]</span> delete</span><br class='bommarco' >";
	s+="<span id='pflatten' class='bommarco'><span style='color:#EF2BB5;' class='bommarco'>[F7]</span> flatten</span></td>";
	s+="<td class='bommarco'><span  class='bommarco' id='pdetailed' style='"+cs8+"'><span class='bommarco' style='color:green;'>[F8]</span> selection</span><br class='bommarco' >";
	s+="<span id='pinsert'  class='bommarco' style='"+cs9+"'><span class='bommarco' style='color:green;'>[F9]</span> insert</span><br>";
	s+="<span id='pinscustom'  class='bommarco' style='"+csc+"'><span class='bommarco' style='color:green;'>[Ctrl-F9]</span> insert custom</span><br class='bommarco' >";
	s+="</td><td class='bommarco' ><span  class='bommarco' id='pshowhide'><span class='bommarco' style='color:green'>[F10]</span> toogle</span><br class='bommarco' >";
	s+="<span class='bommarco'  id='psend' style='"+cs12+"'><span style='color:#008000;' class='bommarco'>[F12]</span> send</span><br class='bommarco' >";
	s+="<span  class='bommarco' id='pcancel'><span class='bommarco'  style='color:orange' class='bommarco'>[ESC]</span> cancel</span><br class='bommarco' >";
	return(s);
}

function cleanDocument() {
	var all = document.getElementsByTagName("*");
	for (var i=0;i<all.length;i++) {
			if (all[i]) {
				console.log(all[i]);
				//~ setTimeout('all[i].removeAttribute("bomtype");all[i].removeAttribute("bomgeometry");all[i].removeAttribute("bomarea");all[i].removeAttribute("bomid");all[i].removeAttribute("visited");',500);
				all[i].setAttribute("bomtype",null);
				all[i].setAttribute("bomgeometry",null);
				all[i].setAttribute("bomarea",null);
				all[i].setAttribute("bomid",null);
				all[i].setAttribute("visited",null);
			}
			console.log(all[i]);
	}
}

function updateSegmentation() {
	var ac = parseFloat(document.getElementById('bomgranoptions').value);
	console.log("sdfsddsf")
	//~ for (var i=blocks.length-1;i>=0;i--) {
		//~ console.log("here I am "+i+" "+blocks[i]);
		//~ removeLogicObject(blocks[i]);
	//~ }
	page.clearChildrenBlocks();
	removeLogicObject(page);
	document.body.removeChild(document.getElementById('dialog-window-plmanual'));
	blocks=[];
	cargado = true;
	editing = false;
	console.log(ac);
	cleanDocument();
	startSegmentation(window,ac,50);
	
	update_marco();
}

function getGranOptions() {
	var s="";
	s = "<input  class='bommarco' typeinput type='hidden' name='bomgranoptions' id='bomgranoptions' value='0.5' size='3'>";
	s += "<br><input  class='bommarco' typeinput type='hidden' name='bomcurrentarea' id='bomcurrentarea' value='' size='8'>";
	//~ s="<select name='bomgranoptions' id='bomgranoptions'>";
	//~ s+="<option value='0.0'>0.0</value>";
	//~ s+="<option value='0.1'>0.1</value>";
	//~ s+="<option value='0.2'>0.2</value>";
	//~ s+="<option value='0.3'>0.3</value>";
	//~ s+="<option value='0.4'>0.4</value>";
	//~ s+="<option value='0.5' selected>0.5</value>";
	//~ s+="<option value='0.6'>0.6</value>";
	//~ s+="<option value='0.7'>0.7</value>";
	//~ s+="<option value='0.8'>0.8</value>";
	//~ s+="<option value='0.9'>0.9</value>";
	//~ s+="<option value='1'>1</value>";
	//~ s+="</select>";
	//~ s+="<input type='button' name='bomgranoptionscmd' id='bomgranoptionscmd' value='Update'>";
	return(s);
}

function update_marco() {
    var s="<table class='bommarco' border='1' cellspacing='0' cellpadding='0' width='100%'><tr align='center' valign='top'>";
    s+="<td class='bommarco'><img class='bommarco' src='"+ mylogo +"' width='128'></td>";
    s+="<td class='bommarco'>BOM Version:"+bomversion+"<br class='bommarco'>";
	s+="Window:"+$(window).width()+"x"+$(window).height()+"<br class='bommarco'>";
	s+="Document:"+$(document).width()+"x"+$(document).height()+"</td>";
	s+="<td class='bommarco'><form class='bommarco'>";
	s+="<table  class='bommarco' cellspacing=0 cellpadding=0 border=1 align='center'>";
	blocks = [];
	updateBlockList(page);
	s+=blocks.length+" blocks";	
	s+="</table>";
	s+="<input  class='bommarco' id='bomsend' type='button' value='Send'>";
	s+="</form></td>";
	s+="<td class='bommarco'>";
	s+=getMenu();
	s+=getGranOptions();
	s+="</td>";
	s+="<td class='bommarco'><b class='bommarco'>Selected block</b><div  class='bommarco' id='mobstatus' style='font-size:12px'></div></td>";
	s+="</tr></table>";
	marco.setContent(s);
	
	//~ hideLayout()
}

function stripTrailingSlash(str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function getURLParameter(name) {
  if (sourceurl) 
	durl = sourceurl;
  else
     durl = document.URL;
  durl = stripTrailingSlash(durl);
  return(durl);
}

function countNodes(node) {
  var k = 0, c = node.childNodes.length, result = c;
  for (; k<c; k++) result += countNodes(node.childNodes[k]);
  if (result==0)
	result=1;
  return result;
} 

function showLayout() {
	for (var i=0;i<blocks.length;i++) {
		if (blocks[i]) {
			blocks[i].setOn();
		}
	}
}

function hideLayout() {
	for (var i=0;i<blocks.length;i++) {
		if (blocks[i]) {
			blocks[i].setOff();
		}
	}
}

function normalizeImportance() {
	var max=0;
	for (var i=0;i<blocks.length;i++) {
		var b = blocks[i];
		if (b) {
			if (b.importance > max) max=b.importance;
		}
	}
	for (var i=0;i<blocks.length;i++) {
		var b = blocks[i];
		if (b) {
			b.importance = (b.importance/max).toFixed(2);
			b.updateBlock();
		}
	}
}

function flattenSeg() {
	var stop = false;
	while (!stop) {
		var touched = 0;
		for (var i=0;i<blocks.length;i++) {
			var b = blocks[i];
			if (b) {
				if (b.terminal()) {
				} else {
					removeLogicObject(b)
					//b.deleteBlock();
					//blocks[i] = undefined;
				}
			}
		}
		if (touched==0) stop=true;
	}
}

function resolveOverlapping() {
	for (var i=0;i<(blocks.length-1);i++) {
		var b1 = blocks[i];
		if (b1) {
			for (var j=i+1;j<blocks.length;j++) {
				var b2 = blocks[j];
				if (b2) {
					var rect1 = b1.dim;
					var rect2 = b2.dim;
					var overlap = !((rect1.w+rect1.x) < rect2.x || rect1.x > (rect2.w + rect2.x) || (rect1.h + rect1.y) < rect2.y || rect1.y > (rect2.h + rect2.y));
					if (overlap) {
						blocks[i].dim.w  = ( blocks[j].dim.x - 1 ) - blocks[i].dim.x; //think about sides, left or right cutting
						//vertical don't do it (not very common caser) :p
						blocks[i].updateBlock();
					}
				}
			}
		}
	}
}

//~ function traverse_g2l(element) {
	//~ if (!element) return;
	//~ if (!valid(element) || included(element.tagName.toUpperCase(),excludeList.concat(ignoreList))) || (element.className=='block') || (element.className=='bommarco')) return;
	//~ for (var j=0;j<blocks.length;j++) {
		//~ var b = blocks[j];
		//~ if (b) {
			//~ if (b.coverElement(element)) {
				//~ var geo = createNewGeometricObject(element);
				//~ b.addGeometricObject(geo);
			//~ }
		//~ }
	//~ }
	//~ 
//~ }

function getLeafNodes(master) {
    var nodes = Array.prototype.slice.call(master.getElementsByTagName("*"), 0);
    var leafNodes = nodes.filter(function(elem) {
        if (elem.hasChildNodes()) {
            // see if any of the child nodes are elements
            for (var i = 0; i < elem.childNodes.length; i++) {
                if (elem.childNodes[i].nodeType == 1) {
                    // there is a child element, so return false to not include
                    // this parent element
                    return false;
                }
            }
        }
        return true;
    });
    return leafNodes;
}

function geo2log() {
	for (var j=0;j<blocks.length;j++) {
		if (blocks[j]) {
			blocks[j].geometricObjects = [];
		}
	}
	var all = getLeafNodes(document.body)
	for (var i=0;i<all.length;i++)  {
		if (valid(all[i]) && !included(all[i].tagName.toUpperCase(),excludeList.concat(ignoreList).concat(['BODY'])) && (all[i].className!='block') && (all[i].className!='bommarco') && ((all[i].className!='bomauxtext'))) {
			var found=false;
			for (var j=0;j<blocks.length;j++) {
				var b = blocks[j];
				if (b) {
					if (b.coverElement(all[i])) {
						var geo = createNewGeometricObject(all[i]);
						b.addGeometricObject(geo,false);
						found=true;
						break;
					}
				}
			}
			if (!found) {
				console.log("no block matched!!!",all[i]);
			}
		}
	}
}

function update_marco_submit() {
	//~ geo2log();
    var s="<table class='bommarco' border='1' cellspacing='0' cellpadding='0'><tr class='bommarco'><td class='bommarco'>";
    s+="<img src='"+mylogo +"' width='128'><br/>";
    s+="BOM Version:"+bomversion+"<br>";
	s+="Window:"+$(window).width()+"x"+$(window).height()+"<br>";
	s+="Document:"+$(document).width()+"x"+$(document).height()+"<br>";
	s+="</td><td class='bommarco'>";
    s+="<form  class='bommarco' action='http://www-poleia.lip6.fr/~sanojaa/BOM/submit.php' id='pmanual_form' method='POST'>";
    //~ s+="<form action='http://localhost/BOM/submit.php' id='pmanual_form' method='POST'>";
	blocks = [];
	updateBlockList(page);
	var tk=0;
	for (var i=0;i<blocks.length;i++) {
			if (blocks[i]) {
				tk+=1;
			}
	}
	showLayout();
	s+=tk+" blocks<br>"
	s+="<input type='hidden' value='"+tk+"' name='total'>";
	pn=getURLParameter('fn');
	s+="<input id='pmanual_webpage' type='hidden' size='80' value='"+pn+"' name='page'>";
	s+="<input id='pmanual_source' type='hidden' size='80' value='GTdata' name='source'>";
	s+="<input id='pmanual_meta' type='hidden' size='30' value='"+metaData+"' name='meta'>";
	s+="<input id='pmanual_meta_window' type='hidden' size='30' value='"+$(window).width()+"x"+$(window).height()+ "' name='meta2' style='display:none'>";
	s+="<input id='random' type='hidden' size='30' value='"+(Math.ceil(Math.random()*2000))+ "' name='random' style='display:none'>";
	s+="<input id='bom_gran' type='text' value='"+ac+"' name='granularity' style='display:none'>";
	s+="<input id='tdcount' type='hidden' value='"+page.wordcover+"' name='tdcount'>";
	s+="<select id='pmanual_category' name='category' style='display:block'>";
    s+="<option value='none'>none</option>";
    s+="<option value='forum'>Forum</option>";
    s+="<option value='blog'>Blog</option>";
    s+="<option value='picture'>Picture</option>";
    s+="<option value='enterprise'>Enterprise</option>";
    s+="<option value='wiki'>Wiki</option>";
    s+="<option value='social'>Social</option>";
	s+="</select>";
	s+="<select id='pmanual_collection' name='collection' style='display:block'>";
    s+="<option value='GOSH'>GOSH</option>";
    s+="<option value='RAND'>RANDOM</option>";
	s+="</select>";
	s+="<div id='mobstatus'></div>";
	var k=1;
	for (var i=0;i<blocks.length;i++) {
			if (blocks[i]) {
				s+="<input type='hidden' internal='"+blocks[i].id+"' value='G" + k + "," + dimension(blocks[i]) + "," + blocks[i].id +","+blocks[i].countCover()+","+blocks[i].wordcover +"' name='block"+(k)+"'>";
				k++;
			}
	}
	//~ s+=bs;
	
	s+="Confirm send?&nbsp;<input id='finalsend' type='submit' value='Yes send to server' class='bommarco'>";
	s+="</form></td>";	
	s+="</table>";
	marco.setContent(s);
}

function DisableFrameLinks(iFrame){
   var links;
   //console.log(iFrame.contentWindow);
  //~ if ( iFrame.contentWindow && iFrame.contentWindow.document)
   //~ {
     //~ links = iFrame.contentWindow.document.links;
     //~ for(var i in links)
     //~ {
        //~ links[i].href="#";
     //~ }
   //~ }
 }

function carga(e) {
	
		if (!cargado) {
			
			if (navigator.appVersion.indexOf("Chrome")==-1){
				document.write('Sorry this ONLY works with Google Chrome or Chromium');
				return false;
			}
			
			pac = 5;
			pac = parseFloat(prompt("Segment with which granularity: 0 - 10 \nGive a number\n small blocks 0 <--> 10 bigger blocks",pac));
			if (!pac) return;
			sourceurl = location.href;
			startSegmentation(window,pac,50,"record",sourceurl);
			mylogo = chrome.extension.getURL("images/logo.png");
			
			if (!marco) {
				marco = new rectObj();
				marco.init(window,document)
				divs = "<div id='mobstatus'></div>"
				marco.build(0,0,1024,100,"4px dotted black","#F0F0F0","Loading..."+divs,"dialog-window-plmanual");
				marco.setOpacity("1")
				marco.setPosition("fixed");
				marco.setClass("bommarco");
			}
			
			
			marco.draw();
			
			//set events
			window.onmousedown = dale;
			
			window.onkeydown = fufu;
			window.onbeforeunload = bye;
			
			metaData = "chrome " + getDocWidth() +"x" + getDocHeight();

			var anchors = document.getElementsByTagName('a');
			for (var i=0;i<anchors.length;i++) {
				anchors[i].onclick = function() {return(false);};
			}
			
			var iframes = document.getElementsByTagName('iframe');
			for (var i=0;i<iframes.length;i++) {
				DisableFrameLinks(iframes[i]);
			}
			var sty = document.createElement("style");
			sty.appendChild(document.createTextNode(".bommarco {font-family:arial;color:black;font-size:12px}"))
			document.head.appendChild(sty);
			var sty2 = document.createElement("style");
			sty2.appendChild(document.createTextNode(".bomdialog {font-family:arial;color:black;font-size:12px}"))
			document.head.appendChild(sty2);
			var cont;
			
			cargado = true;
			editing = false;
			
			
			update_marco();
			
			flattenSeg();
			normalizeImportance();
			marco.toFront();
			console.log("extension ready")
		}
}

function getChildren(n, skipMe){
    var r = [];
    var elem = null;
    for ( ; n; n = n.nextSibling ) 
       if ( n.nodeType == 1 && n != skipMe)
          r.push( n );        
    return r;
}

function newmouseout(e) {
	omask = true;
	pon(e)
}

//~ function pon(e) {
	//~ console.log("PON: " + e +", " + omask);
	//~ if (!e) e=event;
    //~ if (!marco) carga();
	//~ if (editing) {
		//~ if (dialog) {
			//~ dialog.move(e.pageX+50,e.pageY+50);
		//return false;
		//~ }
	//~ } else {
		//~ elem = document.elementFromPoint(e.clientX,e.clientY);
		//~ if (!elem) discardBlock();
		//~ if (blocks.indexOf(elem)>=0) 
			//~ return false;
		//~ if (elem.id=='marco-plmanual') 
			//~ return false;
		
		//~ elem.webkitBoxSizing = 'border-box';	
		//~ lastElement = elem;
		//~ if (!findInTree(lastElement,'marco-plmanual')) {
			//~ lastContainer = getContainer(lastElement);
			//~ lastEvent = e;
			//lastElement.style.border = '4px dotted blue';
			//~ if (elemChanged)
			//defaultOver.push(newRect(lastElement,4,'dotted','blue','main'));
			//~ if (lastContainer) {
				//~ if (elemChanged) 
					//defaultOver.push(newRect(lastContainer,2,'dotted','red'));
					//lastContainer.style.border = '2px dotted red';
			//~ }
			//~ b=getChildren(lastElement.parentNode.firstChild, lastElement);
			//~ for (var i=0;i<b.length;i++) {
				//console.log("CH:"+getXPath(b[i]));
				//~ if (blocks.indexOf(b[i])>=0) {} else {
					//~ if (elemChanged)
						//defaultOver.push(newRect(b[i],2,"dotted","green"));
					//b[i].style.border = '2px dotted green'
				//~ }
			//~ }
			//~ if (go) {
				//~ var label = go.tagName;
				//~ if (go["id"]) label+="["+go["id"]+"]";
				//~ if (go.className) label+="."+go.className;
				//~ lastElement.title = label;
			//~ }
			//~ omask = true;
			//~ console.log("MARCO OVER:"+elem);
			//~ console.log("DOVER:");
			//~ console.log(defaultOver);
		//~ }
	//~ }
//~ }

function quita(e) {
	if (!e) e=event;
	if (editing) return false;
}



function findInTree(elem,id) {
	if (!elem) return(false);
	//console.log("("+elem.id+") ("+id+")");
	if (elem.id == id) {
		return true;
	} else {
		if (elem.parentNode)
			return findInTree(elem.parentNode,id);
		else
			return false;
	}
}

function isContainerTag(tag) {
	
}

function getContainer(elem) {
	if (!elem) return;
    //~ console.log("GC: ("+elem.tagName+")");
	if (isContainerTag(elem.tagName)) {
		return elem;
	} else {
		if (elem.parentNode)
			return getContainer(elem.parentNode);
		else
			return undefined;
	} 
}

function updateBlockList(log) {
	// block array must be erase before by client method
	if (!log) return;
	for (var i=0;i<log.children.length;i++) {
		if (log.children[i] && log.children[i].block) {
			blocks.push(log.children[i]);
			updateBlockList(log.children[i]);
		}
	}
}

function searchLog(log,block) {
	if (!log) return;
	var ret=undefined;
	
	if (log.block == block) return(log);
	
	for (var i=0;i<log.children.length;i++) {
		if (log.children[i] && log.children[i].block && block) {
			if (ret = searchLog(log.children[i],block)) break;
		}
	}
	return(ret);
}

function searchRect(rectid) {
	for (var i=0;i<drawings.length;i++) {
		if (drawings[i] && rect) {
			if (drawings[i].data.getAttribute('id') == rectid) {
				return(drawings[i]);
			}
		}
	}
	return(undefined);
}

function auxiliarBlock(nblock) {
	if (!nblock) return;
	if (!lastBlock) return;
	lastBlock2 = nblock;
	if ( editing && 
		 !findInTree(lastBlock2,'marco-plmanual') &&
		 (lastBlock2.id != 'dialog-window-plmanual') &&
		 (lastBlock2.id != 'marco-plmanual') &&
		 (lastBlock2.id != 'plno') &&
		 (lastBlock2.id != 'plyes') ) {
			merging = true;
			update_marco();
			lastBlock2 = nblock
			lastLog2 = searchLog(page,lastBlock2);
			
			if (!lastLog2) {
				discardBlock();
				return;
			}
			
			lastLog2.setOn();
			
			var cont="<h1 class='bomdialog'>Merge block "+lastLog.id+" with block "+lastLog2.id+"?</h1>";
				cont+="<center>";
				cont+="<span class='bomdialog' id='plyes'>[F2 Yes]</span>&nbsp;";
				cont+="<span class='bomdialog' href id='plesc'>[F7/ESC No]</span>&nbsp;";
				cont+="</center><br>";
			dialog.setContent(cont);
	}
}

function getBlocksUnderClick(e) {
	var all = document.getElementsByTagName("div");
	var cdiv,log, list=[];
	for (var i=0;i<all.length;i++) {
		cdiv = all[i];
		if (cdiv.className=="block") {
			log = searchLog(page,cdiv);
			if (log) {
				if (log.dim) {
					if (PolyK.ContainsPoint(getPolygonPoints(log.dim),e.pageX,e.pageY)) {
						list.push(log);
					}
				}
			}
		}
	}
	//~ alert(list);
	return(list);
    
}

function getElementsUnderClick(e) {
	var all = document.getElementsByTagName("*");
	var celem,log, list=[];
	for (var i=0;i<all.length;i++) {
		celem = all[i];
		if (celem) {
			if (valid(celem)) {
				if ( (celem.className!="block") && 
				 !findInTree(celem,'marco-plmanual') &&
				 (celem.id != 'dialog-window-plmanual') &&
				 (celem.id != 'marco-plmanual') &&
				 (celem.id != 'plno') &&
				 (celem.id != 'plyes') ) {
					 var edim = getRect(celem);
					if (PolyK.ContainsPoint(getPolygonPoints(edim),e.pageX,e.pageY)) {
						list.push(celem);
					}
					
				}
			}
		}
	}
	
	//~ alert(list);
	return(list);
    
}

function normalizeFromElement(e) {
	var nw = 100*getRect(e).w/documentDim().w;
	var nh = 100*getRect(e).h/documentDim().h;
	return(Math.min(nw,nh) / Math.max(nw,nh) * 10);
}

function insertNew(e) {
	var elist = getElementsUnderClick(e);
	var go = elist[elist.length-1];
	var geo;
	trail =[];
	if (geo = processGeometricObject(go)) {
		
		var log = new logicalObject();
		log.parent = page;
		log.addGeometricObject(geo);
		page.addChild(log);
	
		blocks.push(log)
		console.log("Added ",log,"to",parent," with block",log.block);
		lastBlock = log.block;
		lastLog = log;
	}
}

//~ function insertNew_(e) {
	//~ var elist = getElementsUnderClick(e);
	//~ //var blist = getBlocksUnderClick(e);
	//~ var msg="";
	//~ var sel=elist.length-1;
	//~ var go,parent;
	//~ 
	//~ for (var j=0;j<elist.length;j++) {
		//~ if (valid(elist[j]) && (elist[j].innerText.strip!="") && (BOMType(elist[j]))) {
			//~ var rf = refName(elist[j]);
			//~ if ((rf != "")) {
				//~ if (normalizeFromElement(elist[j])>pac) {
					//~ msg+=(j+1) + ". " + refName(elist[j]) + ", gr:"+ relativeAreaElement(elist[j]).toFixed(4) +"\n";
					//~ if (e.toElement == elist[j]) sel=j;
				//~ }
			//~ }
		//~ }
	//~ }
	//~ sel="";
	//~ sel = parseInt(prompt("Select the object you whold like to convert to Block\nGive a number\n"+msg,sel));
	//~ if (!sel) return;
	//~ go = elist[sel-1];
	//~ var geo;
	//~ if (geo = processGeometricObject(go)) {
		//~ 
		//~ var log = new logicalObject();
		//~ log.parent = page;
		//~ log.addGeometricObject(geo);
		//~ 
		//~ if (blist.length>1) {
			//~ msg="";
			//~ sel=blist.length-1;
			//~ for (var j=0;j<blist.length;j++) {
				//~ msg+=j + ". " + blist[j].id + "\n";
				//~ if (log.block.getAttribute("id") == blist[j].block.getAttribute("id")) sel=j;
			//~ }
			//~ sel = parseInt(prompt("Select the parent for the new logical object\nGive a number\n"+msg,sel));
			//~ if (!sel) return;
			//~ parent = blist[sel];
		//~ } else parent = blist[0];
		//~ page.addChild(log);
		//~ parent.addChild(log);
	//~ 
		//~ blocks.push(log)
		//~ console.log("Added ",log,"to",parent," with block",log.block);
		//~ lastBlock = log.block;
	//~ } else {alert(refName(go) + " is not a valid element");insert=false;}
	//~ insert = false;
//~ }

function performAction(id) {
	if (id == "bomsend") {update_marco_submit();return(true);}
	if (id == "bomgranoptions") {e.stopPropagation();return(true);}
	if (id == "bomcurrentarea") {e.stopPropagation();return(true);}
	if (id == "bomgranoptionscmd") {updateSegmentation();return(true);}
	if (id == "pmerge") {
		if (merging) domerge();
		if (editing) acceptBlock();
	}
	if (id == "pgoparent") {
		goparent();
	}
	return(false);
}

function dale(e) {
	console.log("CLICK1 ", "merge:",merging,"edit:",editing,"insert",insert,"lb:",lastBlock,"ll:",lastLog,"e:",e);
	if (insertcustom) {
		insertCustom(e.pageX,e.pageY);
		return;
	}
	if (insert) {
		insertNew(e);
		return;
	}
	if (merging) {
		if (e) {
			performAction(e.target.getAttribute("id"));
			reset();
		}
		return;
	}
	if (e) {
		if (lastBlock && e.ctrlKey) {
			auxiliarBlock(e.target);
			performAction(e.target.getAttribute("id"))
			return;
		} else {
			if (editing) {
				editing=false;
				if (lastLog) lastLog.setOff();
			}
			lastBlock = e.target || e.toElement;
			console.log(lastBlock.getAttribute("id"));
			if (performAction(lastBlock.getAttribute("id"))) {
				//~ reset();
				return
			}
			if (detailed)  {
				var list = getBlocksUnderClick(e);
				if (list.length>1) {
					var msg="";
					var sel = 0;
					for (var j=0;j<list.length;j++) {
						msg+=j + ". " + list[j].id + "\n";
						if (lastBlock.getAttribute("id") == list[j].block.getAttribute("id")) sel=j;
					}
					sel = parseInt(prompt("Several objects are under the click\nGive the number\n"+msg,sel));
					lastBlock = list[sel].block;
				}
			}
			if (lastBlock.className == "bomauxtext") {
				lastBlock = lastBlock.parentNode;
			}
		}
	}
	
	if ( !editing && 
		 !findInTree(lastBlock,'marco-plmanual') &&
		 (lastBlock.id != 'dialog-window-plmanual') &&
		 (lastBlock.id != 'marco-plmanual') &&
		 (lastBlock.id != 'plno') &&
		 (lastBlock.id != 'plyes') ) {
		editing = true;
		
		lastLog = searchLog(page,lastBlock);
		if (!lastLog) return;
		document.getElementById("mobstatus").innerHTML = "<b>"+lastLog.getId()+"</b><br><b>Granularity:</b>: "+lastLog.gran.toFixed(4) + "<br><b>HTMLCover:</b> "+lastLog.htmlcover+"<br><b>WordCover:</b> "+lastLog.wordcover+" ("+(lastLog.wordcover/page.wordcover).toFixed(2)+"%)<br><b>Importance:</b>"+lastLog.importance;
		console.log("Working with ",lastBlock,lastLog)
		if (lastLog) {
			lastLog.setOn();
			//~ document.getElementById("bomcurrentarea").value = lastLog.gran;
        
			//~ var cont="<h1 class='bomdialog'>Block actions for block "+lastLog.id+"</h1>";
				//~ cont+="<center>";
				//~ cont+="<span class='bomdialog' id='plyes'>[F2] accept as block</span>&nbsp;";
				//~ cont+="<span class='bomdialog' href id='plparent'>[F3] go parent</span>&nbsp;";
				//~ cont+="<span class='bomdialog' href id='plparent'>[F4] delete</span>&nbsp;";
				//~ cont+="<span class='bomdialog' href id='plesc'>[ESC] cancel</span>&nbsp;";
				//~ cont+="</center><br>";
				//~ cont+="Geometrics Object Inside:<br>";
				//~ cont+="<ul>";
				//~ for (var k=0;k<lastLog.geometricObjects.length;k++) {
					//~ var go = lastLog.geometricObjects[k];
					//~ var label = go.element.tagName;
					//~ if (go["id"].element) label+="["+go.element["id"]+"]";
					//~ if (go.element.className) label+="."+go.element.className;
					//~ cont+="<li>"+go.type + " : " + label + " @ " + go.getGeometry() + " </li>";
				//~ }
				//~ cont+="</ul>";
				//~ cont+="<br>: Block " + lastLog.id + " :" ;
				//~ cont+="<br>Type: " + lastLog.type;
				//~ cont+="<br>rArea: " + lastLog.gran;
				
			//~ if (!dialog) {
				//~ dialog = new rectObj();
				//~ dialog.init(window,document)
				//~ var rc = lastBlock.getBoundingClientRect();
				//~ dialog.build(rc.left,rc.bottom,500,200,"2px dotted black","#F0F0F0",cont,"dialog-window-plmanual");
				//~ dialog.setOpacity("1")
				//~ dialog.draw();
			//~ } else {
				//~ dialog.setContent(cont);
			//~ }
		} else {
			if (lastBlock) {
				//clear orphan block
				var r = searchRect(lastBlock);
				if (r) 
					r.clear();
				else
					try {
						document.body.removeChild(lastBlock)
					} catch(err) {}
			}
		}
	}
}

function goparent() {
    //~ console.log("GDADDY "+lastElement.parentNode)
    //var log = searchLog(lastBlock);
	if (lastLog && lastLog.parent) {
        lastLog.setOff();
        lastBlock = lastLog.parent.block;
	    editing=false
	    dale();
	} else {console.log("NO MORE PARENTS!!!")}
	return(false);
}

function acceptBlock() {
	if (!lastBlock)
		return false;
	if (!lastLog)
		lastLog = searchLog(page,lastBlock);
	if (lastLog.type == "PAGE") return;
	lastLog.clearChildrenBlocks();
	lastLog.updateBlock();
	lastLog.setOff();
	lastBlock = undefined;
	lastBlock2 = undefined;
	if (lastLog2) lastLog2.setOff();
	dialog.clear();
	editing=false;
	merging=false;
	dialog=undefined;
	insert = false;
	update_marco();
	return(true);
}

function discardBlock() {
	if (dialog)	
		dialog.clear();
	if (lastLog) 
		lastLog.setOff();
	if (lastLog2) {
		lastLog2.setOff();
	}
		
	lastBlock = undefined;
	lastBlock2 = undefined;
	dialog=undefined;
	
    drawings = []
	editing=false;
	merging = false;
	insert = false;
	update_marco();
	return(false);
}

function removeBlock() {
	if (lastLog.type == "PAGE") return;
	
	if (dialog)	dialog.clear();
	lastLog.setOff();
	removeLogicObject(lastLog);

	lastBlock = undefined;
	lastBlock2 = undefined;
	
	if (lastLog2) {
		lastLog2.setOff();
	}
	
	lastLog = undefined
	lastLog2 = undefined
	
	drawings = []
	editing=false;
	dialog=undefined;
	merging = false;
	update_marco();
	return(false);
}

function domerge() {
	if (!lastBlock && !lastBlock2) return;
	if (!lastLog) lastLog = searchLog(page,lastBlock)
	if (!lastLog2) lastLog2 = searchLog(page,lastBlock2)
	lastLog.setOff()
	lastLog2.setOff()
	lastLog.mergeWith(lastLog2);
	lastBlock2 = undefined;
	lastBlock = undefined;
	lastLog = undefined
	lastLog2 = undefined
	merging = false;
	editing = false;
	if (dialog)	dialog.clear();
	dialog = undefined;
	update_marco();
}

function getXPath(elt) {
     var path = "";
     for (; elt && elt.nodeType == 1; elt = elt.parentNode)
     {
   	idx = getElementIdx(elt);
	xname = elt.tagName;
	if (idx > 1) xname += "[" + idx + "]";
	path = "/" + xname + path;
     }
 
     return path.toLowerCase();	
}

function getElementIdx(elt)
{
    var count = 1;
    for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling)
    {
        if(sib.nodeType == 1 && sib.tagName == elt.tagName)	count++
    }
    
    return count;
}




