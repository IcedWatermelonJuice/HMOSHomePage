/*
 * 一个基于chrome原生语音识别API的语音转文字(Voice To Text,VTT)插件
 * 参数：包含success方法[必须]、error方法[可省略]、start方法[可省略]、stop方法[可省略]、cancel方法[可省略]的JSON对象
 */
var voiceToTextJS = function(fnJSON) {
	//固定方法
	function defautEvent() {
		return null
	}
	this.isActive = false;
	this.noSupport = function() {
		console.log("该浏览器不支持webkitSpeechRecognition对象");
		alert("该浏览器不支持webkitSpeechRecognition对象");
	}
	//用户可更改方法
	this.success = fnJSON.success;
	this.error = typeof fnJSON.error === "function" ? fnJSON.error : function(e) {
		console.log("webkitSpeechRecognition对象出错", e);
	}
	this.extraEvent = {
		start: typeof fnJSON.start === "function" ? fnJSON.start : defautEvent,
		stop: typeof fnJSON.stop === "function" ? fnJSON.stop : defautEvent,
		cancel: typeof fnJSON.cancel === "function" ? fnJSON.cancel : defautEvent,
	}
	//初始化
	this.init();
}
voiceToTextJS.prototype = {
	init: function() { //初始化方法
		var that = this;
		if (typeof webkitSpeechRecognition !== "function") {
			this.error();
			return false
		}
		that.SpeechRecognitionObject = new webkitSpeechRecognition();
		that.SpeechRecognitionObject.continuous = true;
		that.SpeechRecognitionObject.interimResults = false;
		that.SpeechRecognitionObject.lang = "cmn-Hans-CN";
		that.SpeechRecognitionObject.onerror = that.error;
		that.SpeechRecognitionObject.onresult = function(e) {
			if (that.isActive) {
				that.success(e.results[e.results.length - 1][0]["transcript"]);
			}
		}
		that.SpeechRecognitionObject.onspeechend = function() {
			that.timeout = setTimeout(() => {
				console.log("语音转文字-超时");
				that.stop();
			}, 500)
		}
		that.SpeechRecognitionObject.onspeechstart = function() {
			if (that.timeout) {
				clearTimeout(that.timeout);
				that.timeout = null;
			}
		}
	},
	start: function() { //开始VTT
		if (!this.SpeechRecognitionObject && !this.init()) {
			return false
		}
		this.SpeechRecognitionObject.abort();
		this.SpeechRecognitionObject.start();
		this.isActive = true;
		this.extraEvent.start();
	},
	stop: function() { //结束VTT
		if (this.SpeechRecognitionObject) {
			this.SpeechRecognitionObject.stop();
			this.isActive = false;
		}
		this.extraEvent.stop();
	},
	cancel: function() { //取消VTT
		if (this.SpeechRecognitionObject) {
			this.isActive = false;
			this.SpeechRecognitionObject.stop(); //必须先置fasle再stop
		}
		this.extraEvent.cancel();
	}
}
