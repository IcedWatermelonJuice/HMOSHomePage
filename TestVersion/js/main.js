require.config({
	urlArgs: `v=${app.version}`,
	baseUrl: "js/lib"
});

require(['jquery'], function($) {
	/**
	 * 存储获取数据函数
	 * @function get 存储数据
	 * @function set 获取数据
	 */
	var store = {
		/**
		 * 存储名称为key的val数据
		 * @param {String} key 键值
		 * @param {String} val 数据
		 */
		set: function(key, val) {
			if (!val) {
				return;
			}
			try {
				var json = JSON.stringify(val);
				if (typeof JSON.parse(json) === "object") { // 验证一下是否为JSON字符串防止保存错误
					localStorage.setItem(key, json);
				}
			} catch (e) {
				return false;
			}
		},
		/**
		 * 获取名称为key的数据
		 * @param {String} key 键值
		 */
		get: function(key) {
			if (this.has(key)) {
				return JSON.parse(localStorage.getItem(key));
			}
		},
		has: function(key) {
			if (localStorage.getItem(key)) {
				return true;
			} else {
				return false;
			}
		},
		del: function(key) {
			localStorage.removeItem(key);
		}
	};

	// 识别浏览器
	var browserInfo = function() {
		if (window.via) {
			return 'via';
		} else if (window.mbrowser) {
			return 'x';
		}
	};
var browser=browserInfo();
	var settingsFn = function(storage, browser) {
		// let browser=browserInfo();
		if (browser === 'via') {
			this.storage = {
				engines: "baidu",
				bookcolor: "black",
				styleThin: true,
				nightMode: false,
				autonightMode: false,
				autonightMode2: false,
				autonightMode2Array: "20:00-8:00",
				searchHistory: false,
				LOGOclickFn: "bookmarkList",
				LOGOlongpressFn: "settingsPage"
			};
		} else if (browser === 'x') {
			this.storage = {
				engines: "baidu",
				bookcolor: "black",
				styleThin: true,
				nightMode: false,
				autonightMode: true,
				autonightMode2: false,
				autonightMode2Array: "20:00-8:00",
				searchHistory: false,
				LOGOclickFn: "bookmarkList",
				LOGOlongpressFn: "settingsPage"
			};
		} else {
			this.storage = {
				engines: "baidu",
				bookcolor: "black",
				styleThin: true,
				nightMode: false,
				autonightMode: true,
				autonightMode2: false,
				autonightMode2Array: "20:00-8:00",
				searchHistory: false,
				LOGOclickFn: "choicePage",
				LOGOlongpressFn: "settingsPage"
			};
		}
		this.initStorage = this.storage;
		this.storage = $.extend({}, this.storage, storage);
	}
	settingsFn.prototype = {
		getJson: function() {
			return this.storage;
		},
		getinitSettings: function() {
			return this.initStorage;
		},
		// 读取设置项
		get: function(key) {
			return this.storage[key];
		},
		// 设置设置项并应用
		set: function(key, val) {
			this.storage[key] = val;
			store.set("setData", this.storage);
			this.apply();
		},
		// 应用设置项
		apply: function() {
			var that = this;
			// 样式细圆
			if (that.get('styleThin')) {
				$("body").addClass('styleThin');
			}
			$('.ornament-input-group').removeAttr('style');
			// 加载LOGO
			if (that.get('logo')) {
				$(".logo").html('<img src="' + that.get('logo') + '" />');
			} else {
				$(".logo").html('<img src="logo/HarmonyOS_logo.png"/>');
			}
			// 夜间模式 和 壁纸 LOGO
			var nightMode = {
				on: function() {
					$("body").removeClass('theme-black theme-white').addClass('theme-white');
					$("body").css("background-image", "");
					$("#nightCss").removeAttr('disabled');
				},
				off: function() {
					if (that.get('wallpaper')) {
						$("body").css("background-image", "url(" + that.get('wallpaper') + ")");
					} else {
						$("body").css("background-image", "");
					}
					$("body").removeClass('theme-black theme-white').addClass('theme-' + that
						.get('bookcolor'));
					$("#nightCss").attr('disabled', true);
				}
			};
			if (that.get('nightMode') === true) {
				nightMode.on();
				if (that.get('logo')) {
					$(".logo").html('<img src="' + that.get('logo') + '" />');
				} else {
					$(".logo").html('<img src="logo/HarmonyOS_logo(for nightMode).png"/>');
				}
			} else {
				nightMode.off();
				if (that.get('logo')) {
					$(".logo").html('<img src="' + that.get('logo') + '" />');
				} else {
					$(".logo").html('<img src="logo/HarmonyOS_logo.png"/>');
				}
			}



		}
	}
	var settings = new settingsFn(store.get("setData"), browserInfo());
	settings.apply();

	// 自动夜间模式(非Via浏览器)
	function autoNightModeFn() {
		if ((window.matchMedia('(prefers-color-scheme: dark)').matches) && (settings.get('nightMode') ===
				false)) {
			settings.set('nightMode', true);
		} else if ((window.matchMedia('(prefers-color-scheme: light)').matches) && (settings.get(
				'nightMode') === true)) {
			settings.set('nightMode', false);
		}
	}
	// 自动夜间模式(via浏览器) 删除掉VIA浏览器夜间模式的暗色支持
	// function autoNightModeFn2() {
	// 	$("head").on("DOMNodeInserted DOMNodeRemoved", function(evt) {
	// 		if (evt.target.id === "via_inject_css_night") {
	// 			if (evt.type === "DOMNodeInserted") {
	// 				$("#via_inject_css_night").html("");
	// 				settings.set('nightMode', true);
	// 			} else if (evt.type === "DOMNodeRemoved") {
	// 				settings.set('nightMode', false);
	// 			}
	// 		}
	// 	});
	// 	if ($("#via_inject_css_night").html("").length > 0) {
	// 		settings.set('nightMode', true);
	// 	}
	// }
	var autoNightMode2Fn = {
		getSetTime: function() {
			let setTime = prompt("请输入开启时间,格式为:hh:mm-hh:mm,例如:20:00-8:00");
			try {
				let setTimeFlag0 = setTime.search("-");
				let setTimeFlag1=setTime.search(":");
				let setTimeFlag2=setTime.slice(setTimeFlag0).search(":");
				let alertMessage="输入时间格式错误:";
				if (setTimeFlag0 === -1) {
					alertMessage+="\n区间间隔'-'丢失!";
				} 
				if(setTimeFlag1 === -1){
					alertMessage+="\n开始时间':'丢失!";
				}
				if(setTimeFlag2 === -1){
					alertMessage+="\n结束时间':'丢失!";
				}
				if((setTimeFlag0!==-1)&&(setTimeFlag1!==-1)&&(setTimeFlag2!==-1)){
					settings.set('autonightMode2Array', setTime);
					alert("时间设定成功!");
				}else{
					alert(alertMessage);
				}
			} catch (e) {
				alert("时间设定失败!");
			}
		},
		changeSetTime: function() {
			let returnArray = new Array;
			let setTime = settings.get('autonightMode2Array');

			let setTimeFlag0 = setTime.search("-");
			let setTimeFlag1;
			let setTime0 = setTime.slice(0, setTimeFlag0);
			let setTime1 = setTime.slice(setTimeFlag0 + 1);
			
			setTimeFlag0 = setTime0.search(":");
			setTimeFlag1 = setTime1.search(":");
			let setTime0Hour = parseInt(setTime0.slice(0, setTimeFlag0));
			let setTime0Minute = parseInt(setTime0.slice(setTimeFlag0 + 1));
			let setTime1Hour = parseInt(setTime1.slice(0, setTimeFlag1));
			let setTime1Minute = parseInt(setTime1.slice(setTimeFlag1 + 1));
			
			returnArray[0] = setTime0Hour * 60 + setTime0Minute;
			returnArray[1] = setTime1Hour * 60 + setTime1Minute;
			return returnArray;
		},
		getNowTime: function() {
			var nowTime = new Date();
			var nowHour = nowTime.getHours();
			var nowMinute = nowTime.getMinutes();
			var nowTimeSum = nowHour * 60 + nowMinute;
			return nowTimeSum;
		},
		on:function(){
			if(settings.get('nightMode') ===false){
				settings.set('nightMode', true);
			}
		},
		off:function(){
			if(settings.get('nightMode') ===true){
				settings.set('nightMode', false);
			}
		},
	};

	function autoNightModeOn() {
		if (settings.get('autonightMode') === true) {
			autoNightModeFn();
			// autoNightModeFn2();
		}
		if (settings.get('autonightMode2') === true) {
			let setTimeArray=autoNightMode2Fn.changeSetTime();
			let setTime0Sum = setTimeArray[0];
			let setTime1Sum = setTimeArray[1];
			if (setTime0Sum !== -1 || setTime1Sum !== -1) {
				let nowTimeSum = autoNightMode2Fn.getNowTime();
				if (setTime0Sum <= setTime1Sum) {
					if ((nowTimeSum >= setTime0Sum) && (nowTimeSum <= setTime1Sum)) {
						autoNightMode2Fn.on();
					} else {
						autoNightMode2Fn.off();
					}
				} else {
					if ((nowTimeSum > setTime1Sum) && (nowTimeSum < setTime0Sum)) {
						autoNightMode2Fn.off();
					} else {
						autoNightMode2Fn.on();
					}
				}
			}
		}
	}

	/**
	 * DOM长按事件
	 */
	$.fn.longPress = function(fn) {
		var timeout = void 0,
			$this = this,
			startPos,
			movePos,
			endPos;
		for (var i = $this.length - 1; i > -1; i--) {
			$this[i].addEventListener("touchstart", function(e) {
				var touch = e.targetTouches[0];
				startPos = {
					x: touch.pageX,
					y: touch.pageY
				};
				timeout = setTimeout(function() {
					if ($this.attr("disabled") === undefined) {
						fn();
					}
				}, 700);
			}, {
				passive: true
			});
			$this[i].addEventListener("touchmove", function(e) {
				var touch = e.targetTouches[0];
				movePos = {
					x: touch.pageX - startPos.x,
					y: touch.pageY - startPos.y
				};
				(Math.abs(movePos.x) > 10 || Math.abs(movePos.y) > 10) && clearTimeout(timeout);
			}, {
				passive: true
			});
			$this[i].addEventListener("touchend", function() {
				clearTimeout(timeout);
			}, {
				passive: true
			});
		}
	};

	/**
	 * 文件打开函数
	 * @param callback 回调函数
	 */
	var openFile = function(callback) {
		$('.openFile').remove();
		var input = $('<input class="openFile" type="file">');
		input.on("propertychange change", callback);
		$('body').append(input);
		input.click();
	}

	/**
	 * 文件上传函数
	 * @param file 文件
	 * @param callback 回调函数 
	 */
	var uploadFile = function(file, callback) {
		var imageData = new FormData();
		imageData.append("Filedata", file);
		imageData.append("file", "multipart");
		$.ajax({
			url: 'https://api.uomg.com/api/image.ali',
			type: 'POST',
			data: imageData,
			cache: false,
			contentType: false,
			processData: false,
			dataType: 'json',
			success: function(res) {
				if (res.code == 1) {
					callback.success && callback.success(res.imgurl);
				} else {
					callback.error && callback.error(res.msg);
				}
			},
			error: function() {
				callback.error && callback.error('请求失败！');
			},
			complete: function() {
				callback.complete && callback.complete();
			}
		});
	}

	/**
	 * 首页书签构建函数
	 * @function init 初始化
	 * @function bind 绑定事件
	 * @function del 删除书签
	 * @function add 添加书签
	 */
	var bookMarkFn = function(ele, options) {
		this.$ele = $(ele);
		this.options = {
			data: [{
				"name": "精选",
				"url": "choice()",
				"icon": "img/bookmarks/discover.png"
			}, {
				"name": "AirPortal",
				"url": "https://airportal.cn/",
				"icon": "img/bookmarks/airportal.png"
			}, {
				"name": "Github",
				"url": "https://github.com/",
				"icon": "img/bookmarks/github.png"
			}, {
				"name": "Gitee",
				"url": "https://gitee.com",
				"icon": "img/bookmarks/gitee.png"
			}, {
				"name": "设置",
				"url": "openSettingPage()",
				"icon": "img/bookmarks/settings.png"
			}, {
				"name": "B站",
				"url": "https://bilibili.com/",
				"icon": "img/bookmarks/bilibili.png"
			}, {
				"name": "爱奇艺",
				"url": "https://iqiyi.com/",
				"icon": "img/bookmarks/iqiyi.png"
			}, {
				"name": "腾讯视频",
				"url": "https://v.qq.com/",
				"icon": "img/bookmarks/tencentvideo.png"
			}],
		};
		this.intiOptions = this.options;
		this.options = $.extend({}, this.options, options);
		this.init();
	}
	bookMarkFn.prototype = {
		init: function() {
			var html = '';
			var data = this.options.data;
			for (var i = 0, l = data.length; i < l; i++) {
				html += '<div class="list" data-url="' + data[i].url +
					'"><div class="img" style="background-image:url(' + data[i].icon +
					')"></div><div class="text">' + data[i].name + "</div></div>";
			}
			this.$ele.html(html);
			this.bind();
		},
		getJson: function() {
			return this.options.data;
		},
		getinitbookMarks: function() {
			return this.intiOptions.data;
		},
		searchURL: function(url) {
			var data = this.options.data;
			for (let i = 0; i < data.length; i++) {
				if (data[i].url === url) {
					return true;
					break;
				}
			}
			return false;
		},
		bind: function() {
			var that = this;
			var data = this.options.data;
			// 绑定书签长按事件
			this.$ele.longPress(function() {
				if (that.status !== "editing" && data.length > 0) {
					that.status = "editing";
					$('.logo,.ornament-input-group').css('pointer-events', 'none');
					$('.addbook').remove();
					require(['jquery-sortable'], function() {
						that.$ele.sortable({
							animation: 150,
							fallbackTolerance: 3,
							touchStartThreshold: 3,
							ghostClass: "ghost",
							onEnd: function(evt) {
								var startID = evt.oldIndex,
									endID = evt.newIndex;
								if (startID > endID) {
									data.splice(endID, 0, data[startID]);
									data.splice(startID + 1, 1);
								} else {
									data.splice(endID + 1, 0, data[
										startID]);
									data.splice(startID, 1);
								}
								store.set("bookMark", data);
							}
						});
					})
					$(document).click(function() {
						$(document).unbind("click");
						$('.logo,.ornament-input-group').css('pointer-events', '');
						$(".delbook").addClass("animation");
						$(".delbook").on('transitionend', function(evt) {
							if (evt.target !== this) {
								return;
							}
							$(".delbook").remove();
							that.$ele.sortable("destroy");
							that.status = "";
						});
					});
					var $list = that.$ele.find(".list");
					for (var i = $list.length; i > -1; i--) {
						$list.eq(i).find(".img").prepend('<div class="delbook"></div>');
					}
				}
			});
			this.$ele.on('click', function(evt) {
				if (evt.target !== this || that.status === 'editing' || $('.addbook').hasClass(
						'animation') || data.length >= 20) {
					return;
				}
				if ($('.addbook').length === 0) {
					that.$ele.append(
						'<div class="list addbook"><div class="img"><svg viewBox="0 0 1024 1024"><path class="st0" d="M673,489.2H534.8V350.9c0-12.7-10.4-23-23-23c-12.7,0-23,10.4-23,23v138.2H350.6c-12.7,0-23,10.4-23,23c0,12.7,10.4,23,23,23h138.2v138.2c0,12.7,10.4,23,23,23c12.7,0,23-10.4,23-23V535.2H673c12.7,0,23-10.4,23-23C696.1,499.5,685.7,489.2,673,489.2z" fill="#222"/></svg></div></div>'
					);
					$('.addbook').click(function() {
						$('.addbook').remove();
						// 取消书签编辑状态
						$(document).click();
						// 插入html
						$('#app').append(`<div class="page-bg"></div>
						<div class="page-addbook">
							<ul class="addbook-choice">
								<li class="current">站点</li>
								<!-- <li>书签</li>
								<li>历史</li> -->
								<span class="active-span"></span>
							</ul>
							<div class="addbook-content">
								<div class="addbook-sites">
								<input type="text" class="addbook-input addbook-url" placeholder="输入网址" value="http://" />
								<input type="text" class="addbook-input addbook-name" placeholder="输入网站名" />
									<div id="addbook-upload">点击选择图标</div>
									<div class="addbook-ok">确认添加</div>
								</div>
								<div class="bottom-close"></div>
							</div>
						</div>`);

						setTimeout(function() {
							$(".page-bg").addClass("animation");
							$(".addbook-choice").addClass("animation");
							$(".addbook-content").addClass("animation");
						}, 50);

						//绑定事件
						$("#addbook-upload").click(function() {
							openFile(function() {
								var file = this.files[0];
								var reader = new FileReader();
								reader.onload = function() {
									$("#addbook-upload").html(
										'<img src="' + this
										.result +
										'"></img><p>' + file
										.name + '</p>');
								};
								$("#addbook-upload").css(
									"pointer-events", "");
								$(".addbook-ok").css("pointer-events",
									"");
								reader.readAsDataURL(file);
								/*$("#addbook-upload").html('上传图标中...').css("pointer-events", "none");
								$(".addbook-ok").css("pointer-events", "none");
								uploadFile(file, {
									success: function (url) {
										$("#addbook-upload").html('<img src="' + url + '"></img><p>' + file.name + '</p>');
									},
									error: function (msg) {
										$("#addbook-upload").html('上传图标失败！' + msg);
									},
									complete: function () {
										$("#addbook-upload").css("pointer-events", "");
										$(".addbook-ok").css("pointer-events", "");
									}
								})*/
							});
						});
						$(".addbook-ok").click(function() {
							var name = $(".addbook-name").val(),
								url = $(".addbook-url").val(),
								icon = $("#addbook-upload img").attr("src");
							if (name.length && url.length) {
								if (!icon) {
									// 绘制文字图标
									var canvas = document.createElement(
										"canvas");
									canvas.height = 100;
									canvas.width = 100;
									var ctx = canvas.getContext("2d");
									ctx.fillStyle = "#f5f5f5";
									ctx.fillRect(0, 0, 100, 100);
									ctx.fill();
									ctx.fillStyle = "#222";
									ctx.font = "40px Arial";
									ctx.textAlign = "center";
									ctx.textBaseline = "middle";
									ctx.fillText(name.substr(0, 1), 50, 52);
									icon = canvas.toDataURL("image/png");
								}
								$(".bottom-close").click();
								bookMark.add(name, url, icon);
							}
						});
						$(".bottom-close").click(function() {
							$(".page-addbook").css({
								"pointer-events": "none"
							});
							$(".page-bg").removeClass("animation");
							$(".addbook-choice").removeClass("animation");
							$(".addbook-content").removeClass("animation");
							setTimeout(function() {
								$(".page-addbook").remove();
								$(".page-bg").remove();
							}, 300);
						});
						$(".page-addbook").click(function(evt) {
							if (evt.target === evt.currentTarget) {
								$(".bottom-close").click();
							}
						});

					})
				} else {
					$(".addbook").addClass("animation");
					setTimeout(function() {
						$(".addbook").remove();
					}, 400);
				}
			});
			this.$ele.on('click', '.list', function(evt) {
				evt.stopPropagation();
				var dom = $(evt.currentTarget);
				if (that.status !== "editing") {
					var url = dom.data("url");
					if (url) {
						switch (url) {
							case "choice()":
								choice();
								break;
							case "openSettingPage()":
								openSettingPage();
								break;
							default:
								location.href = url;
						}
					}
				} else {
					if (evt.target.className === "delbook") {
						that.del(dom.index());
					}
				}
			});
		},
		del: function(index) {
			var that = this;
			var data = this.options.data;
			this.$ele.css("overflow", "visible");
			var dom = this.$ele.find('.list').eq(index);
			dom.css({
				transform: "translateY(60px)",
				opacity: 0,
				transition: ".3s"
			});
			dom.on('transitionend', function(evt) {
				if (evt.target !== this) {
					return;
				}
				dom.remove();
				that.$ele.css("overflow", "hidden");
			});
			data.splice(index, 1);
			store.set("bookMark", data);
		},
		add: function(name, url, icon) {
			var data = this.options.data;
			url = url.match(/:\/\//) ? url : "http://" + url;
			var i = data.length - 1;
			var dom = $('<div class="list" data-url="' + url +
				'"><div class="img" style="background-image:url(' + icon +
				')"></div><div class="text">' + name + '</div></div>');
			this.$ele.append(dom);
			dom.css({
				marginTop: "60px",
				opacity: "0"
			}).animate({
				marginTop: 0,
				opacity: 1
			}, 300);
			data.push({
				name: name,
				url: url,
				icon: icon
			});
			store.set("bookMark", data);
		}
	}


	/**
	 * 搜索历史构建函数
	 * @function init 初始化
	 * @function load 加载HTML
	 * @function bind 绑定事件
	 * @function add 添加历史
	 * @function empty 清空历史
	 */
	var searchHistoryFn = function(ele, options) {
		this.$ele = $(ele);
		this.options = {
			data: []
		};
		this.options = $.extend({}, this.options, options);
		this.init();
	}
	searchHistoryFn.prototype = {
		init: function() {
			this.options.data = this.options.data.slice(0, 10);
			this.load();
			this.bind();
		},
		load: function() {
			var data = this.options.data;
			var html = '';
			var l = data.length;
			for (var i = 0; i < l; i++) {
				html += '<li>' + data[i] + '</li>';
			}
			this.$ele.find('.content').html(html);
			l ? $('.emptyHistory').show() : $('.emptyHistory').hide();
		},
		bind: function() {
			var that = this;
			// 监听touch事件，防止点击后弹出或收回软键盘
			$('.emptyHistory')[0].addEventListener("touchstart", function(e) {
				e.preventDefault();
			}, false);
			$('.emptyHistory')[0].addEventListener("touchend", function(e) {
				if ($('.emptyHistory').hasClass('animation')) {
					that.empty();
				} else {
					$('.emptyHistory').addClass('animation');
				}
			}, false);
			this.$ele.click(function(evt) {
				if (evt.target.nodeName === "LI") {
					$('.search-input').val(evt.target.innerText).trigger("propertychange");
					$('.search-btn').click();
				}
			});
		},
		add: function(text) {
			var data = this.options.data;
			if (settings.get('searchHistory') === true) {
				var pos = data.indexOf(text);
				if (pos !== -1) {
					data.splice(pos, 1);
				}
				data.unshift(text);
				this.load();
				store.set("history", data);
			}
		},
		empty: function() {
			this.options.data = [];
			store.set("history", []);
			this.load();
		}
	}

	// 开始构建
	var bookMark = new bookMarkFn($('.bookmark'), {
		data: store.get("bookMark")
	})
	var searchHistory = new searchHistoryFn($('.history'), {
		data: store.get("history")
	});

	/**
	 * 更改地址栏URL参数
	 * @param {string} param 参数
	 * @param {string} value 值
	 * @param {string} url 需要更改的URL,不设置此值会使用当前链接
	 */
	var changeParam = function(param, value, url) {
		url = url || location.href;
		var reg = new RegExp("(^|)" + param + "=([^&]*)(|$)");
		var tmp = param + "=" + value;
		return url.match(reg) ? url.replace(eval(reg), tmp) : url.match("[?]") ? url + "&" + tmp : url +
			"?" + tmp;
	};

	// 更改URL，去除后面的参数
	history.replaceState(null, document.title, location.origin + location.pathname);

	// 绑定主页虚假输入框点击事件
	$(".ornament-input-group").click(function() {
		$('body').css("pointer-events", "none");
		history.pushState(null, document.title, changeParam("page", "search"));
		// 输入框边框动画
		$('.anitInput').remove();
		var ornamentInput = $(".ornament-input-group");
		var top = ornamentInput.offset().top;
		var left = ornamentInput.offset().left;
		var anitInput = ornamentInput.clone();
		anitInput.attr('class', 'anitInput').css({
			'position': 'absolute',
			'top': top,
			'left': left,
			'width': ornamentInput.outerWidth(),
			'height': ornamentInput.outerHeight(),
			'pointer-events': 'none'
		})
		anitInput.on('transitionend', function(evt) {
			if (evt.target !== this) {
				return;
			}
			anitInput.unbind('transitionend');
			$(".input-bg").css("border-color", "var(--dark)");
			anitInput.css("opacity", "0");
		});
		$('body').append(anitInput);
		ornamentInput.css('opacity', 0);
		if ($(window).data('anitInputFn')) {
			$(window).unbind('resize', $(window).data('anitInputFn'));
		}
		var anitInputFn = function() {
			var inputBg = $('.input-bg');
			var scaleX = inputBg.outerWidth() / ornamentInput.outerWidth();
			var scaleY = inputBg.outerHeight() / ornamentInput.outerHeight();
			var translateX = inputBg.offset().left - left - (ornamentInput.outerWidth() - inputBg
				.outerWidth()) / 2;
			var translateY = inputBg.offset().top - top - (ornamentInput.outerHeight() - inputBg
				.outerHeight()) / 2;
			anitInput.css({
				'transform': 'translateX(' + translateX + 'px) translateY(' + translateY +
					'px) scale(' + scaleX + ',' + scaleY + ') translate3d(0,0,0)',
				'transition': '.3s',
				'border-color': 'var(--dark)'
			});
		}
		$(window).data('anitInputFn', anitInputFn);
		$(window).bind('resize', anitInputFn);
		// 弹出软键盘
		$(".s-temp").focus();
		// 书签动画
		$(".bookmark").addClass("animation");
		// 显示搜索页
		$(".page-search").show();
		setTimeout(function() {
			$(".page-search").on('transitionend', function(evt) {
				if (evt.target !== this) {
					return;
				}
				$(".page-search").off('transitionend');
				$('body').css("pointer-events", "");
			}).addClass("animation");
			$(".search-input").val("").focus();
			$(".history").show().addClass("animation");
			$(".input-bg").addClass("animation");
			$(".shortcut").addClass("animation");
		}, 1);
	});

	$(".page-search").click(function(evt) {
		if (evt.target === evt.currentTarget) {
			history.go(-1);
		}
	});

	// 返回按键被点击
	window.addEventListener("popstate", function() {
		if ($('.page-search').is(":visible")) {
			$('body').css("pointer-events", "none");
			history.replaceState(null, document.title, location.origin + location.pathname);
			// 输入框边框动画
			$(window).unbind('resize', $(window).data('anitInputFn'));
			var anitInput = $('.anitInput');
			anitInput.css({
				'transform': '',
				'transition': '.3s',
				'opacity': '',
				'border-color': ''
			});
			// 书签动画
			$(".bookmark").removeClass("animation");
			// 隐藏搜索页
			$(".history").removeClass("animation");
			$(".input-bg").css("border-color", "").removeClass("animation");
			$(".shortcut").removeClass("animation");
			$(".page-search").removeClass("animation");
			$(".page-search").on('transitionend', function(evt) {
				if (evt.target !== this) {
					return;
				}
				$(".page-search").off('transitionend');
				$(".page-search").hide();
				$('.ornament-input-group').css({
					'transition': 'none',
					'opacity': ''
				});
				anitInput.remove();
				// 搜索页内容初始化
				$(".suggestion").html("");
				$(".search-btn").html("取消");
				$(".shortcut1").show();
				$(".shortcut2,.shortcut3,.empty-input").hide();
				$(".search-input").val('');
				$('.emptyHistory').removeClass('animation');
				$('body').css("pointer-events", "");
			});
		}
	}, false);

	$(".suggestion").click(function(evt) {
		if (evt.target.nodeName === "SPAN") {
			$('.search-input').focus().val($(evt.target).parent().text()).trigger("propertychange");
			return;
		} else {
			searchText(evt.target.innerText);
		}
	});
	var qs_ajax = null;
	$(".search-input").on("input propertychange", function() {
		var that = this;
		var wd = $(that).val();
		$(".shortcut1,.shortcut2,.shortcut3").hide();
		if (!wd) {
			$(".history").show();
			$(".empty-input").hide();
			$(".search-btn").html("取消");
			$(".shortcut1").show();
			$(".suggestion").hide().html('');
		} else {
			$(".history").hide();
			$(".empty-input").show();
			$(".search-btn").html(
				/^\b((((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|net|org|int|edu|gov|mil|arpa|asia|biz|info|name|pro|coop|aero|museum|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?))|(file:\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])$/i
				.test(wd) ? "进入" : "搜索");
			var has_char = escape(wd).indexOf("%u");
			has_char < 0 ? $(".shortcut2").show() : $(".shortcut3").show();
			$.ajax({
				url: "https://suggestion.baidu.com/su",
				type: "GET",
				dataType: "jsonp",
				data: {
					wd: wd,
					cb: "sug"
				},
				timeout: 5000,
				jsonpCallback: "sug",
				success: function(res) {
					if ($(that).val() !== wd) {
						return;
					}
					var data = res.s;
					var isStyle = $(".suggestion").html();
					var html = "";
					for (var i = data.length; i > 0; i--) {
						var style = "";
						if (isStyle === "") {
							style = "animation: fadeInDown both .5s " + (i - 1) * 0.05 +
								's"';
						}
						html += '<li style="' + style + '"><div>' + data[i - 1].replace(wd,
							'<b>' + wd + '</b>') + "</div><span></span></li>";
					}
					$(".suggestion").show().html(html).scrollTop($(".suggestion")[0]
						.scrollHeight);
				}
			});
			if (qs_ajax) {
				qs_ajax.abort();
			}
			if (has_char >= 0) {
				qs_ajax = $.ajax({
					url: "https://bird.ioliu.cn/v1?url=https://quark.sm.cn/api/qs?query=" + wd +
						"&ve=4.1.0.132",
					type: "GET",
					timeout: 5000,
					success: function(res) {
						if ($(that).val() !== wd) {
							return;
						}
						var data = res.data;
						var html = '<li>快搜:</li>';
						for (var i = 0, l = data.length; i < l; i++) {
							html += '<li>' + data[i] + '</li>';
						}
						$('.shortcut3').html(html);
					}
				});
			}
		}
	});

	$(".empty-input").click(function() {
		$(".search-input").focus().val("").trigger("propertychange");
	});

	$(".shortcut1,.shortcut2").click(function(evt) {
		$(".search-input").focus().val($(".search-input").val() + evt.target.innerText).trigger(
			"propertychange");
	});

	$(".shortcut3").click(function(evt) {
		if (evt.target.nodeName === "LI") {
			var text = evt.target.innerText;
			var data = {
				百科: "https://baike.baidu.com/search?word=%s",
				视频: "https://m.v.qq.com/search.html?act=0&keyWord=%s",
				图片: "https://image.baidu.com/search/index?tn=baiduimage&word=%s",
				贴吧: "https://tieba.baidu.com/f?kw=%s",
				Github: "https://github.com/search?q=%s",
				Gitee: "https://search.gitee.com/?q=%s"
			}
			if (data[text]) {
				location.href = data[text].replace("%s", $(".search-input").val());
			}
		}
	});

	$(".search-btn").click(function() {
		var text = $(".search-input").val();
		if ($(".search-btn").text() === "进入") {
			!text.match(/^((ht|f)tp(s?)|file):\/\//) && (text = "http://" + text);
			history.go(-1);
			setTimeout(function() {
				location.href = text;
			}, 1);
		} else {
			if (!text) {
				$(".search-input").blur();
				history.go(-1);
			} else {
				searchText(text);
			}
		}
	});

	$(".search-input").keydown(function(evt) {
		// 使用回车键进行搜索
		evt.keyCode === 13 && $(".search-btn").click();
	});

	// 搜索函数
	function searchText(text) {
		if (!text) {
			return;
		}
		searchHistory.add(text);
		history.go(-1);
		setTimeout(function() { // 异步执行 兼容QQ浏览器
			if (settings.get('engines') === "via") {
				window.via.searchText(text);
			} else {
				location.href = {
					baidu: "https://m.baidu.com/s?wd=%s",
					quark: "https://quark.sm.cn/s?q=%s",
					google: "https://www.google.com/search?q=%s",
					bing: "https://cn.bing.com/search?q=%s",
					sm: "https://m.sm.cn/s?q=%s",
					haosou: "https://m.so.com/s?q=%s",
					sogou: "https://m.sogou.com/web/searchList.jsp?keyword=%s",
					diy: settings.get('diyEngines')
				} [settings.get('engines')].replace("%s", text);
			}
		}, 1);
	}

	//精选页面
	function choice() {
		// 构建HTML
		var data = {
				"常用": [{
					"hl": "百度",
					"shl": "百度一下你就知道",
					"img": "baidu",
					"url": "baidu.com"
				}, {
					"hl": "谷歌",
					"shl": "最大的搜索引擎",
					"img": "google",
					"url": "google.com"
				}, {
					"hl": "起点中文",
					"shl": "精彩小说大全",
					"img": "qidian",
					"url": "qidian.com"
				}, {
					"hl": "微信读书",
					"shl": "百万好书免费读",
					"img": "weread",
					"url": "weread.qq.com"
				}, {
					"hl": "淘宝",
					"shl": "淘我喜欢",
					"img": "taobao",
					"url": "taobao.com"
				}, {
					"hl": "京东",
					"shl": "多好快省品质生活",
					"img": "jd",
					"url": "jd.com"
				}, {
					"hl": "12306",
					"shl": "你离世界只差一张票",
					"img": "12306",
					"url": "12306.cn"
				}, {
					"hl": "Kiwi",
					"shl": "支持crx插件的手机浏览器",
					"img": "kiwi",
					"url": "github.com/kiwibrowser/src.next/releases"
				}, {
					"hl": "轻插件",
					"shl": "Via或Alook脚本网站",
					"img": "viaapp",
					"url": "via-app.cn"
				}, {
					"hl": "油猴脚本",
					"shl": "安全实用的用户脚本大全",
					"img": "greasyfork",
					"url": "greasyfork.org/zh-CN"
				}, {
					"hl": "谷歌扩展",
					"shl": "Chrome官方扩展商店",
					"img": "chrome",
					"url": "chrome.google.com/webstore"
				}, {
					"hl": "微软扩展",
					"shl": "Edge官方扩展商店",
					"img": "microsoft",
					"url": "microsoftedge.microsoft.com/addons"
				}, {
					"hl": "极简插件",
					"shl": "第三方crx扩展商店",
					"img": "chajian",
					"url": "chrome.zzzmh.cn"
				}, {
					"hl": "Crx4中",
					"shl": "Crx4Chrome中文版",
					"img": "chajian",
					"url": "crx4.com"
				}, {
					"hl": "Crx下载",
					"shl": "用于下载CRX文件",
					"img": "crxdownload",
					"url": "chrome-extension-downloader.com"
				}, {
					"hl": "Crx4",
					"shl": "全球最大第三方crx商店",
					"img": "chajian",
					"url": "crx4chrome.com"
				}],
				"社区": [{
					"hl": "知乎",
					"shl": "知识分享社区",
					"img": "zhihu",
					"url": "zhihu.com"
				}, {
					"hl": "百度贴吧",
					"shl": "最大的中文社区",
					"img": "tieba",
					"url": "tieba.baidu.com"
				}, {
					"hl": "微博",
					"shl": "随时随地发现新鲜事",
					"img": "weibo",
					"url": "weibo.com"
				}, {
					"hl": "HWClub",
					"shl": "华为花粉俱乐部",
					"img": "hwfans",
					"url": "club.huawei.com"
				}, {
					"hl": "Github",
					"shl": "开源的代码网页托管平台",
					"img": "github",
					"url": "github.com"
				}, {
					"hl": "Gitee",
					"shl": "国内最大代码网页托管平台",
					"img": "gitee",
					"url": "gitee.com"
				}, {
					"hl": "CSDN",
					"shl": "中文IT技术交流平台",
					"img": "csdn",
					"url": "csdn.net"
				}, {
					"hl": "吾爱破解",
					"shl": "破解软件分享",
					"img": "52pojie",
					"url": "52pojie.cn"
				}, {
					"hl": "IT之家",
					"shl": "前沿科技新闻网站",
					"img": "IThome",
					"url": "ithome.com"
				}, {
					"hl": "36Kr",
					"shl": "互联网创业资讯",
					"img": "kr36",
					"url": "36kr.com"
				}, {
					"hl": "少数派",
					"shl": "高质量应用推荐",
					"img": "sspai",
					"url": "sspai.com"
				}, {
					"hl": "爱范儿",
					"shl": "泛科技媒体",
					"img": "ifanr",
					"url": "ifanr.com"
				}, {
					"hl": "ZEALER",
					"shl": "电子产品评测网站",
					"img": "zealer",
					"url": "zealer.com"
				}, {
					"hl": "瘾科技",
					"shl": "科技新闻和测评媒体",
					"img": "engadget",
					"url": "cn.engadget.com"
				}, {
					"hl": "虎嗅网",
					"shl": "科技媒体",
					"img": "huxiu",
					"url": "huxiu.com"
				}, {
					"hl": "品玩",
					"shl": "科技媒体",
					"img": "pingwest",
					"url": "pingwest.com"
				}, {
					"hl": "简书",
					"shl": "优质原创的内容社区",
					"img": "jianshu",
					"url": "jianshu.com"
				}, {
					"hl": "V2EX",
					"shl": "关于分享和探索的地方",
					"img": "v2ex",
					"url": "v2ex.com"
				}],
				"视频": [{
					"hl": "斗鱼",
					"shl": "每个人的直播平台",
					"img": "douyu",
					"url": "douyu.com"
				}, {
					"hl": "虎牙",
					"shl": "中国领先的互动直播平台",
					"img": "huya",
					"url": "huya.com"
				}, {
					"hl": "抖音",
					"shl": "记录美好生活的视频平台",
					"img": "douyin",
					"url": "douyin.com"
				}, {
					"hl": "CC直播",
					"shl": "网易旗下直播平台",
					"img": "cc",
					"url": "cc.163.com"
				}, {
					"hl": "B站",
					"shl": "国内知名视频弹幕网站",
					"img": "bilibili",
					"url": "bilibili.com"
				}, {
					"hl": "爱奇艺",
					"shl": "中国领先的视频门户",
					"img": "iqiyi",
					"url": "iqiyi.com"
				}, {
					"hl": "优酷",
					"shl": "热门视频全面覆盖",
					"img": "youku",
					"url": "youku.com"
				}, {
					"hl": "腾讯视频",
					"shl": "腾讯旗下视频网站",
					"img": "tencentvideo",
					"url": "v.qq.com"
				}, {
					"hl": "西瓜视频",
					"shl": "点亮对生活的好奇心",
					"img": "xigua",
					"url": "ixigua.com"
				}, {
					"hl": "芒果TV",
					"shl": "大家都在看的在线视频网站",
					"img": "mgtv",
					"url": "mgtv.com"
				}, {
					"hl": "乐视视频",
					"shl": "乐视旗下在线视频门户",
					"img": "letv",
					"url": "le.com"
				}, {
					"hl": "豆瓣电影",
					"shl": "查看电影影评及电影排行榜",
					"img": "doubanmovie",
					"url": "movie.douban.com"
				}, {
					"hl": "搜狐视频",
					"shl": "搜狐旗下综合视频网站",
					"img": "sohutv",
					"url": "tv.sohu.com"
				}, {
					"hl": "PPTV",
					"shl": "每位用户的网络电视",
					"img": "pptv",
					"url": "pptv.com"
				}, {
					"hl": "YouTube",
					"shl": "世界最大视频共享网站",
					"img": "youtube",
					"url": "youtube.com"
				}, {
					"hl": "Netflix",
					"shl": "会员订阅制的流媒体平台",
					"img": "netflix",
					"url": "netflix.com"
				}],
				"工具": [{
					"hl": "查快递",
					"shl": "快递查询",
					"img": "kuaidi",
					"url": "kuaidi100.com"
				}, {
					"hl": "阿里云盘",
					"shl": "阿里巴巴旗下个人网盘",
					"img": "alicloud",
					"url": "aliyundrive.com"
				}, {
					"hl": "百度网盘",
					"shl": "让美好永远陪伴",
					"img": "baidunetdisk",
					"url": "pan.baidu.com"
				}, {
					"hl": "坚果云",
					"shl": "国内webdav与同步盘",
					"img": "jianguoyun",
					"url": "jianguoyun.com"
				}, {
					"hl": "蓝奏云",
					"shl": "无验证码不限速网盘",
					"img": "lanzou",
					"url": "lanzou.com"
				}, {
					"hl": "文叔叔",
					"shl": "20G免费不限速空间",
					"img": "wenshushu",
					"url": "wenshushu.cn"
				}, {
					"hl": "腾讯微云",
					"shl": "腾讯旗下个人网盘",
					"img": "weiyun",
					"url": "weiyun.com"
				}, {
					"hl": "华为云盘",
					"shl": "华为用户个人云空间",
					"img": "huaweicloud",
					"url": "cloud.huawei.com"
				}, {
					"hl": "花瓣邮箱",
					"shl": "华为旗下个人电子邮箱",
					"img": "petalmail",
					"url": "petalmail.com"
				}, {
					"hl": "网易邮箱",
					"shl": "中国第一大电子邮箱",
					"img": "wangyimail",
					"url": "email.163.com"
				}, {
					"hl": "QQ邮箱",
					"shl": "腾讯旗下个人电子邮箱",
					"img": "qqmail",
					"url": "email.qq.com"
				}, {
					"hl": "Gmail",
					"shl": "Google 免费电子邮件",
					"img": "gmail",
					"url": "email.google.com"
				}, {
					"hl": "Outlook",
					"shl": "微软旗下邮箱日历服务",
					"img": "outlook",
					"url": "outlook.live.com"
				}, {
					"hl": "金山文档",
					"shl": "多人实时协作的在线Office",
					"img": "wps",
					"url": "kdocs.cn"
				}, {
					"hl": "腾讯文档",
					"shl": "一款可多人协作的在线文档",
					"img": "tencentfile",
					"url": "docs.qq.com"
				}, {
					"hl": "石墨文档",
					"shl": "可多人实时协作的云端文档",
					"img": "sm",
					"url": "shimo.im"
				}]
			},
			html =
			'<div class="page-bg"></div><div class="page-choice"><div class="page-content"><ul class="choice-ul">',
			tabHtml = '<li class="current">捷径</li>',
			contentHtml = `<li class="choice-cut swiper-slide">
			<div class="list h2">
				<a class="flex-1 content weather" href="https://quark.sm.cn/s?q=天气"><div>访问中</div><div></div><div></div></a>
				<a class="flex-right content" href="https://broccoli.uc.cn/apps/pneumonia/routes/index" style="linear-gradient(136deg, rgb(97, 71, 183) 0%, rgb(132, 113, 196) 100%)"><p class="hl">新冠肺炎</p><div class="cmp-icon" style="right: 27px; bottom: 20px; width: 47px; height: 45px; background-image: url(img/shortcut/xinguan.png);"></div></a>
			</div>

			<div class="list h3">
				<a class="flex-1 content" href="https://s.weibo.com/top/summary?cate=realtimehot" style="background-image:linear-gradient(135deg, rgb(34, 34, 80) 1%, rgb(60, 60, 89) 100%)"><div class="hl relative">微博热搜榜</div><div class="news-list"></div></a>
			</div>

			<div class="list h2">
				<a class="flex-1 content" href="https://www.zhihu.com/billboard" style="background-image:linear-gradient(135deg, rgb(52, 55, 60) 0%, rgb(77, 78, 86) 100%)"><p class="hl relative">知乎热搜榜</p><div class="audio-list"><div class="audio-swipe"><div class="swiper-wrapper"></div></div></div><div class="cmp-icon" style="width: 146px;height: 99px;right: 10px;bottom: 0;background-image: url(img/shortcut/rebang.png);"></div></a>
			</div>

			<div class="list">
				<a class="flex-1 content" href="https://www.xuexi.cn" style="background-image:linear-gradient(136deg, rgb(255, 81, 81) 0%, rgb(255, 111, 88) 100%)"><p class="hl">学习强国</p><p class="shl">梦想从学习开始</br>事业从实践起步</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp——习近平</p><div class="cmp-icon" style="right: 20px; top: 26px; width: 65px; height: 64px; background-image: url(img/shortcut/xuexi.png);"></div></a>
				<a class="flex-right content" href="https://translate.google.cn/?hl=zh-CN" style="linear-gradient(-36deg, rgb(97, 71, 183) 0%, rgb(132, 113, 196) 99%)"><div class="hl">谷歌翻译</div><div class="cmp-icon" style="right: 22px; bottom: 0px; width: 47px; height: 45px; background-image: url(img/shortcut/fanyi.png);"></div></a>
			</div>

			</li>`;

		$.each(data, function(i, n) {
			tabHtml += "<li>" + i + "</li>";
			contentHtml += '<li class="choice-li swiper-slide">';
			for (var i = 0, l = n.length; i < l; i++) {
				contentHtml += '<a href="http://' + n[i].url + '"><div><img src="img/choice/' + n[i]
					.img + '.png" /><p>' + n[i].hl + '</p><p>' + n[i].shl + '</p></div></a>';
			}
			contentHtml += '</li>';
		});

		// HTML添加到APP
		$('#app').append(html + tabHtml +
			'<span class="active-span"></span></ul><div class="choice-swipe"><ul class="swiper-wrapper"><div style="position:absolute;text-align:center;top:50%;width:100%;margin-top:-64px;color:#444">正在加载页面中...</div></ul></div><div class="bottom-close"></div></div></div>'
		);

		setTimeout(function() {
			$(".page-bg").addClass("animation");
			$(".page-choice").addClass("animation");
		}, 1);

		var dom = $(".choice-ul li");
		var width = dom.width();
		$(".active-span").css("transform", "translate3d(" + (width / 2 - 9) + "px,0,0)");

		// 动画完成后加载，防止过渡动画卡顿
		$(".page-choice").on("transitionend", function(evt) {
			// 过滤掉子元素
			if (evt.target !== this) {
				return;
			}
			$(".page-choice").off("transitionend");
			$('.choice-swipe').find('.swiper-wrapper').html(contentHtml);
			// 绑定事件
			var last_page = 0;

			require(['Swiper'], function(Swiper) {
				var swiper = new Swiper('.choice-swipe', {
					on: {
						slideChange: function() {
							var i = this.activeIndex;
							dom.eq(last_page).removeClass("current");
							$(".active-span").css("transform", "translate3d(" + (
								width * i + width / 2 - 9) + "px,0,0)");
							dom.eq(i).addClass("current");
							last_page = i;
						}
					}
				});

				// 绑定TAB点击事件
				$(".choice-ul").click(function(evt) {
					if (evt.target.nodeName == "LI") {
						swiper.slideTo($(evt.target).index());
					}
				});
			})

			// 绑定关闭按钮事件
			$(".bottom-close").click(function() {
				$(".page-choice").css('pointer-events', 'none').removeClass("animation");
				$(".page-bg").removeClass("animation");
				$(".page-choice").on('transitionend', function(evt) {
					if (evt.target !== this) {
						return;
					}
					$(".page-choice").remove();
					$(".page-bg").remove();
				});
			});

			// 天气
			$.ajax({
				url: "https://bird.ioliu.cn/v2?url=https://ai.sm.cn/quark/1/api?format=json&method=weather",
				type: "get",
				dataType: "json",
				success: function(res) {
					var data = res.data;
					var color1 = data.color1;
					var color2 = data.color2;
					var location = data.location;
					var temp = data.temp;
					var air = data.air;
					var weather = data.weather;
					var html = '<div>' + temp + '</div><div>' + weather + '</div><div>' +
						location + ' · ' + air +
						'</div><div class="cmp-icon" id="lottie-box" style="background-image: url(' +
						data.lottie + ');"></div>';
					$('.weather').html(html).css("background-image",
						"linear-gradient(-33deg," + color1 + " 0%," + color2 + " 99%)");
				}
			})

			//微博热搜榜
			$.ajax({
				url: "https://bird.ioliu.cn/v2?url=https://ai.sm.cn/quark/1/api?format=json&method=weibo",
				type: "get",
				dataType: "json",
				success: function(res) {
					var data = res.data;
					var html = '';
					for (var i = 0, l = data.length; i < l; i++) {
						html +=
							'<div class="news-item"><div class="news-item-count">' +
							(i + 1) + '</div><div class="news-item-title">' + data[i]
							.title +
							'</div><div class="news-item-hot">' + data[i].hot +
							'</div></div>';
					}
					$('.news-list').html(html);
				}
			});
			//知乎热搜榜
			$.ajax({
				url: "https://bird.ioliu.cn/v2?url=https://ai.sm.cn/quark/1/api?format=json&method=zhihu",
				type: "get",
				dataType: "json",
				success: function(res) {
					var data = res.data;
					var html = '';
					for (var i = 0, l = data.length; i < l; i++) {
						html +=
							'<div class="audio-item swiper-slide"><div class="audio-item-icon"></div><div class="audio-item-title">' +
							data[i].title + '</div></div>';
					}
					$('.audio-list').find('.swiper-wrapper').html(html);
					require(['Swiper'], function(Swiper) {
						var swiper = new Swiper('.audio-swipe', {
							allowTouchMove: false,
							height: 54,
							direction: 'vertical',
							slidesPerView: 2,
							slidesPerGroup: 2,
							loop: true,
							autoplay: {
								delay: 5000,
								disableOnInteraction: false,
							},
						});
					})
				}
			}); //知乎热榜

		})
	}

	$(".logo").click(() => {
		setLOGOclickFn();
	}).longPress(() => {
		setLOGOlongpressFn();
	});
	//via x 打开书签页
	function openbookmarksList() {
		var browser = browserInfo();
		if (browser === 'via') {
			location.href = "folder://";
		} else if (browser === 'x') {
			location.href = "x:bm?sort=default";
		}
	}
	//设置LOGOclickFn
	function setLOGOclickFn() {
		if (settings.get("LOGOclickFn") === "bookmarkList") {
			openbookmarksList();
		} else if (settings.get("LOGOclickFn") === "settingsPage") {
			openSettingPage();
		} else if (settings.get("LOGOclickFn") === "choicePage") {
			choice();
		} else {
			alert('单击LOGO功能错误！');
		}
	}
	//设置LOGOlongpressFn
	function setLOGOlongpressFn() {
		if (settings.get("LOGOlongpressFn") === "bookmarkList") {
			openbookmarksList();
		} else if (settings.get("LOGOlongpressFn") === "settingsPage") {
			openSettingPage();
		} else if (settings.get("LOGOlongpressFn") === "choicePage") {
			choice();
		} else {
			alert('长按LOGO功能错误！');
		}
	}
	//设置页面
	function openSettingPage() {
		var autonightMode2AyDes = settings.get('autonightMode2Array');
		//构建设置HTML
		var data = [{
				"type": "hr"
			}, {
				"title": "搜索引擎",
				"type": "select",
				"value": "engines",
				"data": [{
					"t": "夸克搜索",
					"v": "quark"
				}, {
					"t": "跟随Via",
					"v": "via"
				}, {
					"t": "百度搜索",
					"v": "baidu"
				}, {
					"t": "谷歌搜索",
					"v": "google"
				}, {
					"t": "必应搜索",
					"v": "bing"
				}, {
					"t": "神马搜索",
					"v": "sm"
				}, {
					"t": "好搜搜索",
					"v": "haosou"
				}, {
					"t": "搜狗搜索",
					"v": "sogou"
				}, {
					"t": "自定义",
					"v": "diy"
				}]
			}, {
				"title": "图标颜色",
				"type": "select",
				"value": "bookcolor",
				"data": [{
					"t": "深色图标",
					"v": "black"
				}, {
					"t": "浅色图标",
					"v": "white"
				}]
			}, {
				"title": "点击LOGO",
				"type": "select",
				"value": "LOGOclickFn",
				"data": [{
					"t": "打开书签",
					"v": "bookmarkList"
				}, {
					"t": "打开设置",
					"v": "settingsPage"
				}, {
					"t": "打开精选",
					"v": "choicePage"
				}]
			},
			{
				"title": "长按LOGO",
				"type": "select",
				"value": "LOGOlongpressFn",
				"data": [{
					"t": "打开书签",
					"v": "bookmarkList"
				}, {
					"t": "打开设置",
					"v": "settingsPage"
				}, {
					"t": "打开精选",
					"v": "choicePage"
				}]
			}, {
				"title": "设置壁纸",
				"value": "wallpaper"
			}, {
				"title": "设置LOGO",
				"value": "logo"
			}, {
				"type": "hr"
			}, {
				"title": "主页样式细圆",
				"type": "checkbox",
				"value": "styleThin"
			}, {
				"title": "保存搜索栏历史",
				"type": "checkbox",
				"value": "searchHistory"
			}, {
				"title": "夜间模式",
				"type": "checkbox",
				"value": "nightMode"
			}, {
				"title": "自动夜间模式(跟随浏览器)",
				"type": "checkbox",
				"value": "autonightMode"
			}, {
				"title": "自动夜间模式(用户定时)",
				"type": "checkbox",
				"value": "autonightMode2"
			}, {
				"title": "夜间模式定时区间",
				"value": "autonightMode2Array",
				"description": "" + autonightMode2AyDes
			}, {
				"type": "hr"
			}, {
				"title": "备份数据",
				"value": "export",
				"description": "备份主页数据到剪贴板"
			}, {
				"title": "恢复数据",
				"value": "import",
				"description": "从剪贴板恢复主页数据"
			}, {
				"title": "初始化壁纸和LOGO",
				"value": "delLogo",
				"description": "恢复默认壁纸和LOGO"
			}, {
				"title": "初始化书签和设置",
				"value": "intibookMark",
				"description": "恢复默认书签和设置(除主题和LOGO两项之外)"
			}, {
				"type": "hr"
			}, {
				"title": "关于",
				"value": "aboutVersion",
				"description": "当前版本:" + app.version + " (点击检查更新)"
			}, {
				"title": "Github",
				"value": "openGithub",
				"description": "https://github.com/IcedWatermelonJuice/HMOSHomePage"

			}, {
				"title": "Gitee(可能不是最新版本)",
				"value": "openGitee",
				"description": "https://gitee.com/gem_xl/HMOSHomePage"

			}
		];
		var html =
			'<div class="page-settings"><div class="set-header"><div class="set-back"></div><p class="set-logo">自     定     义     设     置</p></div><ul class="set-option-from">';
		for (var json of data) {
			if (json.type === 'hr') {
				html += `<li class="set-hr"></li>`;
			} else {
				html += `<li class="set-option" ${json.value ? `data-value="${json.value}"` : ''}>
							<div class="set-text">
								<p class="set-title">${json.title}</p>
								${json.description ? `<div class="set-description">${json.description}</div>` : ''}
							</div>`;
				if (json.type === 'select') {
					html += `<select class="set-select">`;
					for (var i of json.data) {
						html += `<option value="${i.v}">${i.t}</option>`;
					}
					html += `</select>`;
				} else if (json.type === 'checkbox') {
					html +=
						`<input type="checkbox" class="set-checkbox" autocomplete="off"><label></label>`;
				}
				html += `</li>`;
			}
		}
		html += '</ul></div>';
		$('#app').append(html);
		$(".page-settings").show();
		$(".page-settings").addClass('animation');
		// 只有via浏览器才在搜索引擎设置里显示跟随via选项
		var browser = browserInfo();
		if (browser !== 'via') {
			$('option[value=via]').hide();
		}
		// 只有via或x浏览器才在点击/长按LOGO设置里显示打开书签选项
		if ((browser !== 'via') && (browser !== 'x')) {
			$('option[value=bookmarkList]').hide();
		}
		//屏蔽via浏览器的自动夜间模式
		if (browser === 'via') {
			$("li[data-value=autonightMode]").hide();
		}
		//开启自动夜间模式==>屏蔽夜间模式选项+自动夜间模式2
		if (settings.get('autonightMode') === true) {
			$("li[data-value=nightMode]").hide();
			$("li[data-value=autonightMode2]").hide();
		} else {
				$("li[data-value=autonightMode2]").show();
		}
		//开启自动夜间模式2==>屏蔽夜间模式选项+自动夜间模式
		if (settings.get('autonightMode2') === true) {
			$("li[data-value=nightMode]").hide();
			$("li[data-value=autonightMode]").hide();
			$("li[data-value=autonightMode2Array]").show();
		} else {
			if(browser !== 'via'){
				$("li[data-value=autonightMode]").show();
			}
			
			$("li[data-value=autonightMode2Array]").hide();
		}
		//只有自动夜间模式1、2均关闭才显示夜间模式
		if ((settings.get('autonightMode') === false) && (settings.get('autonightMode2') === false)) {
			$("li[data-value=nightMode]").show();
		}


		$(".set-option .set-select").map(function() {
			$(this).val(settings.get($(this).parent().data('value')));
		});

		$(".set-option .set-checkbox").map(function() {
			$(this).prop("checked", settings.get($(this).parent().data('value')));
		});

		$(".set-back").click(function() {
			$(".page-settings").css("pointer-events", "none").removeClass("animation");
			$(".page-settings").on('transitionend', function(evt) {
				if (evt.target !== this) {
					return;
				}
				$(".page-settings").remove();
			});
		});

		$(".set-option").click(function(evt) {
			var $this = $(this);
			var value = $this.data("value");
			if (value === "wallpaper") {
				openFile(function() {
					var file = this.files[0];
					var reader = new FileReader();
					reader.onload = function() {
						settings.set('wallpaper', this.result);
					};
					reader.readAsDataURL(file);
				});
			} else if (value === "logo") {
				openFile(function() {
					var file = this.files[0];
					var reader = new FileReader();
					reader.onload = function() {
						settings.set('logo', this.result);
					};
					reader.readAsDataURL(file);
				});
			} else if (value === "delLogo") {
				let delLogoConfirm = confirm("将删除自定义壁纸和LOGO,恢复默认壁纸和LOGO!");
				if (delLogoConfirm === true) {
					settings.set('wallpaper', '');
					settings.set('logo', '');
					alert('壁纸和LOGO初始化成功!');
					location.reload(false);
				} else {
					alert('已取消初始化!');
				}

			} else if (value === "intibookMark") {
				let intibookMarkConfirm = confirm("将恢复默认书签、默认设置(自定义LOGO与壁纸设置除外的设置)!");
				if (intibookMarkConfirm === true) {
					store.set("bookMark", bookMark.getinitbookMarks());
					store.set("setData", settings.getinitSettings());
					alert('书签和设置初始化成功!');
					location.reload(false);
				} else {
					alert('已取消初始化!');
				}

			} else if (value === "openGithub") {
				// open($this.find('.set-description').text());
				//kiwi本地页面暂时无法使用open()方法,替换为location.href方法
				location.href = $this.find('.set-description').text();
			} else if (value === "openGitee") {
				// open($this.find('.set-description').text());
				//kiwi本地页面暂时无法使用open()方法,替换为location.href方法
				location.href = $this.find('.set-description').text();
			} else if (value === "aboutVersion") {
				getnewVersion();
				let alertMessage = '当前版本: ' + app.version + '\n最新版本: ' + getnewVersion() +
					'\n本作作者: IcedWatermelonJuice\n原作作者: liumingye\n联系邮箱: gem_xl@petalmail.com';
				alert(alertMessage);
			} else if (value === "export") {
				var oInput = $('<input>');
				// oInput.val('{"bookMark":' + JSON.stringify(bookMark.getJson()) + '}');
				oInput.val('{"bookMark":' + JSON.stringify(bookMark.getJson()) + ',"setData":' +
					JSON.stringify(settings.getJson()) + '}');
				document.body.appendChild(oInput[0]);
				console.log(store.get('bookMark'));
				oInput.select();
				document.execCommand("Copy");
				alert('主页数据已备份到剪贴板!');
				oInput.remove();
			} else if (value === "import") {
				var data = prompt("在这粘贴备份的主页数据:");
				try {
					data = JSON.parse(data);
					store.set("bookMark", data.bookMark);
					store.set("setData", data.setData);
					alert("主页数据恢复入成功!");
					location.reload();
				} catch (e) {
					alert("主页数据恢复失败!");
				}
			} else if (value === "autonightMode2Array") {
				autoNightMode2Fn.getSetTime();
				location.reload(false);
			} else if (evt.target.className !== 'set-select' && $this.find('.set-select')
				.length > 0) {
				$.fn.openSelect = function() {
					return this.each(function(idx, domEl) {
						if (document.createEvent) {
							var event = document.createEvent("MouseEvents");
							event.initMouseEvent("mousedown", true, true, window, 0,
								0, 0, 0, 0, false, false, false, false, 0, null);
							domEl.dispatchEvent(event);
						} else if (element.fireEvent) {
							domEl.fireEvent("onmousedown");
						}
					});
				}
				$this.find('.set-select').openSelect();
			} else if (evt.target.className !== 'set-checkbox' && $this.find('.set-checkbox')
				.length > 0) {
				$this.find('.set-checkbox').prop("checked", !$this.find('.set-checkbox').prop(
					"checked")).change();
			}
		});

		$(".set-select").change(function() {
			var dom = $(this),
				item = dom.parent().data("value"),
				value = dom.val();
			if (item === "engines" && value === "diy") {
				var engines = prompt("输入搜索引擎网址，（用“%s”代替搜索字词）");
				console.log(engines);
				if (engines) {
					settings.set('diyEngines', engines);
				} else {
					dom.val(settings.get('engines'));
					return false;
				}
			}

			// 保存设置
			settings.set(item, value);
		});

		$(".set-checkbox").change(function() {
			var dom = $(this),
				item = dom.parent().data("value"),
				value = dom.prop("checked");
			// 应用设置
			if (item === 'styleThin' && value === true) {
				$("body").addClass('styleThin');
			} else if (item === 'styleThin' && value === false){
				$("body").removeClass('styleThin');
			}
			if (item === 'autonightMode' && value === true) {
				$("li[data-value=nightMode]").hide();
				$("li[data-value=autonightMode2]").hide();
			} else if (item === 'autonightMode' && value === false){
				$("li[data-value=autonightMode2]").show();
				if (settings.get('autonightMode2') === false) {
					$("li[data-value=nightMode]").show();
				}
			}
			if (item === 'autonightMode2' && value === true) {
				$("li[data-value=nightMode]").hide();
				$("li[data-value=autonightMode]").hide();
				$("li[data-value=autonightMode2Array]").show();
			} else if (item === 'autonightMode2' && value === false){
				if(browser !== 'via'){
					$("li[data-value=autonightMode]").show();
				}
				if (settings.get('autonightMode') === false) {
					$("li[data-value=nightMode]").show();
				}
				$("li[data-value=autonightMode2Array]").hide();
			}
			// 保存设置
			settings.set(item, value);
		});

	}
	//检测新版本(版号来源Github)
	function getnewVersion() {
		var newVersion = "fail to get newVersion";
		$.ajax({
			url: "https://bird.ioliu.cn/v2?url=https://icedwatermelonjuice.github.io/HMOSHomePage/",
			async: false,
			success: function(result) {
				newVersion = result.slice(result.search("version:") + "version:"
					.length, result.length - 1);
			},
		});
		return newVersion;
	}

	//设置点击/长按LOGO功能冲突检测
	function DetectLogoFnConflicts() {
		//settingsPage
		if ((settings.get("LOGOclickFn") !== "settingsPage") && (settings.get("LOGOlongpressFn") !==
				"settingsPage")) {
			if (!bookMark.searchURL("openSettingPage()")) {
				setTimeout(function() {
					if ((settings.get("LOGOclickFn") !== "settingsPage") && (settings.get(
							"LOGOlongpressFn") !== "settingsPage")) {
						if (!bookMark.searchURL("openSettingPage()")) {
							settings.set("LOGOclickFn", settings.initStorage["LOGOclickFn"]);
							settings.set("LOGOlongpressFn", settings.initStorage["LOGOlongpressFn"]);
							alert('检测到LOGO功能与主页书签中均无设置，已重置LOGO功能');
							location.reload(false);
						};
					}
				}, 5000);
			}
		}
	}
	//2s定时器，用于自动夜间模式 和 设置点击/长按LOGO功能冲突
	function IntervalFnSet() {
		autoNightModeOn();
		DetectLogoFnConflicts();
	}
	setInterval(IntervalFnSet, 3000);

	// 下滑进入搜索
	require(['touchSwipe'], function() {
		$(".page-home").swipe({
			swipeStatus: function(event, phase, direction, distance, duration, fingerCount,
				fingerData) {
				if ($('.delbook').length !== 0) {
					return;
				}
				if (phase === 'start') {
					this.height = $(document).height();
				} else if (phase === 'move') {
					var sliding = Math.max(fingerData[0].end.y - fingerData[0].start.y, 0);
					$('.logo').attr("disabled", true).css({
						'opacity': 1 - (sliding / this.height) * 4,
						'transition-duration': '0ms'
					});
					$('.ornament-input-group').css({
						'transform': 'translate3d(0,' + Math.min((sliding / this
							.height) * 80, 30) + 'px,0)',
						'transition-duration': '0ms'
					});
					$('.bookmark').attr("disabled", true).css({
						'opacity': 1 - (sliding / this.height) * 4,
						'transform': 'scale(' + (1 - (sliding / this.height) * .3) +
							')',
						'transition-duration': '0ms'
					});
				} else if (phase === 'end' || phase === 'cancel') {
					$('.logo').removeAttr("disabled style");
					$('.bookmark').removeAttr("disabled style");
					if (distance >= 100 && direction === "down") {
						$('.ornament-input-group').css("transform", "").click();
						$('.logo,.bookmark,.anitInput').css('opacity', '0');
						$('.input-bg').css('border-color', 'var(--dark)');
						setTimeout(function() {
							$('.logo,.bookmark').css('opacity', '');
						}, 300);
					} else {
						$('.ornament-input-group').removeAttr("style");
					}
				}
			}
		});
	})

})
