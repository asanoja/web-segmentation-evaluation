// Andres Sanoja
// Stephane Gancarski
// UCV - UPMC
// 2017

var maxid=0;
var prefix=undefined;
var mig45data = {}

function eid(e) {
	var s = [];
	s.push(e.tagName);
	if (e.hasAttribute("id")) s.push(e.getAttribute("id"));
	if (e.className) s.push(e.className);
	return s.join(".");
}
function is_block(e) {
	if (!e) return false;
	return e.hasAttribute("block");
}
function is_nav(e) {
	if (!e) return;
	var nav=true;
	if (e.hasAttribute("id")) nav = nav && e.getAttribute("id").search("nav")>=0;
	nav = nav && e.className.search("nav")>=0;
	all=jQuery(e).find("*").length;
	links=jQuery(e).find("[href]").length;
	prop = links/all;
	nav = nav && prop>0.8
	return nav
}
function is_header(e) {
	var header = true;
	if (e.hasAttribute("id")) header = header && e.getAttribute("id").search("head")>=0
	header = header && e.className.search("head")>=0
	header = header && (jQuery(e).offset().top<=screen.height/2)
	header = header && (jQuery(e).offset().left<=50)
	header = header && (jQuery(e).width()>=screen.width-50)
	return header;
}
function is_footer(e) {
	var footer = true;
	if (e.hasAttribute("id")) footer = footer && e.getAttribute("id").search("foot")>=0
	footer = footer && e.className.search("foot")>=0
	footer = footer && (jQuery(e).offset().top>screen.height)
	footer = footer && (jQuery(e).offset().left<=50)
	footer = footer && (jQuery(e).width()>=screen.width-50)
	return footer;
}
function traverse(e) {
	if (!e) return;
	var n=0
	if (e.hasAttribute("block")) {
		tag="article";
		n++;
		if (jQuery(e).find("[block]").length>0) {
			tag="section";
		} else {
			if (is_nav(e)) tag="nav";
			else if (is_header(e)) tag="header";
			else if (is_footer(e)) tag="footer";
			else tag="article";
				
		}
		var bid=e.getAttribute("block");
		jQuery(e).wrap("<"+tag+" mblock='"+bid+"' id='MIG45-"+bid+"'></"+tag+">");
		n = jQuery("#mig45-"+bid);
		remove_blocks_recursive(n);
		//~ bid="#block"+e.getAttribute("block");
		//~ jQuery(bid).html("<span style='background-color: black;color:white'>"+tag.toUpperCase()+"<span>");
	} 
	if (e.children.length > 0) {
		for (var i=0;i<e.children.length;i++) {
			child = e.children[i];
			if (child) {
				n=n+traverse(child);
			}
		}
	}
	return n;
}

function content_count_of(e) {
	var text = $(e).text().trim();
	var images = $(e).children('img').map(function(){return $(this).attr('src')}).get();
	return text.length+images.length;
}
function getElsAt(b){
	var all = document.body.getElementsByTagName("*");
	var inpoint = [];
	var max = 0;
	var maxelem = undefined;
	for (var i=0, max=all.length; i < max; i++) {
		 e = all[i];
		 if (e) {
			 if (jQuery(e).is(":visible") && 
				(e.tagName.toLowerCase()!="html") && 
				(e.tagName.toLowerCase()!="head") && 
				(e.tagName.toLowerCase()!="body") &&
				(content_count_of(e)>0))
				{
				 je = jQuery(e);
				 eleft = je.offset().left;
				 etop = je.offset().top;
				 ewidth = je.width();
				 eheight = je.height();
				 //~ console.log(eid(e),jQuery(e).is(":visible"),content_count_of(e),b["x"]<=eleft,b["y"]<=etop,eleft<=b["w"],etop<=b["h"]);
				 delta = 15
				 if ( (b["x"]-delta<=eleft) 	&& 
				      (b["y"]-delta<=etop)  	&& 
				      (eleft<=b["w"]+delta) 	&& 
				      (etop<=b["h"]+delta)		&&
				      (!e.hasAttribute("bom-locked"))
					) {
					inpoint.push(e);
				}
			 } 
		 }
	}
    return inpoint;
}


function area(e) {
	je = jQuery(e);
	return parseFloat(Math.abs(je.width()) * Math.abs(je.height()));
}
function compare(e,b) {
	je = jQuery(e);
	
	ehdif = je.width() //-je.offset().left;
	evdif = je.height() //-je.offset().top;
	bhdif = b["w"]-b["x"];
	bvdif = b["h"]-b["y"];
	ehdif = Math.max(ehdif,0);
	evdif = Math.max(evdif,0);
	bhdif = Math.max(bhdif,0);
	bvdif = Math.max(bvdif,0);
	
	var h = Math.abs(bhdif-ehdif);
	var v = Math.abs(bvdif-evdif);
	
	ph = (1-h/bhdif);
	pv = (1-v/bvdif);
	avg = (ph+pv)/2;
	//~ console.log(eid(e),ph.toFixed(2),pv.toFixed(2),avg.toFixed(2));
	return {"element": e, "avg": avg};
}
function mark_element_as_block(e,b) {
	var bid="";
	var color="blue";
	if (e.getAttribute("bom-locked")) return;
	e.setAttribute("title"," "); //+e.tagName.toLowerCase()+" "+b["bid"]+" "+area(e)+" ";
	if (b) {
		bid=b["bid"];
		color="blue";
	} else {
		maxid++;
		bid=prefix+""+maxid;
		color="red";
	}
	e.setAttribute("block",bid);
	e.setAttribute("title",bid);
	remove_blocks_recursive(e);
	e.style = "border:4px solid "+color;
	//~ jQuery("body").append("<span id='"+bid+"' style='background-color:red;position:absolute;top:10;left:10'>"+bid+" "+e+"</span>")
}
function remove_blocks_recursive(e) {
	if (!e) return;
	for (var i=0;i<e.children.length;i++) {
		var child = e.children[i];
		if (child) {
			if (is_block(child)) {
				child.removeAttribute("block")
			}
			child.setAttribute("bom-locked","1");
			remove_blocks_recursive(child);
		}
	}
}
function unmark_element_as_block(e) {
	e.setAttribute("title",""); //+e.tagName.toLowerCase()+" "+b["bid"]+" "+area(e)+" ";
	e.removeAttribute("block");
	e.style = "border:0px solid transparent";
	//~ jQuery("body").append("<span id='"+b["bid"]+"' style='background-color:red;position:absolute;top:10;left:10'>"+b["bid"]+" ("+px.toFixed(2)+","+py.toFixed(2)+") "+e+"</span>")
}
function verify_elements(list,b) {
	if (!list || !b) return;
	res = [];
	for (var i=0;i<list.length;i++) {
		c = list[i];
		if (c) {
			res.push(compare(c,b));
		}
	}
	max = {"element":undefined,"avg":0}
	maxval=0
	for (var i=0;i<res.length;i++) {
		if (res[i]["avg"] > maxval) {
			max = res[i];
			maxval=res[i]["avg"]
		}
	}
	//~ console.log(max);
	return max;
}

function get_sub_blocks(e) {
	if (!e) return;
	var ret = [];
	for (var i=0;i<e.children.length;i++) {
		var child = e.children[i];
		if (child) {
			//~ console.log(child,is_block(child));
			if (is_block(child)) {
				ret.push(child);
			}
			ret.push(get_sub_blocks(child));
		}
	}
	//~ console.log([].concat.apply([], ret));
	return [].concat.apply([], ret);
}
function get_siblings(e) {
	if (!e) return;
	if (e.parentElement) {
		return e.parentElement.children;
	}
}
function cuantos_blocks(e) {
	if (!e) return 0;
	var b=0;
	if (is_block(e)) b++;
	for (var i=0;i<e.children.length;i++) {
		var child = e.children[i];
		if (child) b=b+cuantos_blocks(child);
	}
	return(b);
}
function valid(e) { //faltan las imagenes todas son invalidas
var p1 =  true;
var p2 =  true;
var p3 =  true;
	p1 =e && 
		area(e)>100 && 
		$(e).is(":visible") && 
		($(e).offset().left>=0) && 
		($(e).offset().top>=0) && 
		($(e).width()>10 && $(e).height()>10) &&
		(content_count_of(e)>0);
	if (e.tagName.toLowerCase()=="iframe" && $(e).contents().find("body").length>0) {
		var c=0;
		$(e).contents().find("body").find("*").each(function (i,e) {if ($(e).is(":visible")) c++;})
		p2 = c>0
		
	}
	if (e.tagName.toLowerCase()=="img") {
		p2=p1;
	}
	p3 = !e.hasAttribute("bom-locked");
	//~ console.log("p1=",p1,"p2=",p2);
	return p1 && p2;
	// VERIFICAR QUE FUNCIONA CON IMAGENES
}
function visited(e) {
	return e.hasAttribute("visited") && e.getAttribute("visited")=="true";
}
function verify_coverture(e) {
	if (!e) return;
	if (visited(e)) return true;
	e.scrollIntoView();
	//~ console.log("Current node "+eid(e));
	var noblocks = [];
	if (is_block(e)) {
		//~ console.log(eid(e)+" is a block");
		remove_blocks_recursive(e);
		var siblings= get_siblings(e);
		//~ console.log(eid(e),siblings);
		for (var i=0;i<siblings.length;i++) {
			var sib = siblings[i];
			if (sib && (sib!=e) && (!visited(sib))) {
				//~ console.log("ver",e)
				if (!is_block(sib)) {
					var cb = cuantos_blocks(sib);
					//~ console.log("sibling has ",cb, " blocks ",sib,);
					if (cb>0) {
						noblocks.push(sib);
					} else {
						if (valid(sib)) {
							mark_element_as_block(sib); // verificar que no intersecten y area>0
						} else {
							sib.setAttribute("visited","true"); // si es invalido no volverlo a visitar
						}
					}
				} else {
					//~ sb_b++;
				}
				//sib.setAttribute("visited","true");
			}
		}
		if (noblocks.length>0) { //no hay una particion  completa
			//~ console.log(eid(e), " no tiene una particion completa");
			for (var i=0;i<noblocks.length;i++) {
				var nb = noblocks[i];
				verify_coverture(nb);
			}
		} else {
			//~ console.log(eid(e)," tiene una particion completa",e);
			return true;
		}
	} else { // TODO: verificar que no queden nodos sin marcar cuando en el mismo nivel no hay bloques
		var cb = cuantos_blocks(e);
		if (cb==0) {
			mark_element_as_block(e);
		}
	}
	for (var i=0;i<e.children.length;i++) {
		var child = e.children[i];
		if (child) {
			if (valid(child)) {
					verify_coverture(child);
			}
		}
	}
	//~ e.setAttribute("visited","true");
}

function setCustomCSS() {
	//~ jQuery("head").append("<style>article[block],header[block],footer[block],nav[block],section[block],aside[block] {border:2px solid red;}</style>");
}
function wordCount(s) {
	return s.replace( /[^\w ]/g, "" ).split( /\s+/ ).length
}
function buildBlockList() {
	mig45data["wordcount"] = wordCount($('body').text());
	mig45data["doc_w"] = jQuery(document).width();
	mig45data["doc_h"] = jQuery(document).height();
	mig45data["blocks"] = [];
	$("body").find("[mblock]").each(function (index,e) {
		var b = {}
		b["bid"] = e.getAttribute("mblock")
		b["x"] = jQuery(e).offset().left;
		b["y"] = jQuery(e).offset().top;
		b["w"] = b["x"]+jQuery(e).width();
		b["h"] = b["y"]+jQuery(e).height();
		b["ecount"] = jQuery(e).contents().find("*").length;
		b["tcount"] = wordCount(jQuery(e).text());
		mig45data["blocks"].push(b);
	});
	console.log(mig45data);
}

jQuery(window).ready(function(){
	//~ if (!prompt("¿Comenzar?")) return;
	jQuery.getJSON('http://bom.ciens.ucv.ve/repo/get_json.php?segid=<?php echo $_REQUEST["segid"]?>', function(data) {
		jQuery("body").css({"margin":"0 auto"});
		for (var i=0;i<data["blocks"].length;i++) {
			var b = data["blocks"][i];
			if (b["bid"]) {
				var num = parseInt(b["bid"].match(/\d/g))
				//~ console.log(maxid,num,b["bid"]);
				if (maxid<num) {
					maxid=num;
				}
				if (!prefix) {
					prefix = b["bid"].replace(/[0-9]/g, '').toUpperCase();
				}
				var x = parseInt(b["x"]*document.body.clientWidth/data["width"]);
				var w = parseInt(b["w"]*document.body.clientWidth/data["width"]);
				var y = parseInt(b["y"]*document.body.clientHeight/data["height"]);
				var h = parseInt(b["h"]*document.body.clientHeight/data["height"]);
				var px = x+10;//parseInt((x+w)/2);
				var py = y+10;//parseInt((y+h)/2);
				var es = getElsAt(b);
				
				//~ jQuery("body").append("<span id='label"+b["bid"]+"' style='background-color:black;color:white;position:absolute;top:0;left:0;'>"+b["bid"]+"</span>")
				//~ label=jQuery("#label"+b["bid"]);
				//~ label.css({left:px,top:py,width:20, height:20}) 
				//~ jQuery("body").append("<div id='block"+b["bid"]+"' style='background-color:red;opacity: 0.5;filter: alpha(opacity=50);color:white;position:absolute;top:0;left:0;border:\"4px solid red\"'>"+b["bid"]+" ("+x+","+y+","+w+","+h+")</div>")
				//~ rect=jQuery("#block"+b["bid"]);
				//~ rect.css({left:x,top:y,width:w-x, height:h-y}) 
				
				if (es.length>0) {
					//~ console.log("block ",b["bid"], " has ",es.length," candidates");
					var reg = verify_elements(es,b);
					var e = reg["element"]
					//~ console.log("block ",b["bid"], " candidate selected ("+(reg["avg"]*100).toFixed(2)+"%):",e);
					mark_element_as_block(e,b);
				} else {
					//~ console.log("block ",b["bid"], " has no candidate");
				}
			} else {
				//~ console.log("skiped",b);
			}
		}
		//~ console.log("prefix=",prefix,"maxid=",maxid);
		verify_coverture(document.body);
		$.each(jQuery("body").find("[block]"), function(index,e) {
			if (e.getAttribute("block")=="gen") {
				//~ e.style = "border:4px solid magenta";
			} else {
				//~ e.style = "border:4px solid blue";
			}
		});
		//~ console.log("start labelling");
		n=traverse(document.body);
		//~ console.log(n+" labels")
		setCustomCSS();
		buildBlockList();
		jQuery("body").append("<done><!-- js processing done: "+n+" labels added--></done>");
		console.log("finished");
	});
});
