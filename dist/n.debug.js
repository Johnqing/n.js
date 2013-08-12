!function(window, undefined){
	var n,
		_n = window.n,//储存命名
		document = window.document,
		version = '1.0.0',
		released = '2013-08-09 13:47';

	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	var	push = ArrayProto.push,
		slice = ArrayProto.slice,
		concat = ArrayProto.concat,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	/**
	 * n选择器
	 * @param  {String} a 筛选元素
	 * @param  {Object} b 筛选的父级
	 * @return {Object}
	 */
	n = function(a, b){
		a = a.match(/^(\W)?(.*)/);
		return(b || document)[
		"getElement" + (
		  a[1]
		    ? a[1] == "#"
		      ? "ById"           // node by ID,
		      : "sByClassName"   // nodes by class name, or
		    : "sByTagName"       // nodes by tag name,
		)
		](a[2]);
	}
	/**
	 * 私有类型判断函数
	 * @param  {String}  type Object/String/Function/Array
	 * @return {Boolean}
	 */
	function isType(type){
		return function(obj){
			return {}.toString.call(obj) == "[object "+ type +"]";
		}
	}
	/**
	 * 类型判断
	 * @type {Boolean}
	 */
	n.isObject = isType('Object');
	n.isString = isType('String');
	n.isArray = isType('Array');
	n.isFunction = isType('Function');
	n.isNull = function(obj){
		return obj === null;
	}
	n.isUndefined = function(obj){
		return obj === void 0;
	}
	/**
	 * 判断object 包含指定的属性 key
	 * @param  {Object} obj 对象集合
	 * @param  {String} key 查找键
	 * @return {Boolean}
	 */
	n.has = function(obj, key){
		return hasOwnProperty.call(obj, key);
	}
	/**
	 * 用指定的context作为fn上下文，也就是this
	 * @param  {Function} fn      需要指定上下文的函数
	 * @param  {Object}   context 上下文
	 * @return
	 */
	n.bind = function (fn, context) {
		return function () {
			return fn.apply(context, arguments);
		};
    }
	/**
	 * 将源对象的属性并入到目标对象
	 * @param {Object} des 目标对象
	 * @param {Object|Array} src 源对象，如果是数组，则依次并入
	 * @param {boolean} override (Optional) 是否覆盖已有属性。如果为function则初为混合器，为src的每一个key执行 des[key] = override(des[key], src[key], key);
	 * @returns {Object} des
	 */
	n.mix = function(des, src, override){
		//数组的话递归
		if(n.isArray(src)){
			for (var i = 0, len = src.length; i < len; i++) {
				n.mix(des, src[i], override);
			}
			return des;
		}
		//function为混合器
		if(n.isFunction(override)){
			for (i in src) {
				des[i] = override(des[i], src[i], i);
			}
		}else{
			for (i in src) {
				//这里要加一个des[i]，是因为要照顾一些不可枚举的属性
				if (override || !(des[i] || (i in des))) {
					des[i] = src[i];
				}
			}
		}
		return des;
	}
	/**
	 * 调用给定的迭代函数N次
	 * @param  {Number} n        调用次数
	 * @param  {Function} iterator [description]
	 * @param  {Object} context  可选参数
	 * @return
	 */
	n.times = function(n, iterator, context) {
		var accum = Array(Math.max(0, n));
		for (var i = 0; i < n; i++){
			accum[i] = iterator.call(context, i);
		}
		return accum;
	};
	/**
	 * 只能运行一次的函数
	 * @param  {Function} func 需要运行的函数
	 * @return
	 */
	n.once = function(fun) {
		var flg = false, memo;
		return function() {
		  if (flg) return memo;
		  flg = true;
		  memo = fun.apply(this, arguments);
		  fun = null;
		  return memo;
		};
	};
	/**
	 * getClass
	 * @param  {String} searchClass
	 * @param  {Object} node
	 * @param  {String} tag
	 * @return {Object}
	 * @todo 貌似不是最完美方案
	 */
	if(!document.getElementsByClassName){
	    document.getElementsByClassName = function(className, element){
	        var children = (element || document).getElementsByTagName('*');
	        var elements = [];
	        var re = RegExp('\\b' + className + '\\b');
		for (var i = 0; i < children.length; i++) {
		    if (re.test(children[i].className)) {
			elements.push(children[i]);
		    }
		}
	        return elements;
	    };
	}
	/**
	 * forEach(来自司徒正美的博客)
	 * @param  {Object|Array|String|Function}   object
	 * @param  {Function}   block
	 * @param  {Object|Array|String|Function}   context scope 可选。 可在 callbackfn 函数中为其引用 this 关键字的对象。 如果省略 thisArg，则 undefined 将用作 this 值。
	 * @param  {Function} fn 如果Object为函数时，执行
	 * @return
	 */
	n.forEach = function(object, block, context, fn) {
	  if (object == null) return;
	  if (!fn) {
	    if (typeof object == "function" && object.call) {
	      //遍历普通对象
	      fn = Function;
	    } else if (typeof object.forEach == "function" && object.forEach != arguments.callee) {
	      //如果目标已经实现了forEach方法，则使用它自己的forEach方法（如标准游览器的Array对象）
	      object.forEach(block, context);
	      return;
	    } else if (typeof object.length == "number") {
	      // 如果是类数组对象或IE的数组对象
	      _Array_forEach(object, block, context);
	      return;
	    }
	  }
	  _Function_forEach(fn || Object, object, block, context);
	};

	function _Array_forEach(array, block, context) {
	  if (array == null) return;
	  var i = 0,length = array.length;
	  if (typeof array == "string") {
	    for (; i < length; i++) {
	      block.call(context, array.charAt(i), i, array);
	    }
	  }else{
	    for (;i < length; i++) {
	      block.call(context, array[i], i, array);
	    }
	  }
	};


	function _Function_forEach(fn, object, block, context) {
		// 这里的fn恒为Function
		for (var key in object) {
		   //只遍历本地属性
		   if (object.hasOwnProperty(key)) {
		    //相当于  block(object[key], key)
		    block.call(context, object[key], key, object);
		  }
		}
	};
	/**
	 * 异步加载script
	 * @param  {String}   url      js文件路径
	 * @param  {Function} callback 加载完成后回调
	 * @return
	 */
	n.loadScript = function(url, callback) {
		var f = arguments.callee;
		if (!("queue" in f))
			f.queue = {};
		var queue =  f.queue;
		if (url in queue) { // script is already in the document
			if (callback) {
				if (queue[url]) // still loading
					queue[url].push(callback);
				else // loaded
					callback();
			}
			return;
		}
		queue[url] = callback ? [callback] : [];
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.onload = script.onreadystatechange = function() {
			if (script.readyState && script.readyState != "loaded" && script.readyState != "complete")
				return;
			script.onreadystatechange = script.onload = null;
			while (queue[url].length)
				queue[url].shift()();
			queue[url] = null;
		};
		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	};
	/**
	 * 格式化日期
	 * @method format
	 * @static
	 * @param {Date} d 日期对象
	 * @param {string} pattern 日期格式(y年M月d天h时m分s秒)，默认为"yyyy-MM-dd"
	 * @return {string}  返回format后的字符串
	 * @example
	 var d = new Date();
	 console.log(n.dFormat(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss"));
	 */
	n.dFormat = function(d, pattern) {
		pattern = pattern || 'yyyy-MM-dd';
		var y = d.getFullYear().toString(),
			o = {
				M: d.getMonth() + 1, //month
				d: d.getDate(), //day
				h: d.getHours(), //hour
				m: d.getMinutes(), //minute
				s: d.getSeconds() //second
			};
		pattern = pattern.replace(/(y+)/ig, function(a, b) {
			return y.substr(4 - Math.min(4, b.length));
		});
		for (var i in o) {
			pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
				return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
			});
		}
		return pattern;
	}
	/**
	 * 缓存模块
	 * @type {Object}
	 */
	n.cache = {};
	//版本信息
	n.version = version;
	//更新时间
	n.released = released;
	/**
	 * 去除字符串的前后空格
	 * @param  {String} str
	 * @return {String}
	 */
	n.trim = function(str){
		return str.replace(/(^\s*)|(\s$)/g, '');
	}
	/**
	 * url参数解析
	 * @param  {String} url url参数字符串
	 * @return {Object} json对象
	 */
	n.queryUrl = function(url){
		var t = {},
			s;
		url = url.split('&');
		for (var i = url.length - 1; i >= 0; i--) {
			s = url[i].split('=');
			t[s[0]] = s[1];
		};
		return t;
	}
	/**
	 * encodeURI一个Json对象
	 * @param {Json} json  Json数据，只有一层json，每一键对应的值可以是字符串或字符串数组
	 * @returns {string} : 返回被encodeURI结果。
	 */
	n.encodeURIJson = function(json){
		var s = [];
		for( var p in json ){
			if(json[p]==null) continue;
			if(json[p] instanceof Array)
			{
				for (var i=0;i<json[p].length;i++) s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
			}
			else
				s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
		}
		return s.join('&');
	}
	/**
	 * 事件侦听
	 * @param  {Object} el
	 * @param  {String} type
	 * @param  {Function} handler
	 * @return {Object}
	 */
	n.on = function(el, type, handler){
		el.addEventListener ? el.addEventListener(type, handler, false) : el.attachEvent("on" + type, handler);
		return el;
	}
	/**
	 * 删除事件侦听
	 * @param  {Object} el
	 * @param  {String} type
	 * @param  {Function} handler
	 * @return {Object}
	 */
	n.un = function(el, type, handler){
		el.removeEventListener ? el.removeEventListener(type, handler, false) : el.detachEvent("on" + type, handler);
		return el;
	}
	/**
	 * 触发对象的指定事件
	 * @param	{Object}	el	要触发事件的对象
	 * @param	{string}	type	事件名称
	 * @return
	 */
	n.fire = (function(){
		if (document.dispatchEvent) {
			return function(el, type) {
				var evt = null,
					doc = el.ownerDocument || el;
				if (/mouse|click/i.test(type)) {
					evt = doc.createEvent('MouseEvents');
					evt.initMouseEvent(type, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
				} else {
					evt = doc.createEvent('Events');
					evt.initEvent(type, true, true, doc.defaultView);
				}
				return el.dispatchEvent(evt);
			};
		} else {
			return function(el, type) {
				return el.fireEvent('on' + type);
			};
		}
	}());
	/**
	 * create DOM element
	 * @param  {String} elStr
	 * @return {Object}
	 */
	n.md = function(elStr){
		var doc = document,
		cElem = doc.createElement('p');
		cElem.innerHTML = elStr;
		elStr = doc.createDocumentFragment(cElem);

		while(doc = cElem.firstChild){
			elStr.appendChild(doc);
		}
		return elStr;
	};
	/**
	 * 模板渲染
	 * @param  {Object} elem 要插入的对象
	 * @param  {[type]} str  模板字符串
	 * @param  {[type]} data 数据
	 * @return
	 */
	n.tpl = function(elem, str, data){
		n.loadScript('http://johnqing.github.io/Ntpl.js/nTpl.js', function(){
			elem.innerHTML = NTpl.tpl(str, data);
		})
	}
	/**
	 * 防止命名空间冲突
	 * @param  {String} str 替换n命名空间的名字
	 * @return
	 */
	n.noConflict = function(str){
		window[str] = window.n;
		window.n = _n;
	}
	window.n = n;
}(this);

/**
 * @author johnqing(刘卿)
 * @module ajax模块
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

/**
 * @author www.wangyingran.com(王迎然)
 * @module cookie模块
 */
!function(window){
	/**
	 * cookie方法
	 * @property {Object}
	 */
	var cookie = {
		/**
		 * 设置cookie
		 * @param  {String} name    cookie名
		 * @param  {String} value   cookie值
		 * @param  {Object} options 设置cookie的有效期，路径，域，安全  
		 * @return 
		 */
		set: function(name, value, options){
			options = options || {}; 
			//如果值为空，删除该cookie    
			if (isNull(value)) {     
				value = '';     
				options.expires = -1;     
			}  
			var expires = '';     
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {     
				var date;     
				if (typeof options.expires == 'number') {     
					date = new Date();     
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));     
				} else {     
					date = options.expires;     
				}     
				expires = '; expires=' + date.toUTCString();     
			}     
			//设置参数
			var path = options.path ? '; path=' + (options.path) : '';     
			var domain = options.domain ? '; domain=' + (options.domain) : '';     
			var secure = options.secure ? '; secure': '';     
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join(''); 
		},
		/**
		 * 获取cookie
		 * @param  {String} name cookie名
		 * @return {String}
		 */
		get: function(name){
			var cookieValue = null,
				dck = document.cookie,
				cookieStart,cookieEnd;     
			if (dck&& dck != '') {  
				//通过indexOf()来检查这个cookie是否存在，不存在就为 -1　
				cookieStart = dck.indexOf(name + "=");
				if(cookieStart != -1){
					cookieStart += name.length + 1;
					cookieEnd = dck.indexOf(";", cookieStart);
					if(cookieEnd == -1){
						cookieEnd = dck.length;
					}
					return decodeURIComponent(dck.substring(cookieStart, cookieEnd));
				}   
			}     
			return '';
		},
		remove: function(name){
			cookie.set(name, null);
		}
	}
	/**
	 * 追加cookie模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		cookie: function (name, value, options){
			if (!isUndefined(value)) {  
		        	cookie.set(name, value, options);
		    	}else{
				return cookie.get(name, value, options);
		    	}
		},
		removeCookie: function(name){
			cookie.remove(name);
		}
	});
	
}(this);
