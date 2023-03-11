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
	var settingsFn = function(storage, browser) {
		this.storage = {
			devMode: false,
			engines: "baidu",
			bookcolor: "black",
			booknumber: "Num4",
			LOGOclickFn: "choicePage",
			LOGOlongpressFn: "settingsPage",
			LogoHeightSet: "40",
			position: "0",
			styleThin: true,
			searchHistory: false,
			SetbookMarksADD: true,
			SetbookMarksDisplay: true,
			SEQuickChange: true,
			nightMode: false,
			autonightMode: false,
			autonightMode2: false,
			autonightMode2Array: "20:00-8:00",
			customJsCss: false,
			voiceInput: false,
			fullscreenInput: false,
			chromeBookmarks: "chrome://bookmarks/",
			weatherApiIdKey: null
		};
		var defaultLogoHeight = Math.floor($(".logo").width() * (84 / 436));
		this.storage.LogoHeightSet = defaultLogoHeight < 40 ? String(defaultLogoHeight) : "40";
		var extraStorage = {};
		if (browser === 'via') {
			extraStorage = {
				LOGOclickFn: "bookmarkList"
			};
		} else if (browser === 'x') {
			extraStorage = {
				LOGOclickFn: "bookmarkList",
				autonightMode: true
			};
		} else if (navigator.userAgent.search("Chrome") !== -1 && navigator.userAgent.search("Mobile") !== -
			1) {
			extraStorage = {
				autonightMode: true
			};
		}
		this.storage = $.extend({}, this.storage, extraStorage);
		this.initStorage = this.storage;
		this.storage = $.extend({}, this.storage, storage);
	}
	settingsFn.prototype = {
		getJson: function() {
			return this.storage;
		},
		getinitSettings: function(key) {
			if (key) {
				return this.initStorage[key];
			} else {
				return this.initStorage;
			}
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
		//设置LOGO
		setLogo: function() {
			var logoUrl, logoHeight;
			if (this.get('logo')) {
				logoUrl = this.get('logo');
			} else {
				if (this.get('nightMode')) {
					logoUrl = "logo/HarmonyOS_logo(for nightMode).png";
				} else {
					logoUrl = "logo/HarmonyOS_logo.png";
				}
			}
			if (this.get('LogoHeightSet')) {
				logoHeight = this.get('LogoHeightSet');
			} else {
				logoHeight = "40";
			}
			var newcss = {
				'height': logoHeight + 'px',
				'background': 'url("' + logoUrl + '") no-repeat',
				'background-size': "auto 100%",
				'background-position': 'center',
			};
			return newcss;
		},
		// 应用设置项
		apply: function() {
			var that = this;
			// 样式细圆
			if (that.get('styleThin')) {
				$("body").addClass('styleThin');
			}
			$('.ornament-input-group').removeAttr('style');
			// 控制顶部距离
			if (that.get('position')) {
				$("#empty_box").css("marginTop", that.get('position') + "px");
			}
			// 加载LOGO
			$(".logo").css(that.setLogo());
			// 隐藏书签栏
			if (!that.get('SetbookMarksDisplay')) {
				$(".bookmark_outer_container").addClass("hide");
			}
			// 隐藏搜索引擎快切栏
			if (!that.get('SEQuickChange')) {
				$(".quick-change").hide();
			}
			// 夜间模式 和 壁纸 LOGO
			var nightMode = {
				on: function() {
					$("body").removeClass('theme-black theme-white').addClass('theme-white');
					$("body").css("background-image", "");
					$("#nightCss").removeAttr('disabled');
					$(".logo").css(that.setLogo());
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
					$(".logo").css(that.setLogo());
				}
			};
			if (that.get('nightMode') === true) {
				nightMode.on();
			} else {
				nightMode.off();
			}
			// 语音输入
			if(that.get('voiceInput') === true){
				$(".input-bg").addClass("voice-input-active");
			}else{
				$(".input-bg").removeClass("voice-input-active");
			}
			// 长文本输入
			if(that.get('fullscreenInput') === true){
				$(".fullscreen-input").show();
			}else{
				$(".fullscreen-input").hide();
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

	var autoNightMode2Fn = {
		getSetTime: function() {
			let setTime = prompt("请输入开启时间,格式为:hh:mm-hh:mm,例如:20:00-8:00");
			try {
				let setTimeFlag0 = setTime.search("-");
				let setTimeFlag1 = setTime.search(":");
				let setTimeFlag2 = setTime.slice(setTimeFlag0).search(":");
				let alertMessage = "输入时间格式错误:";
				if (setTimeFlag0 === -1) {
					alertMessage += "\n区间间隔'-'丢失!";
				}
				if (setTimeFlag1 === -1) {
					alertMessage += "\n开始时间':'丢失!";
				}
				if (setTimeFlag2 === -1) {
					alertMessage += "\n结束时间':'丢失!";
				}
				if ((setTimeFlag0 !== -1) && (setTimeFlag1 !== -1) && (setTimeFlag2 !== -1)) {
					settings.set('autonightMode2Array', setTime);
					alert("时间设定成功!");
				} else {
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
		on: function() {
			if (settings.get('nightMode') === false) {
				settings.set('nightMode', true);
			}
		},
		off: function() {
			if (settings.get('nightMode') === true) {
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
			let setTimeArray = autoNightMode2Fn.changeSetTime();
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

	//每行图标数量设置
	function getbooknumber() {
		if (settings.get("booknumber") === "Num4") {
			return "";
		} else if (settings.get("booknumber") === "Num5") {
			return "repeat(5,20%)";
		} else if (settings.get("booknumber") === "Num6") {
			return "repeat(6,16.66%)";
		} else if (settings.get("booknumber") === "Num7") {
			return "repeat(7,14.28%)";
		} else if (settings.get("booknumber") === "Num8") {
			return "repeat(8,12.5%)";
		} else {
			return "";
			alert("set bookmarks number error");
		}
	}

	function bookmarkNumSet() {
		$(".bookmark").css("gridTemplateColumns", getbooknumber());
	}

	//LOGO高度设置:
	var LogoHeightFn = {
		set: function() {
			let settingHeight = settings.get("LogoHeightSet");
			let LogoOBJ = document.getElementsByClassName("logo")[0];
			let logoHeight = LogoOBJ.clientHeight.toString();
			if (logoHeight !== settingHeight) {
				if (settingHeight === "40") {
					LogoOBJ.style.height = "";
				} else {
					LogoOBJ.style.height = settingHeight + "px";
				}
			}
		},
		get: function() {
			var defaultHeight = settings.getinitSettings("LogoHeightSet");
			let setHeight = prompt("设置LOGO高度(非负数,单位px,像素),例如:" + defaultHeight + "\n备注:" +
				defaultHeight + "为默认高度,当为高度=0时,LOGO不显示");
			try {
				HeightNum = parseFloat(setHeight);
				if (HeightNum >= 0) {
					settings.set("LogoHeightSet", setHeight);
					alert("高度设置成功!");
				} else {
					alert("高度设定失败:\n请输入非负的高度值!");
				}
			} catch (e) {
				alert("高度设定失败!");
			}
		},
		auto: function(logoHeight, logoWidth) {
			var defaultHeight = settings.get("LogoHeightSet");
			if (logoHeight && logoWidth) {
				defaultHeight = Math.floor($(".logo").width() * (logoHeight / logoWidth));
				defaultHeight = String(defaultHeight);
			}
			return defaultHeight;
		}
	}

	//整体偏离默认位置设置(通过设置empty_box这个空容器的margin-top来改变偏移)
	var PositionFn = {
		set: function() {
			let settingsPosition = settings.get('position');
			settingsPosition = settingsPosition + "px";
			let boxOBJ = document.getElementById("empty_box");
			let currentPosition = boxOBJ.style.marginTop;
			if (currentPosition === "") {
				currentPosition = "0px";
			}
			if (currentPosition !== settingsPosition) {
				if (settingsPosition === "0px") {
					boxOBJ.style.marginTop = "0px";
				} else {
					boxOBJ.style.marginTop = settingsPosition;
				}
			}
		},
		get: function() {
			let setPosition = prompt(
				"设置相对位置(偏移度单位为px,像素),负数:向上偏移,正数:向下偏移,例如:输入+100,表示向下偏移100px\n备注:0为默认值,表示不偏移");
			try {
				setPosition = setPosition.trim();
				if (!isNaN(Number(setPosition)) && setPosition !== "") {
					settings.set("position", setPosition);
					alert("位置设置成功!");
				} else {
					alert("位置设定失败:\n请输入一个数值!");
				}
			} catch (e) {
				alert("位置设定失败!");
			}
		}

	}
	/**
	 * DOM是否存在某个attribute
	 */
	$.fn.hasAttr = function(attr) {
		return this.attr(attr) !== undefined
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
						fn($this);
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
				"name": "设置",
				"url": "openSettingPage()",
				"icon": "img/bookmarks/settings.png"
			}, {
				"name": "AirPortal",
				"url": "https://airportal.cn",
				"icon": "img/bookmarks/airportal.png"
			},{
				"name": "Github",
				"url": "https://github.com",
				"icon": "img/bookmarks/github.png"
			}, {
				"name": "Nga",
				"url": "https://nga.178.com/thread.php?fid=524",
				"icon": "img/bookmarks/nga.png"
			}, {
				"name": "Pixiv",
				"url": "https://www.pixiv.net/novel/bookmark_new.php",
				"icon": "img/bookmarks/pixiv.png"
			}, {
				"name": "Hostloc",
				"url": "https://hostloc.com",
				"icon": "img/bookmarks/hostloc.png"
			}, {
				"name": "Hanime1",
				"url": "https://hanime1.me",
				"icon": "img/bookmarks/hanime1.png"
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
			bookmarkNumSet();
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
			var res = false;
			for (let i = 0; i < data.length; i++) {
				if (data[i].url === url) {
					res = true;
					break;
				}
			}
			return res;
		},
		insertPage: function(siteData) {
			var libData = this.getinitbookMarks();
			var libHTML = "";
			for (let i in libData) {
				libHTML +=
					`<div index="${i}"><img src="${libData[i].icon}"><p>${libData[i].name}</p></div>`;
			}
			$('#app').append(`<div class="page-bg"></div>
			<div class="page-addbook">
				<ul class="addbook-choice">
					<li value="custom" class="current">自定义书签</li>
					<li value="default">默认书签库</li>
					<span class="active-span"></span>
				</ul>
				<div class="addbook-content">
					<div class="addbook-sites" value="custom">
					<input type="text" class="addbook-input addbook-url" placeholder="输入网址" value="https://" />
					<input type="text" class="addbook-input addbook-name" placeholder="输入网站名" />
						<div id="addbook-upload">点击选择图标</div>
						<div id="addbook-autofetch">点击自动获取图标</div>
						<div class="addbook-ok">确认添加</div>
					</div>
					<div class="addbook-sites hide" value="default">
					<div class="addbook-sitesLib">${libHTML}</div>
					</div>
					</div>
					<div class="bottom-close"></div>
				</div>
			</div>`);
			if (siteData) {
				$(".page-addbook .addbook-url").val(siteData.url);
				$(".page-addbook .addbook-name").val(siteData.name);
				$(".page-addbook #addbook-upload").html(
					`<img src="${siteData.img}"></img><p>原书签图标</p>`);
				$(".page-addbook .addbook-ok").text("确认修改");
			}

			history.pushState(null, document.title, changeParam("page", siteData ? "editbook" :
				"addbook"));

			setTimeout(function() {
				$(".page-bg").addClass("animation");
				$(".addbook-choice").addClass("animation");
				$(".addbook-content").addClass("animation");
			}, 50);

			function drawIcon(name) {
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
				return canvas.toDataURL("image/png");
			}
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
					$(".addbook-ok").css(
						"pointer-events",
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
			$("#addbook-autofetch").click(function() {
				var t = $("#addbook-autofetch").attr("auto_timer");
				if (t) {
					alert("正在获取,请稍后");
					return false
				}
				var url = $(".addbook-url").val(),
					ImgObj = new Image();
				if (url.search("http") === -1) {
					url = "https://" + url;
				}
				var urlArr = url.split("/");
				ImgUrl = urlArr[2];
				if (ImgUrl) {
					ImgUrl = "https://" + ImgUrl +
						"/favicon.ico";
					ImgObj.src = ImgUrl;
					t = setInterval(() => {
						if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height >
								0)) {
							clearInterval(t);
							$("#addbook-autofetch").removeAttr("auto_timer")
							alert("图标获取成功");
							$("#addbook-upload").html('<img src="' + ImgUrl +
								'"></img><p>自动获取的favicon</p>');
						}
						console.log("autofetch", $("#addbook-autofetch").attr(
							"auto_timer"))
					}, 200)
					$("#addbook-autofetch").attr("auto_timer", t);
				}
				setTimeout(() => {
					clearInterval(t);
					if ($("#addbook-autofetch").attr("auto_timer")) {
						$("#addbook-autofetch").removeAttr("auto_timer");
						if ($(".addbook-name").val()) {
							$("#addbook-upload").html('<img src="' + drawIcon($(
									".addbook-name").val()) +
								'"></img><p>自动生成的文字图标</p>');
						}
						alert(
							"图标获取失败\n请检查URL或再次尝试。如果多次获取都失败，可能对方服务器禁止获取网站favicon.ico或favicon.ico不存在"
						);
					}
				}, 2000)
			});
			$(".addbook-ok").click(function() {
				var name = $(".addbook-name").val(),
					url = $(".addbook-url").val(),
					icon = $("#addbook-upload img").attr("src");
				if (name.length && url.length) {
					if (!icon) {
						// 绘制文字图标
						icon = drawIcon(name);
					}
					$(".bottom-close").click();
					if (siteData && siteData.index) {
						bookMark.edit(siteData.index, name, url, icon);
					} else {
						bookMark.add(name, url, icon);
					}
				}
			});
			$(".bottom-close").click(function() {
				history.replaceState(null, document.title, location.origin + location.pathname);
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
			$(".addbook-choice").click(function(evt) {
				let target = evt.target;
				if (target.tagName === "LI" && !target.classList.contains("current")) {
					let value = target.getAttribute("value");
					$(target).siblings("li").removeClass("current")
					$(target).addClass("current");
					let index = $(".addbook-choice li").index(target);
					$(".active-span").css("transform", `translateX(${index*112}px)`);
					$(".addbook-sites").each(function(i, ele) {
						$(ele).addClass("hide");
					})
					$(`.addbook-sites[value=${value}]`).removeClass("hide");
				}
			});
			$(".addbook-sitesLib").click(function(evt) {
				let target = evt.target;
				target = /p|img/i.test(target.tagName) ? target.parentElement : target;
				let index = target.getAttribute("index");
				if (index) {
					let data = bookMark.getinitbookMarks();
					data = data[index];
					if (siteData) {
						bookMark.edit(siteData.index, data.name, data.url, data.icon);
					} else {
						bookMark.add(data.name, data.url, data.icon);
					}
					$(".bottom-close").click();
				}
			})
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
					$(document).click(function() {
						$(document).unbind("click");
						$('.logo,.ornament-input-group').css('pointer-events', '');
						$(".delbook").addClass("animation");
						$(".editbook").addClass("animation");
						function transitionend(evt){
							if (evt.target !== this) {
								return;
							}
							this.remove();
							if(typeof that.$ele.sortable==="function"){
								that.$ele.sortable("destroy");
							}
							that.status = "";
						}
						$(".delbook").on('transitionend', transitionend);
						$(".editbook").on('transitionend', transitionend);
					});
					var $list = that.$ele.find(".list");
					for (var i = $list.length; i > -1; i--) {
						$list.eq(i).find(".img").prepend('<div class="delbook"></div>');
						$list.eq(i).find(".img").prepend('<div class="editbook"></div>');
					}
				}
			});
			this.$ele.on('click', function(evt) {
				if (evt.target !== this || that.status === 'editing' || $('.addbook').hasClass(
						'animation') || data.length >= 20) {
					return;
				}
				if (settings.get("SetbookMarksADD") === true) {
					if ($('.addbook').length === 0) {
						that.$ele.append(
							'<div class="list addbook"><div class="img"><svg viewBox="0 0 1024 1024"><path class="st0" d="M673,489.2H534.8V350.9c0-12.7-10.4-23-23-23c-12.7,0-23,10.4-23,23v138.2H350.6c-12.7,0-23,10.4-23,23c0,12.7,10.4,23,23,23h138.2v138.2c0,12.7,10.4,23,23,23c12.7,0,23-10.4,23-23V535.2H673c12.7,0,23-10.4,23-23C696.1,499.5,685.7,489.2,673,489.2z" fill="#222"/></svg></div></div>'
						);
						$('.addbook').click(function() {
							$('.addbook').remove();
							// 取消书签编辑状态
							$(document).click();
							// 插入html
							that.insertPage();
						})
					} else {
						$(".addbook").addClass("animation");
						setTimeout(function() {
							$(".addbook").remove();
						}, 400);
					}
				} else {
					if ($('.addbook').length !== 0) {
						$(".addbook").remove();
					}
				}

			});
			this.$ele.on('click', '.list', function(evt) {
				evt.stopPropagation();
				var dom = $(evt.currentTarget);
				if (that.status !== "editing") {
					var url = dom.data("url");
					if (url) {
						console.log(url)
						switch (url) {
							case "choice()":
								choice();
								break;
							case "openSettingPage()":
								openSettingPage();
								break;
							case "openbookmarksList()":
								openbookmarksList();
								break;
							case "openscanWebsite()":
								openscanWebsite();
								break;
							default:
								location.href = url;
						}
					}
				} else {
					if (evt.target.className === "delbook") {
						that.del(dom.index());
					} else if (evt.target.className === "editbook") {
						var siteData = {
							index: dom.index(),
							url: dom.data("url"),
							name: dom.find(".text").text(),
							img: dom.find("div.img")[0].style.backgroundImage.replace(
								`url("`, "").replace(`")`, "")
						}
						// 取消书签编辑状态
						$(document).click();
						// 插入html
						that.insertPage(siteData);
					}
				}
			});
		},
		del: function(index) {
			var that = this;
			var data = this.options.data;
			if (this.getJson().length <= 1) {
				alert("书签数量必须>1\n如果想要隐藏书签，请前往设置页面");
				return false;
			}
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
			if (!/choice()|openSettingPage()|openbookmarksList()|openscanWebsite()/i.test(url)) {
				url = url.match(/:\/\//) ? url : "https://" + url;
			}
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
		},
		edit: function(index, name, url, icon) {
			var data = this.options.data;
			if (!/choice()|openSettingPage()|openbookmarksList()|openscanWebsite()/i.test(url)) {
				url = url.match(/:\/\//) ? url : "http://" + url;
			}
			if (icon === "") {
				icon = data[index].icon;
			}
			var book = $(".bookmark").find('.list').eq(index);
			book.find('.text').text(name);
			book.data("url", url);
			book.find('.img').css("background-image", "url(" + icon + ")");
			data[index] = {
				name: name,
				url: url,
				icon: icon
			};
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
			$(".input-bg").addClass("animation").css("border-color", "var(--dark)");
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
		if ($(".page-choice").is(":visible")) {
			$(".page-choice .bottom-close").click();
		}
		if ($(".page-addbook").is(":visible")) {
			$(".page-addbook .bottom-close").click();
		}
		if ($(".page-settings").is(":visible")) {
			$(".page-settings .set-back").click();
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
				/^\b((((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:cn|com|net|org|int|edu|gov|io|app|mil|arpa|asia|biz|info|name|pro|coop|aero|museum|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?))|(file:\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])$/i
				.test(wd) ? "进入" : "搜索");
			if (wd.search("file://") !== -1) {
				$(".search-btn").html("进入");
			}
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

	$(".fullscreen-input").click(function() {
		$(".fullscreen-search-page-body textarea").val($(".search-input").val());
		$(".page-search .entire-search-page").hide();
		$(".page-search .fullscreen-search-page").show();
	});
	$(".fullscreen-search-page-header svg").click(function() {
		$(".search-input").val($(".fullscreen-search-page-body textarea").val());
		$(".page-search .fullscreen-search-page").hide();
		$(".page-search .entire-search-page").show();
		$(".search-input").trigger("propertychange");
	})
	$(".fullscreen-search-page-body textarea").focus(function() {
		var dom = $(".fullscreen-search-page-foot div[svg-keyboard-normal]");
		dom.removeAttr("svg-keyboard-normal").attr("svg-keyboard-select", "").remove("delay");
	}).blur(function() {
		var dom = $(".fullscreen-search-page-foot div[svg-keyboard-select]");
		dom.removeAttr("svg-keyboard-select").attr("svg-keyboard-normal", "").attr("delay", "");
		setTimeout(() => {
			dom.removeAttr("delay");
		}, 500)
	})
	$(".fullscreen-search-page-foot div").click(function(e) {
		e = $(e.currentTarget);
		console.log(e)
		if (e.hasAttr("svg-keyboard-normal") && !e.hasAttr("delay")) {
			$(".fullscreen-search-page-body textarea").focus();
		}
	})
	$(".fullscreen-search-page-foot button").click(function() {
		$(".fullscreen-search-page-header svg").click();
		$(".search-btn").click();
	})

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
				if (location.href.search("chrome-extension://") !== -1 && text.search(
						"file://") !== -1) {
					alert("CRX插件版主页暂不支持访问本地file文件");
				} else if (location.href.search("http") !== -1 && text.search("file://") !== -
					1) {
					alert("在线网页版主页暂不支持访问本地file文件");
				} else {
					location.href = text;
				}
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

	$(".quick-change .content").click(function(evt) {
		var tar = evt.target;
		if (tar.nodeName === "LI") {
			var type = tar.getAttribute("name");
			if (settings.get("engines") !== type) {
				if (type === "diy" && !settings.get('diyEngines')) {
					var diyEngines = prompt("输入搜索引擎网址，（用“%s”代替搜索字词）");
					console.log(diyEngines);
					if (diyEngines) {
						settings.set('diyEngines', diyEngines);
					} else {
						return false;
					}
				}
				console.log("搜索引擎快切:" + type);
				settings.set("engines", type);
				$(tar).siblings().removeClass("choose-opt");
				$(tar).addClass("choose-opt");
				$(".current-engine").text(tar.innerHTML);
			}
		}
	});

	//搜索引擎快切
	function initquickchange() {
		var browser = browserInfo();
		var successflag = false;
		$(".quick-change .content li").each(function(i, ele) {
			ele = $(ele);
			let type = ele.attr("name");
			if (type === "via" && browser === "via" && ele.hasClass("hide")) {
				ele.removeClass("hide");
			}
			if (settings.get("engines") === type) {
				ele.addClass("choose-opt")
				$(".current-engine").text(ele.text());
				successflag = true;
			}
		});
		if (!successflag) {
			console.log("搜索引擎快切栏初始化失败");
		}
	}
	//语音输入
	function initvoiceInput() { // .input-bg + .voice-input-active
		var vtt = null;
		$(".voice-input").click(() => {
			if (settings.get("voiceInput") === true) {
				if (!vtt) {
					loadVTT();
				}
				vtt.isActive || $(".voice-input[isActive]")[0] ? vtt.stop() : vtt.start();
			} else {
				$(".input-bg").removeClass("voice-input-active");
				alert("语音转文字暂不可用");
			}
		})
		if (settings.get("voiceInput")) {
			$(".input-bg").addClass("voice-input-active");
			loadVTT();
		} else {
			$(".input-bg").removeClass("voice-input-active");
		}

		function loadVTT() {
			require(["js-voiceToText"], () => {
				vtt = new voiceToTextJS({
					success: function(r) {
						r = r.trim();
						if (r) {
							$(".search-input").val(r);
							$(".empty-input").show();
							$(".search-btn").text("搜索")
						}
					},
					start: function() {
						$(".voice-input").attr("isActive", "");
						$("#app").append(`<div class="voice-input-bg"></div>`);
						var that = this;
						$(".voice-input-bg").click(() => {
							vtt.stop();
						})
					},
					stop: function() {
						$(".voice-input").removeAttr("isActive");
						$(".voice-input-bg").remove()
					},
					cancel: function() {
						this.stop();
					}
				})
			})
		}
	}
	$(document).ready(function() {
		initquickchange();
		initvoiceInput();
	});
	//自定义JS/CSS
	var customJsCssFn = function(customData) {
		this.customData = {
			js: "",
			css: ""
		};
		this.customData = $.extend({}, this.customData, customData);
	}
	customJsCssFn.prototype = {
		getData: function(key) {
			var res = false;
			if (key) {
				if (key === "js") {
					res = this.customData.js;
				}
				if (key === "css") {
					res = this.customData.css;
				}
			} else {
				res = this.customData;
			}
			return res;
		},
		setData: function(key, val) {
			if (key === "js") {
				this.customData.js = val;
			} else if (key === "css") {
				this.customData.css = val;
			} else {
				console.log("customData类型错误,保存失败")
			}
		},
		saveData: function(key, val) {
			this.setData(key, val);
			store.set("customData", this.getData());
		},
		clearData: function() {
			this.saveData("js", "");
			this.saveData("css", "");
		},
		promptData: function(key) {
			var data;
			var msg = "请输入自定义" + key + "\n点击确定,保存自定义" + key + "; 点击取消,删除自定义" + key;
			var originData = this.getData(key);
			if (!originData) {
				originData = "";
			}
			data = prompt(msg, originData);
			if (typeof data === "string") {
				data = data.trim();
			}
			if (!data) {
				data = "";
			}
			console.log("自定义" + key + " : " + data);
			this.saveData(key, data);
		},
		on: function() {
			var data = this.getData();
			if (data.js) {
				var jsStr =
					"function customJS(){try{%customjs%}catch(e){alert('自定义js错误');}}customJS();";
				jsStr = jsStr.replace("%customjs%", data.js);
				eval(jsStr);
			}
			if (data.css) {
				var cssBox = document.createElement("style");
				cssBox.id = "customCssBox";
				cssBox.innerHTML = data.css;
				document.body.appendChild(cssBox);
			}
		},
		init: function() {
			if (settings.get("customJsCss")) {
				this.on();
			}
		}
	}
	var customJsCss = new customJsCssFn(store.get("customData"));
	customJsCss.init();

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
					"baidu": "https://m.baidu.com/s?wd=%s",
					"baiduPC": "https://www.baidu.com/s?wd=%s",
					"quark": "https://quark.sm.cn/s?q=%s",
					"google": "https://google.com/search?q=%s",
					"bing": "https://cn.bing.com/search?q=%s",
					"toutiao": "https://so.toutiao.com/search?keyword=%s",
					"sm": "https://m.sm.cn/s?q=%s",
					"360": "https://so.com/s?q=%s",
					"sogou": "https://sogou.com/web/searchList.jsp?keyword=%s",
					"diy": settings.get('diyEngines')
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
					"hl": "SF脚本",
					"shl": "老司机专用油猴脚本网站",
					"img": "greasyfork",
					"url": "sleazyfork.org/zh-CN"
				}, {
					"hl": "油猴脚本",
					"shl": "安全实用的用户脚本大全",
					"img": "greasyfork",
					"url": "greasyfork.org/zh-CN"
				}, {
					"hl": "轻插件",
					"shl": "Via或Alook脚本网站",
					"img": "viaapp",
					"url": "via-app.cn"
				}, {
					"hl": "极简插件",
					"shl": "第三方crx扩展商店",
					"img": "chajian",
					"url": "chrome.zzzmh.cn"
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
					"hl": "Crx4中",
					"shl": "Crx4Chrome中文版",
					"img": "chajian",
					"url": "crx4.com"
				}, {
					"hl": "Crx4",
					"shl": "全球最大第三方crx商店",
					"img": "chajian",
					"url": "crx4chrome.com"
				}, {
					"hl": "Crx下载",
					"shl": "用于下载CRX文件",
					"img": "crxdownload",
					"url": "chrome-extension-downloader.com"
				}, {
					"hl": "Crx搜搜",
					"shl": "用于下载CRX文件",
					"img": "crxsoso",
					"url": "www.crxsoso.com"
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
			tabHtml = '<li>捷径</li>',
			contentHtml = `<li class="choice-cut swiper-slide">
			<div class="list h2">
				<a class="flex-1 content weather" href="https://quark.sm.cn/s?q=天气"><div>访问中</div><div></div><div></div></a>
				<a class="flex-right content" href="https://broccoli.uc.cn/apps/pneumonia/routes/index" style="linear-gradient(136deg, rgb(97, 71, 183) 0%, rgb(132, 113, 196) 100%)"><p class="hl">新冠肺炎</p><div class="cmp-icon" style="right: 27px; bottom: 20px; width: 47px; height: 45px; background-image: url(img/shortcut/xinguan.png);"></div></a>
			</div>

			<div class="list h3">
				<a class="flex-1 content" href="https://s.weibo.com/top/summary?cate=realtimehot" style="background-image:linear-gradient(135deg, rgb(60, 68, 110) 0%, rgb(105, 121, 148) 100%)"><div class="hl relative">微博热搜榜</div><div class="news-list">访问中</div></a>
			</div>
			<div class="list h3">
				<a class="flex-1 content" href="https://www.iesdouyin.com/share/billboard/?id=0" style="background-image:linear-gradient(135deg,  rgb(34, 34, 80) 1%, rgb(60, 60, 89) 100%)"><div class="hl relative">抖音热搜榜</div><div class="douyin-list">访问中</div></a>
			</div>

			<div class="list h2">
				<a class="flex-1 content" href="https://www.zhihu.com/billboard" style="background-image:linear-gradient(135deg, rgb(52, 55, 60) 0%, rgb(77, 78, 86) 100%)"><p class="hl relative">知乎热搜榜</p><div class="audio-list"><div class="audio-swipe"><div class="swiper-wrapper">访问中</div></div></div><div class="cmp-icon" style="width: 146px;height: 99px;right: 10px;bottom: 0;background-image: url(img/shortcut/rebang.png);"></div></a>
			</div>

			<div class="list">
				<a class="flex-1 content" href="https://www.xuexi.cn" style="background-image:linear-gradient(136deg, rgb(255, 81, 81) 0%, rgb(255, 111, 88) 100%)"><p class="hl">学习强国</p><p class="shl">梦想从学习开始</br>事业从实践起步</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp——习近平</p><div class="cmp-icon" style="right: 20px; top: 26px; width: 65px; height: 64px; background-image: url(img/shortcut/xuexi.png);"></div></a>
				<a class="flex-right content" href="https://www.deepl.com/zh/translator" style="linear-gradient(-36deg, rgb(97, 71, 183) 0%, rgb(132, 113, 196) 99%)"><div class="hl" style="width: 60px;text-align: center">DeepL</div><div class="cmp-icon" style="right: 22px; bottom: 0px; width: 47px; height: 45px; background-image: url(img/shortcut/fanyi.png);"></div></a>
			</div>

			</li>`;

		$.each(data, function(i, n) {
			tabHtml += "<li>" + i + "</li>";
			contentHtml += '<li class="choice-li swiper-slide">';
			for (var i = 0, l = n.length; i < l; i++) {
				contentHtml += '<a href="';
				if (n[i].url.search("http") === -1) {
					n[i].url = "https://" + n[i].url;
				}
				contentHtml += n[i].url + '"><div><img src="img/choice/' + n[i].img + '.png" /><p>' + n[
					i].hl + '</p><p>' + n[i].shl + '</p></div></a>';
			}
			contentHtml += '</li>';
		});

		// HTML添加到APP
		$('#app').append(html + tabHtml +
			'<span class="active-span"></span></ul><div class="choice-swipe"><ul class="swiper-wrapper"><div style="position:absolute;text-align:center;top:50%;width:100%;margin-top:-64px;color:#444">正在加载页面中...</div></ul></div><div class="bottom-close"></div></div></div>'
		);
		history.pushState(null, document.title, changeParam("page", "choice"));

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
				history.replaceState(null, document.title, location.origin + location.pathname);
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
			require(["ajaxJson"], function(ajaxJson) {
				//天气
				ajaxJson.getWeather(settings.get("weatherApiIdKey"), settings.get("weatherApiCity"));
				//微博热搜榜
				ajaxJson.getWeibo()
				//抖音热搜榜
				ajaxJson.getDouyin()
				//知乎热搜榜
				ajaxJson.getZhihu()
			});
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
		} else {
			var url = settings.get("chromeBookmarks");
			if (!url) {
				console.log("获取不到chrome bookmarks url");
				return false;
			}
			if (!/extension:/i.test(location.protocol)) {
				alert("chromium内核浏览器由于chromium内核限制，非插件版无法使用此功能");
				return false;
			}
			chrome.tabs.create({
				"url": url
			});
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
	//主页数据导入、导出、加密、解密
	var HPData = {
		export: function(IsEncrypt) {
			var data1 = JSON.stringify(bookMark.getJson());
			var data2 = JSON.stringify(settings.getJson());
			var data3 = JSON.stringify(customJsCss.getData());
			var flag = false;
			if (IsEncrypt) {
				data1 = '"' + this.encrypt(data1) + '"';
				data2 = '"' + this.encrypt(data2) + '"';
				data3 = '"' + this.encrypt(data3) + '"';
				flag = true;
			}
			var res = '{"bookMark":' + data1 + ',"setData":' + data2 + ',"customData":' + data3 +
				',"IsEncrypt":' + flag + '}';
			return res;
		},
		import: function(data) {
			var res = {};
			var data1 = data.bookMark;
			var data2 = data.setData;
			var data3 = data.customData;
			var flag = data.IsEncrypt;
			if (flag) {
				data1 = JSON.parse(this.decrypt(data1));
				data2 = JSON.parse(this.decrypt(data2));
				data3 = JSON.parse(this.decrypt(data3));
			}
			res.bookMark = data1;
			res.setData = data2;
			res.customData = data3;
			return res;
		},
		encrypt: function(data) {
			var res = String.fromCharCode(data.charCodeAt(0) + data.length);
			for (var i = 1; i < data.length; i++) {
				res += String.fromCharCode(data.charCodeAt(i) + data.charCodeAt(i - 1));
			}
			return escape(res);
		},
		decrypt: function(data) {
			data = unescape(data);
			var res = String.fromCharCode(data.charCodeAt(0) - data.length);
			for (var i = 1; i < data.length; i++) {
				res += String.fromCharCode(data.charCodeAt(i) - res.charCodeAt(i - 1));
			}
			return res;
		}
	}
	//检测新版本(版号来源Github)
	function getnewVersion() {
		var newVersion = "fail to get newVersion";
		$.ajax({
			url: "https://tenapi.cn/title/?url=https://icedwatermelonjuice.github.io/HMOSHomePage/",
			dataType: "json",
			async: false,
			success: function(res) {
				newVersion = res.data.description.replace("HomePage version", "");
			},
		});
		return newVersion;
	}

	//设置页面
	function openSettingPage() {
		var app = {};
		app.version = "1.25.1";
		var autonightMode2AyDes = settings.get('autonightMode2Array');
		var logoHeightDes = settings.get('LogoHeightSet');
		var positionDes = settings.get('position');
		if (positionDes === "0") {
			positionDes = "默认";
		} else if (positionDes < "0") {
			positionDes = "向上偏移" + positionDes.slice(1) + "px";
		} else {
			positionDes = "向下偏移" + positionDes + "px";
		}
		var weatherApiIdKey = settings.get("weatherApiIdKey");
		weatherApiIdKey = weatherApiIdKey ? weatherApiIdKey.replace("&", " ").replace("appid=", "id:").replace(
			"appsecret=", "key:") : "默认值，建议使用自己的id和key";
		var weatherApiCity = settings.get("weatherApiCity");
		weatherApiCity = weatherApiCity ? weatherApiCity : "未填城市，默认ip定位（地级市）";
		//构建设置HTML
		var data = [{
			"type": "hr"
		}, {
			"title": "搜索引擎",
			"type": "select",
			"value": "engines",
			"data": [{
				"t": "手机百度",
				"v": "baidu"
			}, {
				"t": "百度搜索",
				"v": "baiduPC"
			}, {
				"t": "跟随Via",
				"v": "via"
			}, {
				"t": "夸克搜索",
				"v": "quark"
			}, {
				"t": "谷歌搜索",
				"v": "google"
			}, {
				"t": "必应搜索",
				"v": "bing"
			}, {
				"t": "头条搜索",
				"v": "toutiao"
			}, {
				"t": "神马搜索",
				"v": "sm"
			}, {
				"t": "360搜索",
				"v": "360"
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
			"title": "图标数量",
			"type": "select",
			"value": "booknumber",
			"data": [{
				"t": "每行四个",
				"v": "Num4"
			}, {
				"t": "每行五个",
				"v": "Num5"
			}, {
				"t": "每行六个",
				"v": "Num6"
			}, {
				"t": "每行七个",
				"v": "Num7"
			}, {
				"t": "每行八个",
				"v": "Num8"
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
		}, {
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
			"title": "主页壁纸",
			"value": "wallpaper"
		}, {
			"title": "主页LOGO",
			"value": "logo"
		}, {
			"title": "LOGO高度",
			"value": "logoHeight",
			"description": "当前高度(单位px,像素): " + logoHeightDes + "px"
		}, {
			"title": "整体位置",
			"value": "position",
			"description": "当前位置: " + positionDes
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
			"title": "添加主页书签",
			"type": "checkbox",
			"value": "SetbookMarksADD"
		}, {
			"title": "显示主页书签",
			"type": "checkbox",
			"value": "SetbookMarksDisplay"
		}, {
			"title": "显示搜索引擎快切栏",
			"type": "checkbox",
			"value": "SEQuickChange"
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
			"title": "自定义JS/CSS",
			"type": "checkbox",
			"value": "customJsCss"
		}, {
			"title": "自定义JS",
			"value": "inputCustomJs",
			"description": "点击输入自定义JS"
		}, {
			"title": "自定义CSS",
			"value": "inputCustomCss",
			"description": "点击输入自定义CSS"
		}, {
			"title": "应用自定义JS/CSS",
			"value": "applyCustomJsCss",
			"description": "已开启自定义JS/CSS,点击应用新的自定义JS/CSS"
		}, {
			"title": "语音搜索(测试功能,可能很多bug,谨慎开启)",
			"type": "checkbox",
			"value": "voiceInput",
			"isDev": true,
			"defVal": false,
			"description": "测试平台为edge，其他平台效果未知",
		}, {
			"title": "长文本搜索(测试功能,可能很多bug,谨慎开启)",
			"type": "checkbox",
			"value": "fullscreenInput",
			"isDev": true,
			"defVal": false,
			"description": "测试平台为edge，其他平台效果未知",
		}, {
			"type": "hr"
		}, {
			"title": "chrome插件书签地址",
			"value": "chromeBookmarks",
			"description": settings.get("chromeBookmarks")
		}, {
			"title": "实况天气城市",
			"value": "weatherApiCity",
			"description": weatherApiCity
		}, {
			"title": "天气接口ID和Key",
			"value": "weatherApiIdKey",
			"description": weatherApiIdKey
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
			"title": "初始化自定义JS/CSS",
			"value": "clearCustomJsCss",
			"description": "清除所有自定义JS/CSS"
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

		}, {
			"title": "天气Api(点击前往获取id与key)",
			"value": "openWeatherApi",
			"description": "http://www.yiketianqi.com"

		}];
		var html =
			`<div class="page-settings"><div class="set-header"><div class="set-back"></div><p class="set-logo" data-value="set">自 定 义 设 置</p><p class="set-logo" data-value="md">关 于 本 主 页</p></div><ul class="set-option-from ${settings.get("devMode")?"":"only-stable-options"}">`;
		for (var json of data) {
			if (json.type === 'hr') {
				html += `<li class="set-hr"></li>`;
			} else {
				html += `<li class="set-option" ${json.isDev?`isDev=${json.defVal}`:""} ${json.value ? `data-value="${json.value}"` : ''}>
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
		html += '</ul><div class="set-markdown-page" style="display:none"></div></div>';
		$('#app').append(html);
		$(".page-settings .set-logo[data-value=set]").dblclick(() => {
			var dom = $(".page-settings .set-option-from");
			if (dom.hasClass("only-stable-options")) {
				dom.removeClass("only-stable-options");
				settings.set("devMode", true);
				alert("已进入开发者模式\n⚠️此模式下的测试功能选项的修改可能会导致页面显示错误或相关联功能异常");
			} else {
				if (confirm(`⚠退出开发者模式，将清除“测试功能”项相关数据。\n是否继续？`)) {
					dom.addClass("only-stable-options");
					dom.find(".set-option[isDev] ").each((i, e) => {
						settings.set($(e).data("value"), $(e).attr("isDev") === "true");
					})
					settings.set("devMode", false);
					alert("已退出开发者模式，即将刷新页面");
					location.reload();
				}
			}
		}).longPress((e) => {
			e.dblclick();
		})
		history.pushState(null, document.title, changeParam("page", "settings"));
		$(".page-settings").show();
		$(".page-settings").addClass('animation');
		$(".set-markdown-page").html(
			`<iframe src="html/README.html?bg=${$(".page-settings").css("backgroundColor")}&color=${$(".page-settings").css("color")}"></iframe>`
		)
		// 只有via浏览器才在搜索引擎设置里显示跟随via选项
		var browser = browserInfo();
		if (browser !== 'via') {
			$('option[value=via]').hide();
		}
		// 只有via、x浏览器或chrome插件，才在点击/长按LOGO设置里显示打开书签选项
		if (browser !== 'via' && browser !== 'x' && !/chrome-extension/i.test(location.href)) {
			$('option[value=bookmarkList]').hide();
		}
		// 只有非via、x浏览器才显示chrome书签地址设置
		if (browser === 'via' || browser === 'x') {
			$('.set-option[data-value=chromeBookmarks]').hide();
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
			if (browser !== 'via') {
				$("li[data-value=autonightMode]").show();
			}

			$("li[data-value=autonightMode2Array]").hide();
		}
		//只有自动夜间模式1、2均关闭才显示夜间模式
		if ((settings.get('autonightMode') === false) && (settings.get('autonightMode2') === false)) {
			$("li[data-value=nightMode]").show();
		}
		//开启自定义JS/CSS才会显示JS、CSS设置项
		if (settings.get("customJsCss") === true) {
			$("li[data-value=inputCustomJs]").show();
			$("li[data-value=inputCustomCss]").show();
			$("li[data-value=applyCustomJsCss]").show();
		} else {
			$("li[data-value=inputCustomJs]").hide();
			$("li[data-value=inputCustomCss]").hide();
			$("li[data-value=applyCustomJsCss]").hide();
		}
		$(".set-option .set-select").map(function() {
			$(this).val(settings.get($(this).parent().data('value')));
		});

		$(".set-option .set-checkbox").map(function() {
			$(this).prop("checked", settings.get($(this).parent().data('value')));
		});

		$(".set-back").click(function() {
			if ($(".set-option-from").is(":visible")) {
				$(".page-settings").css("pointer-events", "none").removeClass("animation");
				$(".page-settings").on('transitionend', function(evt) {
					if (evt.target !== this) {
						return;
					}
					$(".page-settings").remove();
				});
				history.replaceState(null, document.title, location.origin + location.pathname);
			} else if ($(".set-markdown-page").is(":visible")) {
				$(".set-logo[data-value=md]").hide();
				$(".set-logo[data-value=set]").show();
				$(".set-markdown-page").hide();
				$(".set-option-from").show();
				history.replaceState(null, document.title, changeParam("page", "settings"));
			}
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
						var logoEle = new Image();
						logoEle.src = this.result;
						logoEle.onload = function() {
							var autoHeight = LogoHeightFn.auto(logoEle.height, logoEle
								.width);
							settings.set('LogoHeightSet', autoHeight);
							$(".set-option[data-value=logoHeight] .set-description")
								.text(
									"当前高度(单位px,像素): " + autoHeight + "px");
							logoEle.remove();
						}
					};
					reader.readAsDataURL(file);
				});
			} else if (value === "delLogo") {
				let delLogoConfirm = confirm("将删除自定义壁纸和LOGO,恢复默认壁纸和LOGO!");
				if (delLogoConfirm === true) {
					settings.set('wallpaper', '');
					settings.set('logo', '');
					settings.set('LogoHeightSet', settings.getinitSettings("LogoHeightSet"));
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

			} else if (value === "clearCustomJsCss") {
				if (confirm("将清除所有JS/CSS!")) {
					customJsCss.clearData();
					location.reload();
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
			} else if (value === "openWeatherApi") {
				// open($this.find('.set-description').text());
				//kiwi本地页面暂时无法使用open()方法,替换为location.href方法
				location.href = $this.find('.set-description').text();
			} else if (value === "export") {
				var oInput = $('<input>');
				var IsEncrypt = confirm(
					"是否对主页数据进行加密?\n点击确认进行加密，点击取消直接导出原始数据\n(PS:加密有助于保护数据安全,防止数据泄露或被恶意篡改,但是加密后的数据量会相对而言增加很多)"
				);
				oInput.val(HPData.export(IsEncrypt));
				document.body.appendChild(oInput[0]);
				oInput.select();
				document.execCommand("Copy");
				alert('主页数据已备份到剪贴板!');
				oInput.remove();
			} else if (value === "import") {
				var data = prompt("在这粘贴备份的主页数据:");
				try {
					if (data !== null && data !== "") {
						data = JSON.parse(data);
						data = HPData.import(data);
						var r = confirm("是否覆盖原书签数据?\n(点击确定将覆盖原书签数据,点击取消将保留原书签数据)");
						var newbookMarkData;
						if (r) {
							newbookMarkData = data.bookMark;
						} else {
							var storeBook = JSON.stringify(store.get("bookMark"));
							var dataBook = JSON.stringify(data.bookMark);
							newbookMarkData = storeBook.replace("]", "") + "," + dataBook.replace("[",
								"");
							newbookMarkData = JSON.parse(newbookMarkData);
						}
						store.set("bookMark", newbookMarkData);
						store.set("setData", data.setData);
						alert("主页数据恢复成功!");
						store.set("customData", data.customData);
						location.reload();
					} else {
						alert("主页数据恢复失败!");
					}
				} catch (e) {
					alert("主页数据恢复失败!");
				}
			} else if (value === "autonightMode2Array") {
				autoNightMode2Fn.getSetTime();
				location.reload(false);
			} else if (value === "logoHeight") {
				LogoHeightFn.get();
				location.reload(false);
			} else if (value === "position") {
				PositionFn.get();
				location.reload(false);
			} else if (value === "inputCustomJs") {
				customJsCss.promptData("js");
			} else if (value === "inputCustomCss") {
				customJsCss.promptData("css");
			} else if (value === "applyCustomJsCss") {
				alert("即将应用自定义JS/CSS");
				settings.set("customJsCss", true);
				location.reload();
			} else if (value === "weatherApiCity") {
				var defaultData = settings.get("weatherApiCity");
				defaultData = defaultData ? defaultData : "";
				var city = prompt("请输入实况天气定位城市，例如：北京，上海\n若输入为空值，则使用ip定位到地级市", defaultData);
				city = city.trim();
				settings.set("weatherApiCity", city);
				$(".set-option[data-value=weatherApiCity] .set-description").text(city);
			} else if (value === "weatherApiIdKey") {
				var defaultData = settings.get("weatherApiIdKey");
				if (/^appid=[A-Za-z0-9]+&appsecret=[A-Za-z0-9]+$/.test(defaultData)) {
					defaultData = defaultData.replace(/(appid|appsecret)?=/g, "").split("&");
				} else {
					defaultData = ["", ""];
				}
				var id = prompt("请输入自己的天气接口Id\n若输入为空值，则使用默认公共Id和Key\n注：Id与Key需相匹配", defaultData[0]);
				id = id.trim();
				var key = prompt("请输入自己的天气接口Key\n若输入为空值，则使用默认公共Id和Key\n注：Id与Key需相匹配", defaultData[1]);
				key = key.trim();
				if (id && key && confirm(`请确认个人id和key:\nid:${id} key:${key}`)) {
					settings.set("weatherApiIdKey", `appid=${id}&appsecret=${key}`);
					$(".set-option[data-value=weatherApiIdKey] .set-description").text(
						`id:${id} key:${key}`);
				} else if (confirm("确定使用默认公共Id和Key?")) {
					settings.set("weatherApiIdKey", "");
					$(".set-option[data-value=weatherApiIdKey] .set-description").text(
						"默认值，建议使用自己的id和key")
				}
			} else if (value === "chromeBookmarks") {
				var defaultData = settings.get("chromeBookmarks");
				defaultData = defaultData ? defaultData : "chrome://bookmarks/";
				var url = prompt("请输入新的chrome书签插件地址", defaultData);
				url = url.trim();
				settings.set("chromeBookmarks", url);
				$(".set-option[data-value=chromeBookmarks] .set-description").text(url);
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
				var protext = ""
				if (settings.get('diyEngines')) {
					protext = settings.get('diyEngines');
				}
				var engines = prompt("输入搜索引擎网址，（用“%s”代替搜索字词）", protext);
				console.log(engines);
				if (engines) {
					settings.set('diyEngines', engines);
				} else {
					dom.val(settings.get('engines'));
					return false;
				}
			}
			//每行图标数量设置
			if (item === "booknumber") {
				let numset = "repeat(4,25%)";
				switch (value) {
					case "Num4":
						numset = "repeat(4,25%)";
						break;
					case "Num5":
						numset = "repeat(5,20%)";
						break;
					case "Num6":
						numset = "repeat(6,16.66%)";
						break;
					case "Num7":
						numset = "repeat(7,14.28%)";
						break;
					case "Num8":
						numset = "repeat(12.5%)";
						break;
					default:
						numset = "repeat(4,25%)";
						break;
				}
				$(".bookmark").css("gridTemplateColumns", numset)
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
			} else if (item === 'styleThin' && value === false) {
				$("body").removeClass('styleThin');
			}
			if (item === 'SetbookMarksDisplay' && value === true) {
				$(".bookmark_outer_container").removeClass("hide");
			} else if (item === 'SetbookMarksDisplay' && value === false) {
				$(".bookmark_outer_container").addClass("hide");
			}
			if (item === 'SEQuickChange' && value === true) {
				$(".quick-change").show();
			} else if (item === 'SEQuickChange' && value === false) {
				$(".quick-change").hide();
			}
			if (item === 'autonightMode' && value === true) {
				$("li[data-value=nightMode]").hide();
				$("li[data-value=autonightMode2]").hide();
			} else if (item === 'autonightMode' && value === false) {
				$("li[data-value=autonightMode2]").show();
				if (settings.get('autonightMode2') === false) {
					$("li[data-value=nightMode]").show();
				}
			}
			if (item === 'autonightMode2' && value === true) {
				$("li[data-value=nightMode]").hide();
				$("li[data-value=autonightMode]").hide();
				$("li[data-value=autonightMode2Array]").show();
			} else if (item === 'autonightMode2' && value === false) {
				if (browser !== 'via') {
					$("li[data-value=autonightMode]").show();
				}
				if (settings.get('autonightMode') === false) {
					$("li[data-value=nightMode]").show();
				}
				$("li[data-value=autonightMode2Array]").hide();
			}
			if (item === 'customJsCss' && value === true) {
				$("li[data-value=inputCustomJs]").show();
				$("li[data-value=inputCustomCss]").show();
				$("li[data-value=applyCustomJsCss]").show();
				if (!confirm("警告:自定义JS/CSS会增加主页不稳定性。若输入的JS/CSS存在问题可能导致发生不可逆的错误\n\n点击确定继续开启,点击取消终止开启")) {
					value = false;
					$("li[data-value=inputCustomJs]").hide();
					$("li[data-value=inputCustomCss]").hide();
					$("li[data-value=applyCustomJsCss] .set-description").html(
						"已终止开启自定义JS/CSS,点击重启自定义JS/CSS");
				}
				var customJsCssData = customJsCss.getData();
				if (customJsCssData.js || customJsCssData.css) {
					settings.set("customJsCss", true);
					customJsCss.on();
				}
			} else if (item === 'customJsCss' && value === false) {
				$("li[data-value=inputCustomJs]").hide();
				$("li[data-value=inputCustomCss]").hide();
				$("li[data-value=applyCustomJsCss]").hide();
				settings.set("customJsCss", false);
				setTimeout(function() { //延迟刷新，让关闭动画放完，这样好看一点
					location.reload();
				}, 500);
			}
			// 保存设置
			settings.set(item, value);
		});
		$(".set-option[data-value=aboutVersion]").click(() => {
			let alertMessage =
				`当前版本:${app.version}\n最新版本:${getnewVersion()}\n本作作者: IcedWatermelonJuice\n原作作者: liumingye\n联系方式: Github Issues\n更多信息: 请长按“关于”或点击“Github”、“Gitee”`;
			alert(alertMessage);
		}).longPress(() => {
			changeREADMEtheme();
			$(".set-logo[data-value=set]").hide();
			$(".set-logo[data-value=md]").show();
			$(".set-option-from").hide();
			$(".set-markdown-page").show();
			history.pushState(null, document.title, changeParam("page", "aboutVersion"));
		})
	}

	//扫一扫
	function openscanWebsite() {
		var scanUrl =
			"https://icedwatermelonjuice.github.io/QRcode-Tool/index.html?mode=scan&autoJump=true&autoClose=true&darkMode=" +
			($("#nightCss[disabled]")[0] ? false : true);
		console.log(scanUrl)
		open(scanUrl);
	}

	//设置点击/长按LOGO功能冲突检测
	var DetectConflictsNum = 0;

	function DetectLogoFnConflicts() {
		var logoDisplay = settings.get("LogoHeightSet") !== "0" ? true : false;
		var logoCKhasSet = settings.get("LOGOclickFn") === "settingsPage" ? true : false;
		var logoLPhasSet = settings.get("LOGOlongpressFn") === "settingsPage" ? true : false;
		var logoHasSetFn = logoDisplay && (logoCKhasSet || logoLPhasSet);
		var bookDisplay = settings.get("SetbookMarksDisplay") ? true : false;
		var bookHasSet = bookMark.searchURL("openSettingPage()") ? true : false;
		var bookHasSetFn = bookDisplay && bookHasSet;
		if (logoHasSetFn || bookHasSetFn) { //若书签隐藏或无设置书签
			DetectConflictsNum = 0;
		} else {
			DetectConflictsNum += 1;
		}
		if (DetectConflictsNum > 5) {
			DetectConflictsNum = 0;
			settings.set("SetbookMarksDisplay", true);
			$(".bookmark_outer_container").removeClass("hide");
			!bookHasSet && bookMark.add("设置", "openSettingPage()", "img/bookmarks/settings.png");
			alert("未检测到设置入口，已显示主页书签并添加设置书签\nLOGO功能（点击或长按LOGO，且不能隐藏）与桌面书签（不能隐藏书签）必须有设置入口");
		}
	}
	// README 主题色切换
	function changeREADMEtheme() {
		if ($(".set-markdown-page iframe")[0]) {
			var src =
				`html/README.html?bg=${$(".page-settings").css("backgroundColor")}&color=${$(".page-settings").css("color")}`;
			if ($(".set-markdown-page iframe").attr("src") !== src) {
				$(".set-markdown-page iframe").attr("src", src);
			} else {}
		}
	}
	//1s定时器，用于自动夜间模式 和 设置点击/长按LOGO功能冲突 搜索引擎快切初始化
	function IntervalFnSet() {
		autoNightModeOn();
		DetectLogoFnConflicts();
		LogoHeightFn.set();
		PositionFn.set();
		initquickchange();
		changeREADMEtheme()
	}
	setInterval(IntervalFnSet, 1000);

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
					$('.bookmark').removeAttr("disabled").css({
						'opacity': "",
						'transform': "",
						'transition-duration': ""
					});
					settings.apply();
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
