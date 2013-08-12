/**
 * @author johnqing(刘卿)
 * @module ajax模块
 * @link n.js
 */
!function(window){
	/**
	 * 默认参数
	 * @type {Object}
	 */
	var defaultConfig = {
		url: null,
		method: 'get',
		data: null,
		dataType: 'json',
		async: true,
		jsonp: 'callback',
		success: function(){},
		error: function(){}
	},
	timestamp = new Date() * 1;
	/**
	 * ajax 类
	 * @param  {Object} data 需要传入的参数
	 * @return
	 */
	var Ajax = function(options){
		this.url = options.url;
		this.method = options.method;
		this.data = n.isObject(options.data) ? n.encodeURIJson(options.data) : options.data;
		this.dataType = options.dataType.toLocaleLowerCase();
		this.async = options.async;
		this.jsonp = options.jsonp;
		this.success = options.success;
		this.error = options.error;
		this.XMLHTTP = this.getXMLHTTP();
	}
	Ajax.prototype = {
		constructor: Ajax,
		init: function(){
			var _this = this;
			if(_this.dataType === 'jsonp'){
				_this.getJsonp();
				return;
			}
			_this.requset(_this.method);
		},
		getXMLHTTP: function(){
			 var xmlhttp = null;

			// 针对不同浏览器建立这个对象的不同方式写不同代码
			if(window.XMLHttpRequest) {
				xmlhttp = new XMLHttpRequest();
				//针对某些特定版本的Mozillar浏览器的BUG进行修正
				if(xmlhttp.overrideMimeType) {
				    xmlhttp.overrideMimeType("text/xml");
				}

			} else if (window.ActiveXObject) {
				var activexName = ['MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
				for (var i=0; i<activexName.length; i++) {
				    try {
				        xmlhttp = new ActiveXObject(activexName[i]);
				        break;
				    } catch(e) {}
				}
			}

			return xmlhttp;
		},
		/**
		 * 核心方法(get、post 都是走这个方法)
		 * @param  {String} get/post
		 * @return
		 */
		requset: function(type){
			var _this = this,
				resType,
				URL = _this.url,
				async = _this.async;
				xmlHttp = _this.XMLHTTP,
				queryString = _this.data + "&timestamp=" + new Date().getTime();
			type = type.toLocaleUpperCase();
			if(type === 'GET'){
				type = "GET";
				URL = _this.url +'?'+ queryString;
				queryString = null;
			}else{
				type = "POST";
			}

			xmlHttp.open(type, URL, async);
			xmlHttp.onreadystatechange = function(){
				if(xmlHttp.readyState == 4 && (xmlHttp.status == 200 || xmlHttp.status == 304) ){
					resType = xmlHttp.responseText;
					if(_this.dataType === 'xml'){
						resType = xmlHttp.responseXML;
					}
					_this.success.call(_this, resType);
				}else if(xmlHttp.status == 0){
					_this.error.call(_this, '请求失败');
				}else{
					_this.error.call(_this, xmlHttp.responseText);
				}
			};
			if(type === "POST"){
				xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			}
			xmlHttp.send(queryString);
		},

		get: function(){
			this.requset('get');
		},
		post: function(){
			this.requset('post');
		},
		/**
		 * jsonp方法
		 * @return
		 */
		getJsonp: function(){
			var _this = this,
				url = _this.url,
				jsonp = _this.jsonp,
				//唯一的时间戳
				uuid = jsonp + (timestamp++);
			url += (/\?/.test(url) ? '&' : '?') + _this.data +'&callback='+ uuid;
			//返回时执行该函数
			window[uuid] = function(data){
				_this.success(data);
				window[uuid] = null;
			}
			n.loadScript(url);
		}
	}
	/**
	 * 追加ajax模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		ajax: function (options){
			options = n.mix(options, defaultConfig);
			new Ajax(options).init();
		},
		get: function(url, data, fun){
			new Ajax({
				url: url,
				data: data,
				success: fuc
			}).get();
		},
		post: function(url, data, fun){
			new Ajax({
				url: url,
				data: data,
				success: fuc
			}).post();
		},
		jsonp: function(url, data, fun){
			new Ajax({
				url: url,
				data: data,
				dataType: 'jsonp',
				success: fuc
			}).init();
		}
	});
}(this);
