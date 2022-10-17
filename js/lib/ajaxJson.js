/*
gitee仓库：https://gitee.com/wangjins/weather_api
开发文档：http://doc.tianqiapi.com/603579
*/
function getWeather(IdKey, city) {
	IdKey = IdKey ? IdKey : "appid=23035354&appsecret=8YvlPNrz";
	city = city ? "&city=" + city : "";
	var url = "https://yiketianqi.com/api?unescape=1&version=v1&" + IdKey + city;
	function errorFn(){
		var msg="天气api失效或日次数达上限";
		console.log(msg);
		$('.weather').html(`<h1>${msg}</h1>`);
	}
	$.ajax({
		url: url,
		type: "get",
		dataType: "json",
		success: function(res) {
			if(!(res.city&&res.data)){
				errorFn();
				return false;
			}
			var location = res.city;
			var data = res.data[0];
			var temp = data.tem;
			var air = data.air_level;
			var weather = data.wea;
			var img = data.wea_img;
			var html =
				`<div>${temp}</div><div>${weather}</div><div>${location} · ${air.length>1?air:"空气"+air}</div><div class="weather-icon" id="lottie-box" style="background-image: url(img/weather/${data.wea_img}.png);"></div>`;
			$('.weather').html(html);
		},
		error:function(){
			errorFn();
		}
	})
}

function getWeibo() {
	function errorFn(){
		var msg="微博api失效或日次数达上限";
		console.log(msg);
		$('.news-list').html(`<h1>${msg}</h1>`);
	}
	$.ajax({
		url: "https://tenapi.cn/resou/",
		type: "get",
		dataType: "json",
		success: function(res) {
			var data = res.list;
			if(!data){
				errorFn();
				return false
			}
			var html = '';
			for (var i = 0; i < 4; i++) {
				html +=
					'<div class="news-item"><div class="news-item-count">' +
					(i + 1) + '</div><div class="news-item-title">' + data[i]
					.name +
					'</div><div class="news-item-hot">' + data[i].hot +
					'</div></div>';
			}
			$('.news-list').html(html);
		},
		error:function(){
			errorFn();
		}
	});
}

function getDouyin() {
	function errorFn(){
		var msg="抖音api失效或日次数达上限";
		console.log(msg);
		$('.douyin-list').html(`<h1>${msg}</h1>`);
	}
	$.ajax({ //https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=1
		url: "https://tenapi.cn/douyinresou/",
		type: "get",
		dataType: "json",
		success: function(res) {
			var data = res.list;
			if(!data){
				errorFn();
				return false
			}
			var html = '';
			for (var i = 0; i < 4; i++) {
				html +=
					'<div class="douyin-item"><div class="douyin-item-count">' +
					(i + 1) + '</div><div class="douyin-item-title">' + data[i]
					.name +
					'</div><div class="douyin-item-hot">' + data[i].hot +
					'</div></div>';
			}
			$('.douyin-list').html(html);
		},
		error:function(){
			errorFn();
		}
	});
}

function getZhihu() {
	function errorFn(){
		var msg="知乎api失效或日次数达上限";
		console.log(msg);
		$('.audio-list').find('.audio-swipe').html(`<div class="swiper-wrapper">${msg}</div>`);
	}
	$.ajax({
		url: "https://tenapi.cn/zhihuresou/",
		type: "get",
		dataType: "json",
		success: function(res) {
			var data = res.list;
			if(!data){
				errorFn();
				return false
			}
			var html = '';
			for (var i = 0, l = data.length; i < l; i++) {
				html +=
					'<div class="audio-item swiper-slide"><div class="audio-item-icon"></div><div class="audio-item-title">' +
					data[i].query + '</div></div>';
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
		},
		error:function(){
			errorFn();
		}
	});
}

function test(imgSrc) {
	var img = new Image();
	img.src=imgSrc;
	$("#app").append(img)
	$(img).ready(function(){
		console.log(img)
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		var dataURL = canvas.toDataURL();
		console.log(dataURL);
	})
}
