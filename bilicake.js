// ==UserScript==
// @name        bilicake
// @namespace   bilicake
// @desription	black tehnology
// @include     *bilibili.com*
// @version     0.01
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @require     http://swordfeng.github.io/ABP/js/CommentCoreLibrary.min.js
// @require     http://swordfeng.github.io/ABP/js/md5.js
// @require     http://swordfeng.github.io/ABP/js/ABPRestyle.js
// @require     http://swordfeng.github.io/ABP/js/ABPMobile.js
// @require     http://swordfeng.github.io/ABP/js/ABPLibxml.js
// ==/UserScript==




var cakecss = document.createElement('link');
cakecss.setAttribute("rel","stylesheet");
cakecss.setAttribute("type","text/css");
cakecss.setAttribute("href","http://swordfeng.github.io/ABP/css/base.css");
document.getElementsByTagName("head")[0].appendChild(cakecss);

try {
	document.getElementsByClassName("z")[0].style["z-index"]="10020";
} catch (e) {}

var ABP = {
	"version":"0.8.0.1-sMod_bili"
};

(function(){
	"use strict";
	if(!ABP) return;
	//var $ = function (e) { return document.getElementById(e); };
	var _ = function (type, props, children, callback) {
		var elem = null;
		if (type === "text") {
			return document.createTextNode(props);
		} else {
			elem = document.createElement(type);
		}
		for(var n in props){
			if(n === "style"){
				for(var x in props.style){
					elem.style[x] = props.style[x];
				}
			}else if(n === "className"){
				elem.className = props[n];
			}else if (n === "html") {
				elem.innerHTML = props[n];
			} else if (n === "tooltip") {
				elem.tooltip = props[n];
				addClass( elem.tooltip, "ABP-Tooltip");
				elem.addEventListener("mouseover", function(e){
					document.body.appendChild(elem.tooltip);
					var pr=document.documentElement.getBoundingClientRect();
					var er=elem.getBoundingClientRect();
					var tr=elem.tooltip.getBoundingClientRect();
					if (er.bottom+5+tr.height<document.documentElement.clientHeight) {
						elem.tooltip.style.left=(er.left-pr.left+er.width/2-tr.width/2)+"px";
						elem.tooltip.style.top=(er.bottom-pr.top+2)+"px";
					} else {
						elem.tooltip.style.left=(er.left-pr.left+er.width+2)+"px";
						elem.tooltip.style.top=(er.top-pr.top+er.height/2-tr.height/2)+"px";
					}
					var tr=elem.tooltip.getBoundingClientRect();
					if (tr.right>document.documentElement.clientWidth) {
						elem.tooltip.style.left=(er.left-pr.left-tr.width-2)+"px";
					} else if (tr.left<0) {
						elem.tooltip.style.left=(er.left-pr.left+er.width+2)+"px";
					}
					if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
				});
				elem.addEventListener("mousemove", function(e){
					if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
				});
				elem.addEventListener("mouseout", function(){
					document.body.removeChild(elem.tooltip);
				});
			} else if (n === "updatetooltip") {
				elem.updatetooltip = props[n];
			}else {
				elem.setAttribute(n, props[n]);
			}
		}
		if (children) {
			for(var i = 0; i < children.length; i++){
				if(children[i] != null)
					elem.appendChild(children[i]);
			}
		}
		if (callback && typeof callback === "function") {
			callback(elem);
		}
		return elem;
	};
	var addClass = function(elem, className){
		if(elem == null) return;
		var oldClass = elem.className.split(" ");
		if(oldClass.indexOf(className) < 0){
			oldClass.push(className);
		}
		elem.className = oldClass.join(" ");
	};
	var hasClass = function(elem, className){
		if(elem == null) return false;
		var oldClass = elem.className.split(" ");
		return oldClass.indexOf(className) >= 0;
	};
	var removeClass = function(elem, className){
		if(elem == null) return;
		var oldClass = elem.className.split(" ");
		if(oldClass.indexOf(className) >= 0){
			oldClass.splice(oldClass.indexOf(className),1);
		}
		elem.className = oldClass.join(" ");
	};
	var buildFromDefaults = function (n, d){
		var r = {};
		for(var i in d){
			if(n && typeof n[i] !== "undefined")
				r[i] = n[i];
			else
				r[i] = d[i];
		}
		return r;
	}
	var makeEvent= function(eventname) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(eventname, false, false);
		return evt;
	};
	var makebar = function(elem, updatetooltip) {
		var  mainbar = _("div", {
			"className": "dark"
		});
		var secondarybar = _("div", {
			"className": "load"
		});
		var _bar;
		if (typeof updatetooltip !== "undefined") {
			_bar = _("div", {
				"className": "bar",
				"tooltip":_("div",{}),
				"updatetooltip":updatetooltip,
			},[secondarybar,mainbar ]);
		} else {
			_bar = _("div", {
				"className": "bar"
			},[secondarybar,mainbar ]);
		}
		elem.appendChild(_bar);
		elem.bar = _bar;
		var _main,_secondary;
		elem.progress = {
			get main() {
				return _main;
			},
			set main(x) {
				if (typeof x !== "number" || x<0 || x>100) return;
				_main = x;
				mainbar.style.width = x + "%";
			},
			get secondary() {
				return _secondary;
			},
			set secondary(x) {
				if (typeof x !== "number" || x<0 || x>100) return;
				_secondary = x;
				secondarybar.style.width = x + "%";
			},
		};
		elem.progress.main = 0;
		elem.progress.secondary = 0;
		var dragging = false;
		var dragrate;
		_bar.addEventListener("mousedown", function(e){
			dragging = true;
			var pos = e.clientX-this.getBoundingClientRect().left;
			if (pos>=0 && pos<=this.offsetWidth) dragrate=pos*100/this.offsetWidth;
			elem.progress.main = dragrate;
			elem.dispatchEvent(new Event("startdrag"));
		});
		document.addEventListener("mouseup", function(e){
			if (dragging) {
				dragging = false;
				elem.dispatchEvent(new Event("stopdrag"));
			}
		});
		_bar.addEventListener("mouseup", function(e){
			dragging=false;
			var pos = e.clientX-this.getBoundingClientRect().left;
			if (pos>=0 && pos<=this.offsetWidth) dragrate=pos*100/this.offsetWidth;
			elem.progress.main = dragrate;
			elem.dispatchEvent(new Event("stopdrag"));
		});
		_bar.addEventListener("mousemove", function(e){
			if(dragging) {
				var pos = e.clientX-this.getBoundingClientRect().left;
				if (pos>=0 && pos<=this.offsetWidth) {
					dragrate=pos*100/this.offsetWidth;
					elem.progress.main = dragrate;
					elem.dispatchEvent(makeEvent("ondrag"));
				}
			}
		});
		return elem;
	};

	
	var convTime = function(t) {
		var sec=parseInt(t);
		var min=parseInt(sec/60);
		sec%=60;
		return min+":"+(sec<10?"0":"")+sec;
	}

	var pad0 = function(num, n) {  
		var len = num.toString().length;  
		while(len < n) {  
			num = "0" + num;  
			len++;  
		}  
		return num;  
	} 

	ABP.create = function (element, params) {
		var elem = element;
		if(!params){
			params = {};
		}
		params = buildFromDefaults(params,{
			"replaceMode":true,
			"width":1280,
			"height":640,
			"src":"",
			"mobile":false
		});
		if (typeof element === "string") {
			elem = document.getElementById(element);
		}
		if(elem.children.length > 0 && params.replaceMode){
			elem.innerHTML = "";
		}
		// 'elem' is the parent container in which we create the player.
		var container;
		if(!hasClass(elem, "ABP-Unit")){
			container = _("div", {
				"className": "ABP-Unit",
				"style":{
					"width": params.width + "px",
					"height": params.height + "px"
				}
			});
			elem.appendChild(container);
		}else{
			container = elem;
		}
		var playlist = [];
		if(typeof params.src === "string"){
			params.src = _("video",{
				"className":"ABP-VideoItem",
				"preload":"meatdata",
			},[
				_("source",{
					"src":params.src
				})
			]);
			playlist.push(params.src);
		}else if(params.src.hasOwnProperty("playlist")){
			var data = params.src;
			var plist = data.playlist;
			for(var id = 0; id < plist.length; id++){
				if(plist[id].hasOwnProperty("sources")){
					var sources = [];
					for(var mime in plist[id]["sources"]){
						sources.push(_("source", {
							"src":plist[id]["sources"][mime],
							"type":mime
						}));
					}
					playlist.push(_("video",{
						"className":id==0?"ABP-VideoItem":"ABP-VideoItem ABP-VideoItemHidden",
						"preload":"metadata",
					},sources));
				}else if(plist[id].hasOwnProperty("video")){
					playlist.push(plist[id]["video"]);
				}else{
					console.log("No recognized format");
				}
			}
		}else{
			playlist.push(params.src);
		}
		var _video=[];
		for (var i=0;i<playlist.length;i++) _video.push(playlist[i]);
		_video.push(_("div", {
			"className":"ABP-Container"
		}));
		container.appendChild(_("div",{
			"className":"ABP-Player"
		},[
			_("div",{
				"className" : "ABP-Video",
				"tabindex" : "10"	
			}, 
			_video),
			_("div", {
				"className":"ABP-Toolbar",
			}, [
				_("div", {
					"className":"ABP-Text",
				},[
					_("div", {
						"className" : "button ABP-CommentFont",
						"tooltip":_("div",{
							"html":"弹幕大小与弹幕模式",
						}),
					}),
					_("div", {
						"className" : "button ABP-CommentColor",
						"tooltip":_("div",{
							"html":"弹幕颜色",
						}),
					}),
					_("div", {
						"className" : "button right ABP-CommentSend",
						"tooltip":_("div",{
							"html":"毁灭地喷射白光！da！",
						}),
						"html":"发送 >",
					}),
					_("div", {
						"className": "ABP-TextBox autofill",
					},[
						_("input", {
							"type":"text"
						}),
					]),
				]),
				_("div", {
					"className":"ABP-Control"
				},[
					_("div", {
						"className": "button ABP-Play",
						"tooltip":_("div",{
							"html":"播放/暂停",
						}),
					}),
					_("div", {
						"className": "button right ABP-FullScreen",
						"tooltip":_("div",{
							"html":"全屏播放",
						}),
					}),
					_("div", {
						"className": "button right ABP-FullWindow",
						"tooltip":_("div",{
							"html":"网页全屏",
						}),
					}),
					_("div", {
						"className": "button right ABP-WideScreen",
						"tooltip":_("div",{
							"html":"宽屏",
						}),
					}),
					_("div", {
						"className": "button right ABP-Loop",
						"tooltip":_("div",{
							"html":"洗脑循环",
						}),
					}),
					_("div", {
						"className": "button right ABP-CommentShow",
						"tooltip":_("div",{
							"html":"弹幕开关",
						}),
					}),
					_("div",{
						"className":"ABP-Opacity",
					},[
						_("div",{
							"html":"透明度",
						}),
						_("div",{
							"className":"opacity-bar",
						}),
					]),
					_("div", {
						"className": "volume-bar right",
						"tooltip":_("div",{
							"html":"音量调节",
						}),
					}),
					_("div", {
						"className": "button right ABP-VolumeButton",
						"tooltip":_("div",{
							"html":"静音",
						}),
					}),
					_("div", {
						"className": "right ABP-TimeLabel",
					}),
					_("div", {
						"className": "progress-bar autofill",
					}),
				]),
			]),
			_("div", {
				"className": "box ABP-CommentFont-Box"
			}),
			_("div", {
				"className": "box ABP-CommentColor-Box"
			})
		]));
		container.appendChild(_("div",{
			"className":"ABP-CommentList ABP-SideBlock"
		},[
			_("div",{
				"className":"ABP-CommentList-Title"
			},[
				_("div", {
					"className":"time",
					"html":"时间"
				}),
				_("div", {
					"className":"content",
					"html":"评论"
				}),
				_("div", {
					"className":"date",
					"html":"发送日期",
				})
			]),
			_("div",{
				"className":"ABP-CommentList-Container"
			})
		]));
		container.appendChild(_("div",{
			"className":"ABP-InfoBox ABP-SideBlock"
		},[
			//todo
		]));
		container.appendChild(_("div",{
			"className":"ABP-Settings ABP-SideBlock"
		},[
			//todo
		]));
		var bind = ABP.bind(container, params.mobile);
		if (typeof ABP_Restyle !== "undefined") ABP_Restyle();
		if (params.src.hasOwnProperty("danmaku")) {
			CommentLoader(params.src.danmaku, bind.cmManager, function(){
				var pCommentList = container.getElementsByClassName("ABP-CommentList-Container")[0];
				for (var i=0;i<bind.cmManager.timeline.length;i++) {
					var d = new Date(bind.cmManager.timeline[i].date*1000);
					var node = _("div",{
						"className":"ABP-CommentList-Item",
					},[
						_("div", {
							"className":"time",
							"html":convTime(parseInt(bind.cmManager.timeline[i].stime/1000)),
						}),
						_("div", {
							"className":"content",
							"html":bind.cmManager.timeline[i].text,
							"tooltip":_("div",{
								"html":bind.cmManager.timeline[i].text,
							}),
						}),
						_("div", {
							"className":"date",
							"html":d.getMonth()+"-"+d.getDate()+" "+d.getHours()+":"+pad0(d.getMinutes(),2),
							"tooltip":_("div",{
								"html":d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours()+":"+pad0(d.getMinutes(),2)+":"+pad0(d.getSeconds(),2),
							}),
						})
					]);
					pCommentList.appendChild(node);
				}
			});
		}
		return bind;
	}

	ABP.bind = function (playerUnit, mobile, state) {
		// private values
		var currentTime=0;
		var dragging = false;
		var waitting = false;
		var eventListeners = [];
		var mutevol = 100;
		// public instance
		var ABPInst = {
			btnPlay:null,
			divComment:null,
			btnFullScr:null,
			btnFullWin:null,
			btnWide:null,
			btnDm:null,
			btnLoop:null,
			videos:null,
			timeLabel:null,
			divTextField:null,
			txtText:null,
			cmManager:null,
			currentItem:0,
			duration:0,
			buffered:0,
			defaults:{
				w:0,
				h:0
			},
			state:buildFromDefaults(state, {
				widescreen: false,
				fullwindow: false,
				fullscreen: false,
				allowRescale: false,
				autosize: false,
				loop:false,
				danmaku:true,
				mute:false,
			}),
			createPopup:null,
			removePopup:null,
			swapVideo: null,
			resetLayout:null,
			wideScreen:null,
			fullWindow:null,
			ready:false,
			play:null,
			pause:null,
			playing:false,
			get currentTime() {
				return currentTime;
			},
			set currentTime(x) {
				seekto(x);
			},
			addListener:null,
			dispatch:null
		};



		// private functions
		function changeItem(item) {
			removeClass(ABPInst.videos[item],"ABP-VideoItemHidden");
			for (var i=0;i<ABPInst.videos.length;i++) {
				if (i!=item) {
					addClass(ABPInst.videos[i],"ABP-VideoItemHidden");
				}
			}
			ABPInst.currentItem=item; 
		}
		function seekto(pos) {
			ABPInst.videos[ABPInst.currentItem].pause();
			var item = 0;
			while ( item<ABPInst.videos.length && pos > ABPInst.videos[item].duration ) {
				pos -= ABPInst.videos[item].duration;
				item++;
			}
			if (item>=ABPInst.videos.length ) return;
			ABPInst.videos[item].currentTime=pos;
			changeItem(item);
			//currentTime=pos;
			if (ABPInst.cmManager) {
				ABPInst.cmManager.time(parseInt(pos*1000));
				ABPInst.cmManager.clear();
			}
			if (ABPInst.playing) {
				if (ABPInst.cmManager && ABPInst.state.danmaku)
					ABPInst.cmManager.startTimer();
				ABPInst.videos[ABPInst.currentItem].play();
			}
		}
		var time2rate = function(t) {
			return t*100/ABPInst.duration;
		}

		// event mechanics
		ABPInst.addListener = function(type, listener) {
			if (typeof type !== "string") {
				console.err(type+" is not a event name");
				return;
			}
			if (typeof listener !== "function") {
				console.err(listener+" is not a listener");
				return;
			}
			eventListeners.push({"type":type,"listener":listener});
		};
		ABPInst.dispatch = function(type, msg) {
			for (var i=0;i<eventListeners.length;i++) {
				if (eventListeners[i].type === type) {
					if (typeof msg !== "undefined") eventListeners[i].listener(msg);
					else eventListeners[i].listener();
				}
			}
		};

		// layout settings
		ABPInst.resetLayout = function(){
			var e;
			ABPInst.state.widescreen=false;
			ABPInst.state.fullwindow=false;
			ABPInst.state.fullscreen=false;
			// if fullscreen
			if(window.outerHeight==screen.height && window.outerWidth==screen.width){
				var el = document;
				var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || 
					el.mozCancelFullScreen || el.exitFullScreen;
				if(typeof cfs != "undefined" && cfs) {
					cfs.call(el);
				} else if(typeof window.ActiveXObject != "undefined") {
					//for IE
					var wscript = new ActiveXObject("WScript.Shell");
					if(wscript != null) {
						wscript.SendKeys("{F11}");
					}
				}
			}
			removeClass(playerUnit,"ABP-Wide");
			removeClass(playerUnit,"ABP-Full");
			removeClass(playerUnit,"ABP-Screen");
			removeClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};
		ABPInst.wideScreen = function(){
			ABPInst.resetLayout();
			addClass(playerUnit, "ABP-Wide");
			ABPInst.state.widescreen=true;
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};
		ABPInst.fullWindow = function(){
			ABPInst.resetLayout();
			addClass(playerUnit, "ABP-Full");
			addClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
			ABPInst.state.fullwindow=true;
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};
		ABPInst.fullScreen = function(){
			ABPInst.fullWindow();
			var el = document.documentElement;
			var rfs = el.requestFullScreen || el.webkitRequestFullScreen || 
				el.mozRequestFullScreen || el.msRequestFullScreen;
			if(typeof rfs != "undefined" && rfs) {
				rfs.call(el);
			} else if(typeof window.ActiveXObject != "undefined") {
				//for IE
				var wscript = new ActiveXObject("WScript.Shell");
				if(wscript != null) {
					wscript.SendKeys("{F11}");
				}
			}
			addClass(playerUnit, "ABP-Screen");
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
			setTimeout(function(){ABPInst.state.fullscreen=true;},100);
		};

		// player controls
		ABPInst.play = function() {
			if (ABPInst.playing) return;
			ABPInst.videos[ABPInst.currentItem].play();
			if (ABPInst.cmManager && ABPInst.state.danmaku) ABPInst.cmManager.startTimer();
			ABPInst.playing = true;
			ABPInst.dispatch("play");
		};
		ABPInst.pause = function() {
			if (!ABPInst.playing) return;
			ABPInst.videos[ABPInst.currentItem].pause();
			if (ABPInst.cmManager) ABPInst.cmManager.stop();
			ABPInst.playing = false;
			ABPInst.dispatch("pause");
		};
		ABPInst.setLoop = function(x) {
			if(x){
				ABPInst.state.loop=true;
				addClass(ABPInst.btnLoop,"ABP-LoopOn");
			}else{
				ABPInst.state.loop=false;
				removeClass(ABPInst.btnLoop,"ABP-LoopOn");
			}
		};
		ABPInst.setDanmaku = function(x) {
			if (x) {
				ABPInst.cmManager.time(parseInt(ABPInst.currentTime*1000));
				ABPInst.cmManager.clear();
				ABPInst.cmManager.startTimer();
				removeClass(ABPInst.btnDm, "ABP-DanmakuOff");
			} else {
				ABPInst.cmManager.stopTimer();
				ABPInst.cmManager.clear();
				addClass(ABPInst.btnDm, "ABP-DanmakuOff");
			}
			ABPInst.state.danmaku = x;
		};

		ABPInst.mute = function(x) {
			if (x == ABPInst.state.mute) return;
			ABPInst.state.mute = x;
			if (x) {
				mutevol = ABPInst.barVolume.progress.main;
				ABPInst.barVolume.progress.main = 0;
				addClass(ABPInst.btnVolume, "muted");
			} else {
				ABPInst.barVolume.progress.main = mutevol;
				removeClass(ABPInst.btnVolume, "muted");
			}
		};


		ABPInst.addListener("play",function(){
			addClass(ABPInst.btnPlay,"ABP-Playing");
		});
		ABPInst.addListener("pause",function(){
			removeClass(ABPInst.btnPlay,"ABP-Playing");
		});
		ABPInst.addListener("stop",function(){
			removeClass(ABPInst.btnPlay,"ABP-Playing");
		});



		/* start binding */
		ABPInst.videos = playerUnit.getElementsByClassName("ABP-VideoItem");
		ABPInst.btnPlay = playerUnit.getElementsByClassName("ABP-Play")[0];
		ABPInst.barProgress = makebar(playerUnit.getElementsByClassName("progress-bar")[0],null);
		ABPInst.btnFullWin = playerUnit.getElementsByClassName("ABP-FullWindow")[0];
		ABPInst.btnFullScr = playerUnit.getElementsByClassName("ABP-FullScreen")[0];
		ABPInst.btnWide = playerUnit.getElementsByClassName("ABP-WideScreen")[0];
		ABPInst.btnLoop = playerUnit.getElementsByClassName("ABP-Loop")[0];
		ABPInst.btnVolume = playerUnit.getElementsByClassName("ABP-VolumeButton")[0];
		ABPInst.barVolume = makebar(playerUnit.getElementsByClassName("volume-bar")[0]);
		ABPInst.barOpacity = makebar(playerUnit.getElementsByClassName("opacity-bar")[0],null);
		ABPInst.divTextField = playerUnit.getElementsByClassName("ABP-Text")[0];
		ABPInst.txtText = ABPInst.divTextField.getElementsByTagName("input")[0];
		ABPInst.btnDm = playerUnit.getElementsByClassName("ABP-CommentShow")[0];
		ABPInst.divComment = playerUnit.getElementsByClassName("ABP-Container")[0];
		ABPInst.timeLabel = playerUnit.getElementsByClassName("ABP-TimeLabel")[0];
		
		ABPInst.defaults.w = ABPInst.divComment.offsetWidth; 
		ABPInst.defaults.h = ABPInst.divComment.offsetHeight;
		
		// bind danmaku
		if(typeof CommentManager !== "undefined"){
			ABPInst.cmManager = new CommentManager(ABPInst.divComment);
			ABPInst.cmManager.init();
			ABPInst.cmManager.clear();
		}



		ABPInst.timeLabel.setTime = function(t) {
			this.innerHTML = convTime(t)+"/"+convTime(ABPInst.duration);
		}



			/* set events */

			// fullscreen monitor
			window.addEventListener("resize", function(){
				if (ABPInst.state.fullscreen && !(window.outerHeight==screen.height && window.outerWidth==screen.width))
					ABPInst.resetLayout();
			});
			//video events
			for (var i=0;i<ABPInst.videos.length;i++) {
				var v=ABPInst.videos[i];
				var readyNum = 0;
				v.itemNo=i;
				v.buffComplete=false;
				v.addEventListener("loadedmetadata",function(){
					ABPInst.duration += ABPInst.videos[this.itemNo].duration;
					readyNum++;
					if (readyNum == ABPInst.videos.length) {
						ABPInst.ready=true;
						console.log("ABP duration "+ABPInst.duration);
						ABPInst.timeLabel.setTime(0);
						ABPInst.dispatch("ready");
					}
					ABPInst.videos[0].dispatchEvent(makeEvent("progress"));
				});
				v.addEventListener("progress", function(){
					console.log("on progress");
					var buff;
					try{
						buff = this.buffered.end(0);
					} catch(e) {
						return;
					}
					var firsttime = !this.buffComplete;
					if (this.duration-this.buffered.end(0)<0.05) {
						this.buffComplete=true;
					} else this.buffComplete=false;
					for (var ii=0;ii<this.itemNo;ii++) {
						if(!ABPInst.videos[ii].buffComplete) return;
						buff+=ABPInst.videos[ii].duration;
					}
					if (firsttime && this.buffComplete) { // now it's the first time
						var ii=this.itemNo+1;
						while (ii<ABPInst.videos.length&&ABPInst.videos[ii].buffComplete) {
							ABPInst.buffered += ABPInst.videos[ii].duration;
							ii++;
						}
						if(ii<ABPInst.videos.length) {
							ABPInst.videos[ii].play();
							ABPInst.videos[ii].pause();
						} else {
							ABPInst.dispatch("buffered");
						}
					} else return;
					ABPInst.buffered=buff;
					ABPInst.barProgress.progress.secondary=time2rate(buff);
					ABPInst.dispatch("progress");
				});
				v.addEventListener("timeupdate", function() {
					if (this.itemNo != ABPInst.currentItem) return;
					if (waitting && ABPInst.cmManager) ABPInst.cmManager.startTimer();
					waitting = false;
					var nowtime=this.currentTime;
					for (var ii=0;ii<this.itemNo;ii++) nowtime+=ABPInst.videos[ii].duration;
					currentTime=nowtime;
					if (!dragging) {
						ABPInst.timeLabel.setTime(nowtime);
						ABPInst.barProgress.progress.main=time2rate(nowtime);
					}
					ABPInst.cmManager.time(parseInt(nowtime*1000));
				});
				v.addEventListener("waitting", function(){
					if (this.itemNo == ABPInst.currentItem) {
						if ((!waitting) && ABPInst.cmManager)  ABPInst.cmManager.stopTimer();
						waitting = true;
					}
				});
				v.addEventListener("ended", function() {
					if (this.itemNo != ABPInst.currentItem) return;
					if (this.itemNo<ABPInst.videos.length-1) {
						changeItem(this.itemNo+1);
						ABPInst.videos[this.itemNo+1].currentTime=0;
						ABPInst.videos[this.itemNo+1].play();
					} else {
						if (ABPInst.state.loop) {
							seekto(0);
						} else {
							ABPInst.playing=false;
							ABPInst.dispatch("stop");
						}
					}
				});
			}
			//buttons
			ABPInst.btnFullScr.addEventListener("click", function(){
				if(!ABPInst.state.fullscreen){
					ABPInst.fullScreen();
				}else{
					ABPInst.resetLayout();
				}
			});
			ABPInst.btnFullWin.addEventListener("click", function(){
				if((!ABPInst.state.fullwindow)||ABPInst.state.fullscreen) {
					ABPInst.fullWindow();;
				} else {
					ABPInst.resetLayout();
				}
			});
			ABPInst.btnWide.addEventListener("click",function(){
				if(!ABPInst.state.widescreen)
					ABPInst.wideScreen();
				else
					ABPInst.resetLayout();
			});
			ABPInst.btnDm.addEventListener("click", function(){
				ABPInst.setDanmaku(!ABPInst.state.danmaku);
			});
			ABPInst.btnLoop.addEventListener("click", function(){
				ABPInst.setLoop(!ABPInst.state.loop);
			});
			ABPInst.btnPlay.addEventListener("click", function(){
				if(!ABPInst.playing){
					ABPInst.play();
				}else{
					ABPInst.pause();
				}
			});
			//progress bar
			ABPInst.barProgress.addEventListener("stopdrag", function(){
				seekto(this.progress.main / 100 * ABPInst.duration);
			});
			ABPInst.barProgress.addEventListener("ondrag", function(){
				ABPInst.timeLabel.setTime(this.progress.main/100*ABPInst.duration);
			});
			ABPInst.barProgress.bar.updatetooltip = function(e) {
				var pos = e.clientX-this.getBoundingClientRect().left;
				if (pos>=0 && pos<=this.offsetWidth) {
					this.tooltip.innerHTML = convTime(pos*ABPInst.duration/this.offsetWidth);
				}
				var pr = document.body.getBoundingClientRect();
				var er = this.getBoundingClientRect();
				var tr = this.tooltip.getBoundingClientRect();
				this.tooltip.style.left = (pos+er.left-pr.left-tr.width/2)+"px";
				this.tooltip.style.top = (er.top-pr.top-tr.height+2)+"px";
			};
			// mute button
			ABPInst.btnVolume.addEventListener("click", function(){
				ABPInst.mute(!ABPInst.state.mute);
			});
			//volume bar
			ABPInst.barVolume.progress.main=100;
			ABPInst.barVolume.addEventListener("stopdrag", function(){
				for (var i=0;i<ABPInst.videos.length;i++) {
					ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
				}
			});
			ABPInst.barVolume.addEventListener("ondrag", function(){
				for (var i=0;i<ABPInst.videos.length;i++) {
					ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
				}
			});
			ABPInst.barVolume.addEventListener("startdrag", function(){
				ABPInst.mute(false);
			});
			//opacity bar
			ABPInst.barOpacity.progress.main=100;
			ABPInst.barOpacity.addEventListener("stopdrag",function(){
				ABPInst.cmManager.options.global.opacity = ABPInst.barOpacity.progress.main/100;
			});
			ABPInst.barOpacity.addEventListener("ondrag",function(){
				ABPInst.cmManager.options.global.opacity = ABPInst.barOpacity.progress.main/100;
			});
			ABPInst.barOpacity.bar.updatetooltip = function(e) {
				var pos = e.clientX-this.getBoundingClientRect().left;
				if (pos>=0 && pos<=this.offsetWidth) {
					this.tooltip.innerHTML = parseInt(pos/this.offsetWidth*100)/100;
				}
				var pr = document.body.getBoundingClientRect();
				var er = this.getBoundingClientRect();
				var tr = this.tooltip.getBoundingClientRect();
				this.tooltip.style.left = (pos+er.left-pr.left-tr.width/2)+"px";
			};

			//
			/* danmaku events */
			//todo 

			/* key events */
			playerUnit.addEventListener("keydown", function(e){
				if(e && e.keyCode == 32 && document.activeElement !== ABPInst.txtText){
					ABPInst.btnPlay.click();
					e.preventDefault();
				}
			});


			/** Create a bound CommentManager if possible **/
			if(typeof CommentManager !== "undefined"){
				if(ABPInst.state.autosize){
					var autosize = function(){
						if(video.videoHeight === 0 || video.videoWidth === 0){
							return;
						}
						var aspectRatio = video.videoHeight / video.videoWidth;
						// We only autosize within the bounds
						var boundW = playerUnit.offsetWidth;
						var boundH = playerUnit.offsetHeight;
						var oldASR = boundH / boundW;

						if(oldASR < aspectRatio){
							playerUnit.style.width = (boundH / aspectRatio) + "px";
							playerUnit.style.height = boundH  + "px";
						}else{
							playerUnit.style.width = boundW + "px";
							playerUnit.style.height = (boundW * aspectRatio) + "px";
						}

						ABPInst.cmManager.setBounds();
					};
					video.addEventListener("loadedmetadata", autosize);
					autosize();
				}
			}
			return ABPInst;
		}
	})()

window.ABP = ABP;


var appkey = "c1b107428d337928";
var secretkey = "ea85624dfcf12d7cc7b2b3a94fac1f2c";

var url = document.location.href;
var aid_reg = /\/av(\d+)\/(?:index_(\d+)\.html)?/ig;
var aid_array = aid_reg.exec(url);

var aid = aid_array === null ? '' : aid_array[1]; //aid
var page = aid_array === null ? '1' : typeof(aid_array[2]) == 'undefined' ? '1' : aid_array[2]; //分p

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
				var p = page - 1;
				var lp = null;
				for (var i=0;i<list.length;++i)
					if (list[i].page == p) lp = list[i];
				if (lp === null) lp = list[0]; //针对某些aid只有一个cid但是有分P的情况
				var cid = lp.cid;
				var type = lp.type;
				var vid = lp.vid;
				console.log("aid: "+aid+" cid: "+cid+" type: "+type+" vid: "+vid);
				if (type != "letv" && type != "mletv") api_get_url(cid); 
			}
		}
	});
}


function api_get_url(cid, quality = 4) {
	var req_url = "http://interface.bilibili.com/playurl?"+sign_req("appkey="+appkey+"&cid="+cid+"&type=mp4&quality="+quality);
	console.log(req_url);
	GM_xmlhttpRequest({
		method: 'GET',
		url: req_url,
		synchronous: false,
		onload: function(responseDetails) {
			if (responseDetails.status == 200) {
				var xmldoc = loadXML(responseDetails.responseText);
				var durls = xmldoc.getElementsByTagName("durl");
				console.log(durls);
				var playlist = [];
				for (var i=0;i<durls.length;i++) {
					playlist.push({"sources":{"video/mp4":durls[i].getElementsByTagName("url")[0].firstChild.nodeValue}});
				}
				console.log(playlist);
				window.inst = ABP.create(document.getElementById("bofqi"), {
					"src":{
						"playlist":playlist,
						"danmaku":'http://comment.bilibili.com/' + cid + '.xml',
					},
					"width":1160,
					"height":640
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
