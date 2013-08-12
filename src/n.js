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
	 * @todo 还有其他解决方案么？
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
		var cElem = document.createElement('p');
		cElem.innerHTML = elStr;
		elStr = document.createDocumentFragment(cElem);

		while(document = cElem.firstChild){
			elStr.appendChild(document);
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
	// RequireJS || SeaJS
	if (typeof define === 'function') {
		define(function(require, exports, module) {
			module.exports = n;
		});
	// NodeJS
	} else if (typeof exports !== 'undefined') {
		module.exports = n;
	}
}(this);
