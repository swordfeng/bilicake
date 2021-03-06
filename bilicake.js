// ==UserScript==
// @name        bilicake
// @namespace   bilicake
// @description	black technology
// @include     *bilibili.com*
// @version     0.04
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @require     http://swordfeng.github.io/ABP/js/CommentCoreLibrary.min.js
// @require     http://swordfeng.github.io/ABP/js/md5.js
// @require     http://swordfeng.github.io/ABP/js/ABPMobile.js
// @require     http://swordfeng.github.io/ABP/js/ABPLibxml.js
// @require     http://swordfeng.github.io/ABP/js/ABPlayer.js?id=3
// ==/UserScript==

// require     http://swordfeng.github.io/ABP/js/ABPRestyle.js



var cakecss = document.createElement('link');
cakecss.setAttribute("rel","stylesheet");
cakecss.setAttribute("type","text/css");
cakecss.setAttribute("href","http://swordfeng.github.io/ABP/css/base.css");
document.getElementsByTagName("head")[0].appendChild(cakecss);

cakecss = document.createElement('style');
cakecss.setAttribute("type","text/css");
cakecss.innerHTML = ".ABP-NoScroll #index-nav { display:none!important; }\n.ABP-NoScroll .z-top { display:none!important; }";
document.getElementsByTagName("head")[0].appendChild(cakecss);


var appkey = "c1b107428d337928";
var secretkey = "ea85624dfcf12d7cc7b2b3a94fac1f2c";

var url = document.location.href;
var aid_reg = /\/av(\d+)\/(?:index_(\d+)\.html)?/ig;
var aid_array = aid_reg.exec(url);

var aid = aid_array === null ? '' : aid_array[1]; //aid
var page = aid_array === null ? '1' : typeof(aid_array[2]) == 'undefined' ? '1' : aid_array[2]; //分p
var cid = "";

function sign_req(str) {
	return str+"&sign="+hex_md5(str+secretkey);
}

// get cid from aid&page from bili_fix_player
/*
function api_get_cid(aid, page) {
	console.log("api_get_cid("+aid+", "+page+")");
	var p = page - 1;
	var url = 'http://api.bilibili.com/view?'+sign_req('appkey='+appkey+'&id='+aid+'&page='+p+'&type=json'); //很大几率没有vid
	console.log(url);
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		synchronous: false,
		onload: function(responseDetails) {
			if (responseDetails.status == 200) {
				var Content = eval('(' + responseDetails.responseText + ')');
				var cid = Content.cid;
				var type = Content.from;
				if ("undefined" != typeof(Content.vid)) var vid = Content.vid;
				console.log("aid: "+aid+" cid: "+cid+" type: "+type+" vid: "+vid);
				var cid_xml_url = 'http://comment.bilibili.com/' + cid + '.xml';
				var req_url = api_get_url(aid, cid); 
			}
		}
	});
}
*/
var pid=1;

function api_get_cid(aid, page) {
	console.log("api_get_cid("+aid+", "+page+")");
	var url = 'http://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&batch=1&id=' + aid;
	console.log(url);
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		synchronous: false,
		onload: function(responseDetails) {
			if (responseDetails.status == 200) {
				var Content = eval('(' + responseDetails.responseText + ')');
				var list = Content.list;
				pid = page;
				var lp = null;
				//
				if (document.getElementById("bofqi").innerHTML.match(/Copyright/)) --pid;
				for (var i=0;i<list.length;++i)
					if (list[i].page == pid) lp = list[i];
				if (lp === null) lp = list[0]; //针对某些aid只有一个cid但是有分P的情况
				cid = lp.cid;
				var type = lp.type;
				var vid = lp.vid;
				console.log("aid: "+aid+" pid: "+pid+" cid: "+cid+" type: "+type+" vid: "+vid);
				console.log("http://interface.bilibili.com/playurl?"+sign_req("appkey="+appkey+"&cid="+cid+"&type=mp4&quality="+4));
				if (type == "vupload" || type == "qq") api_get_url(cid); 
			}
		}
	});
}



function api_get_url(cid, quality) {
	if (typeof quality == "undefined") var quality = 4;
	var req_url = "http://interface.bilibili.com/playurl?"+sign_req("appkey="+appkey+"&cid="+cid+"&type=mp4&quality="+quality);
	console.log(req_url);
	GM_xmlhttpRequest({
		method: 'GET',
		url: req_url,
		synchronous: false,
		onload: function(responseDetails) {
			if (responseDetails.status == 200) {
				try {
					var xmldoc = loadXML(responseDetails.responseText);
				} catch (e) {
					return;
				}
				var durls = xmldoc.getElementsByTagName("durl");
				console.log(durls);
				var playlist = [];
				for (var i=0;i<durls.length;i++) {
					playlist.push({"sources":{
						"video/mp4":(durls[i].getElementsByTagName("url").length <= 1)
						?durls[i].getElementsByTagName("url")[0].firstChild.nodeValue
						:durls[i].getElementsByTagName("url")[1].firstChild.nodeValue
					}});
				}
				console.log(playlist);
				var inst = ABP.create(document.getElementById("bofqi"), {
					"src":{
						"playlist":playlist,
						"danmaku":'http://comment.bilibili.com/' + cid + '.xml',
					},
					"width":1160,
					"height":640
				});
				//
				window.inst = inst;
				var sddm = function(dm) {
					dm.stime += 500;
					var t = parseFloat(dm.stime/1000).toFixed(3);
					var d = new Date(dm.date*1000);
					var pad0 = function(num, n) {  
						var len = num.toString().length;  
						while(len < n) {  
							num = "0" + num;  
							len++;  
						}  
						return num;  
					};
					console.log(d);
					var dtstr = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+pad0(d.getMinutes(),2)+":"+pad0(d.getSeconds(),2);
					console.log(dtstr);
					var str = "date="+encodeURIComponent(dtstr)+"&fontsize="+dm.size+"&message="+encodeURIComponent(dm.text)+"&rnd="+parseInt(1000000000*Math.random())+"&mode="+dm.mode+"&cid="+cid+"&pool=0&playTime="+encodeURIComponent(""+t)+"&color="+dm.color;
					console.log(str);
					GM_xmlhttpRequest({
						method: 'POST',
						url: "http://interface.bilibili.com/dmpost?cid="+cid+"&aid="+aid+"&pid="+pid,
						headers: {
							"Referer": "http://static.hdslb.com/play.swf",
							"Content-Type": "application/x-www-form-urlencoded"
						},
						data: str,
						synchronous: false,
						onload: function(responseDetails) {
							if (responseDetails.status == 200) {
								console.log(responseDetails.responseText);
							}
						}
					});
				};
				inst.addListener("senddanmaku",function(dm){
					if (inst.playing) {
						inst.dmsend(dm);
						setTimeout(function(){sddm(dm);}, 1000);
					} else {
						inst.dmsend(dm);
						sddm(dm);
					}
				});
			}
		}
	});
}

//xml解析
var loadXML = function(xmlString){
	var xmlDoc=null;
	//判断浏览器的类型
	//支持IE浏览器 
	if(!window.DOMParser && window.ActiveXObject){   //window.DOMParser 判断是否是非ie浏览器
		var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
		for(var i=0;i<xmlDomVersions.length;i++){
			try{
				xmlDoc = new ActiveXObject(xmlDomVersions[i]);
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
				break;
			}catch(e){
			}
		}
	}
	//支持Mozilla浏览器
	else if(window.DOMParser && document.implementation && document.implementation.createDocument){
		try{
			/* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
			 * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
			 * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
			 * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
			 */
			domParser = new  DOMParser();
			xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
		}catch(e){
		}
	}
	else{
		return null;
	}

	return xmlDoc;
}

//播放器的html
if (aid !== '' ) api_get_cid(aid, page); //按照aid和分p获取cid并且替换播放器
