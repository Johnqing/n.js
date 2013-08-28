!function(window, undefined){
	var ObjProto = Object.prototype,
		ArrayProto = Array.prototype,
		nativeForEach = ArrayProto.forEach,
		slice = ArrayProto.slice,
		push = ArrayProto.push,
		nativeIndexOf = ArrayProto.indexOf,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty,
		breaker = {},
		document = window.document,
		_n = window.n;
		nuid = 0,
		rQuickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,    
		rProtocol = /^(http(?:s)?\:\/\/|file\:.+\:\/)/,
		rModId = /([^\/?]+?)(\.(?:js|css))?(\?.*)?$/, 

	nJs = function(selector, context){
		return new init(selector, context);
	},
	init = function(selector, context){
		var elems, elem, match;
		// 无参数时需要初始化length 如：n();
		this.length = 0;

		if(!selector){
			return this;
		}
		//函数使用ready模块
		if (nJs.isFunction(selector) && nJs.ready) {
			nJs.ready(selector);
			return this;
		};
		//字符串执行选择器
		if (nJs.isString(selector)) {
			//ie需去掉左右空格
			selector = nJs.trim(selector);
			//selector为body
			if (selector === 'body' && !context && document.body) {
				this[0] = document.body;
				this.length = 1;
				return this;
			};
			// selector为HTML字符串时需要转换成DOM节点
			if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
				context = context ? context.ownerDocument || context : document;
				elems = nJs.create(selector, context);
			}else{
				context = context || document;
				match = rQuickExpr.exec(selector);
				// 对于单个的id选择器，使用频率较多，使用快速通道
				if( match && ~match[0].indexOf('#') ){
					context = context ? context.ownerDocument || context : document;                    
					elem = context.getElementById( match[2] );
					if( elem ){
						this[0] = elem;
						this.length = 1;
					}
					return this;
				}

				elems = nJs.query(selector, context);

			}
			return nJs.makeArray(elems, this);
		};
		// selector为DOM节点、window、document、document.documentElement
		if( selector.nodeType || typeof selector === 'object' && 'setInterval' in selector ){
			this[0] = selector;
			this.length = 1;
			return this;
		}

		// selector为Nodelist
		if( typeof selector.length === 'number' ){
			return nJs.makeArray(selector, this);
		}
	}
	//版本信息
	nJs.version = '@VERSION';
	//更新时间
	nJs.released = '@RELEASED';
	nJs.fn = init.prototype = nJs.prototype;
	window.n = window.N = nJs;
	/**
	* 生成全局唯一的id
	* @param  {String} str 前缀
	* @return {String} 全局唯一id
	*/
	nJs.nuid = function(str){
		var id = ++nuid + '';
		return str ? str + id : id;
	}
	
	/**
	* 将源对象的属性并入到目标对象
	* @param {Object} des 目标对象
	* @param {Object|Array} src 源对象，如果是数组，则依次并入
	* @param {boolean} override (Optional) 是否覆盖已有属性。如果为function则初为混合器，为src的每一个key执行 des[key] = override(des[key], src[key], key);
	* @returns {Object} des
	*/
	nJs.mix = function(des, src, override){
		des = des || {};
		//数组的话递归
		if(nJs.isArray(src)){
			for (var i = 0, len = src.length; i < len; i++) {
				nJs.mix(des, src[i], override);
			}
			return des;
		}
		//function为混合器
		if(nJs.isFunction(override)){
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
	/*
	* 遍历对象并执行回调
	* @param { Object/Array } 对象
	* @param { Function } 回调函数(如果回调函数的返回值为false将退出循环)
	* @param { Object } 上下文
	* @return { Object } 
	*/
	nJs.each = function(obj, fn, context){        
		if (obj == null) return;
		
		if (nativeForEach && obj.forEach === nativeForEach){
			obj.forEach(fn, context);
		} else if (obj.length === +obj.length){
			for(var i = 0, l = obj.length; i < l; i++){
				if (i in obj && fn.call(context, obj[i], i, obj) === breaker)
					return;
			}
		} else {
			for(var key in obj){
				if (hasOwnProperty.call(obj, key)){
					if (fn.call(context, key, obj[key], obj) === breaker)
						return;
				}
			}
		}
	}
	nJs.indexOf = function(arr, val){
		if (arr == null) return -1;
		var i, l;
		if (nativeIndexOf && arr.indexOf === nativeIndexOf) return arr.indexOf(val);
		for(i = 0, l = arr.length; i < l; i++) if (arr[i] === val) return i;
		return -1;
	}
	/**
	* 去除字符串的前后空格
	* @param  {String} str
	* @return {String}
	*/
	nJs.trim = function(str){
		return str.replace(/(^[\s\xA0]+)|([\s\xA0]+$)/g, '');
	}

	/**
	* 防止命名空间冲突
	* @param  {String} str 替换n命名空间的名字
	* @return
	*/
	nJs.noConflict = function(str){
		window[str] = window.n;
		window.n = _n;
	}

	/** 
	* 驼峰化字符串。将“ab-cd”转化为“abCd”
	* @method camelize
	* @static
	* @param {String} s 字符串
	* @return {String}  返回转化后的字符串
	*/
	nJs.camelize = function(s) {
		return s.replace(/\-(\w)/ig, function(a, b) {
			return b.toUpperCase();
		});
	}
	/**
	* 私有类型判断函数
	* @param  {String}  type Object/String/Function/Array
	* @return {Boolean}
	*/
	function isType(type){
		return function(obj){
			return toString.call(obj) == "[object "+ type +"]";
		}
	}
	/**
	* 类型判断
	* @type {Boolean}
	*/
	nJs.isObject = isType('Object');
	nJs.isString = isType('String');
	nJs.isNumber = isType('Number');
	nJs.isArray = isType('Array');
	nJs.isFunction = isType('Function');
	nJs.isRegExp = isType('RegExp');
	nJs.isNull = function(obj){
		return obj === null;
	}
	nJs.isUndefined = function(obj){
		return obj === void 0;
	}
	nJs.isElement = function(obj){
		return !!obj && obj.nodeType === 1;
	}
	nJs.isWindow = function(obj){
		return obj && nJs.isObject(obj) && 'location' in obj;
	}
	/**
	* 判断object 包含指定的属性 key
	* @param  {Object} obj 对象集合
	* @param  {String} key 查找键
	* @return {Boolean}
	*/
	nJs.has = function(obj, key){
		return hasOwnProperty.call(obj, key);
	}
	/**
	* 用指定的context作为fn上下文，也就是this
	* @param  {Function} fn 需要指定上下文的函数
	* @param  {Object}   context 上下文
	* @return
	*/
	nJs.bind = function () {
		var oa = slice.call(arguments),
		func = oa.shift(),
		obj = oa.shift();
		return function(){
			var ia = slice.call(arguments),
				ar = [];
			nJs.mix(ar, oa);
			nJs.mix(ar, ia);
			func.apply(obj, ar);
		};
	}
	/*
	* 将对象转换成真实数组
	* 常用于将arguments, NodeList等array-like对象转换成真实数组
	* @param { Anything } 任意类型的数据
	* @param { Array } 目标数组
	* @return { Array } 真实的数组
	*/
	nJs.makeArray = function( source, target ){
		target = target || [];
		var i = 0,
			len = source.length;

		if( source !== null && source !== undefined ){
			if(nJs.isArray(source) && nJs.isArray(target) && !target.length ){
				return source;
			}    

		if( typeof len !== 'number' || 
			typeof source === 'string' || 
			nJs.isFunction(source) ||  
			source === window ||
			// select元素有length属性，select[0]将直接返回第一个option
			// form元素也有length属性
			source.tagName && rSelectForm.test(source.tagName) ){
				target[ target.length++ ] = source;
			}else{
				for( ; i < len; i++ ){
					target[ target.length++ ] = source[i];
				}
			}
		}

		return target;
	}
	/**
	* 调用给定的迭代函数N次
	* @param  {Number} n        调用次数
	* @param  {Function} iterator [description]
	* @param  {Object} context  可选参数
	* @return
	*/
	nJs.times = function(n, iterator, context) {
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
	nJs.once = function(fun) {
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
	* 异步加载script
	* @param  {String}   url      js文件路径
	* @param  {Function} callback 加载完成后回调
	* @return
	*/
	nJs.loadScript = function(url, callback) {
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
	nJs.dFormat = function(d, pattern) {
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
	 * 遍历对象
	 * @param  {Function} fn 回调函数
	 * @return
	 */
	nJs.mix(nJs.fn, {
		forEach: function(fn){
			var len = this.length,
			i = 0;

			for( ; i < len; i++ ){
				fn.call( this[i], i, this );
			}

			return this;
		},
		indexOf: function(val){
			return nJs.indexOf(this, val);
		}
	});
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