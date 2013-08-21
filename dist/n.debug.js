/* n.js - v1.0.0 - https://github.com/Johnqing/n.js - 2013-08-21 */
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
	nJs.version = '1.0.0';
	//更新时间
	nJs.released = '2013-08-21';
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
/**
 * @author johnqing(刘卿)
 * @module Selector
 * @link n.js
 */
!function(nJs){
	// 检测a元素是否包含了b元素
	nJs.contains = function( a, b ){
		// 标准浏览器支持compareDocumentPosition
		if( a.compareDocumentPosition ){
			return !!( a.compareDocumentPosition(b) & 16 );
		}
		// IE支持contains
		else if( a.contains ){
			return a !== b && a.contains( b );
		}

		return false;
	}
	// DOM元素过滤器
	n.filter = function( source, selector ){
		var target = [],
			l = 0,
			matches, filter, type, name, elem, tagName, len, i;

		source = nJs.makeArray( source );
		len = source.length;

		if(nJs.isString(selector) ){
			matches = nJs.nSelector.adapter( selector );
			filter = nJs.nSelector.filter[ matches[0] ];
			name = matches[1];
			tagName = matches[2];
			if( !filter ){
				type = matches[0];
			}

			if( type ){
				target = nJs.nSelector.finder[ type ]( selector, source, true );
			}
			else{
				for( i = 0; i < len; i++ ){
					elem = source[i];
					if( filter(elem, name, tagName) ){
						target[ l++ ] = elem;    
					}                    
				}
			}
		}        
		else if(nJs.isFunction(selector)){
			for( i = 0; i < len; i++ ){
				elem = source[i];
				if( selector.call(elem, i) ){
					target[ l++ ] = elem;
				}
			}            
		}

		source = elem = null;
		return target;
	}
	/**
	* 选择器
	* @param  {String} selector 选择元素
	* @param  {Object} context  父容器
	* @return {Array}           
	*/
	nJs.query = function(selector, context){
		context = context || document;

		if(!nJs.isString(selector)){
			return context;
		}

		var elems = [],
			contains = nJs.contains,
			makeArray = nJs.makeArray,
			nodelist, selectors, splitArr, matchArr, splitItem, matchItem, prevElem,
			lastElem, nextMatch, matches, elem, len, i;

		// 标准浏览器和IE8支持querySelectorAll方法
		if( document.querySelectorAll ){
			try{
				context = makeArray(context);
				len = context.length;
				prevElem = context[0];
				for( i = 0; i < len; i++ ){
					elem = context[i];
					if( !contains(prevElem, elem) ){
						prevElem = elem;
						elems = makeArray(elem.querySelectorAll(selector), elems);
					}
				}
				prevElem = elem = context = null;
				return elems;                
			}catch( e ){};
		}

		splitArr = selector.split( ',' );
		len = splitArr.length;

		for( i = 0; i < len; i++ ){
			nodelist = [ context ];
			splitItem = splitArr[i];

			// 将选择器进行分割
			// #list .item a => [ '#list', '.item', 'a' ]
			if( rRelative.test(splitItem) ){
				splitItem = splitItem.replace( /[>\+~]/g, function( symbol ){
					return ' ' + symbol + ' ';
				});
			}

			matchArr = splitItem.match( /[^\s]+/g );

			for( var j = 0, clen = matchArr.length; j < clen; j++ ){
				matchItem = matchArr[j];                                
				lastElem = makeArray( nodelist[ nodelist.length - 1 ] );

				// 关系选择器要特殊处理
				nextMatch = /[>\+~]/.test( matchItem ) ? matchArr[++j] : undefined; 
				elem = nJs.nSelector.adapter( matchItem, lastElem, nextMatch );    

				if( !elem ){
					return elems;
				}

				nodelist[ nodelist.length++ ] = elem;
			}

			elems = makeArray( nodelist[nodelist.length - 1], elems );        
		}

		nodelist = lastElem = context = elem = null;

		return elems;
	}
	//关于不同属性的适配
	nJs.mix(nJs, {
			nSelector : {
				getAttribute : function( elem, name ){
					return attrMap[ name ] ? elem[attrMap[name]] || null :
					rAttrUrl.test( name ) ? elem.getAttribute( name, 2 ) :
					elem.getAttribute( name );
				},
				/*
				* 选择器的适配器
				* @param { String } 选择器字符串
				* @param { Object } 查找范围
				* @param { String } 关系选择器的第二级选择器
				* @return { Array } 
				* 无查找范围返回[ 选择器类型, 处理后的基本选择器, tagName ]
				* 有查找范围将返回该选择器的查找结果
				*/
				adapter : function( selector, context, nextSelector ){
					var index, name, tagName, matches, type;

					type = nextSelector !== undefined || ~selector.indexOf( '#' ) ? 'ID' :
					~selector.indexOf( '[' ) ? 'ATTR' :
					~selector.indexOf( '.' ) ? 'CLASS' : 'TAG';            

					if( !context ){
						switch( type ){            
							case 'CLASS' :                 
								index = selector.indexOf( '.' );                
								name = ' ' + selector.slice( index + 1 ) + ' ';    
								tagName = selector.slice( 0, index ).toUpperCase();                
								break;                

							case 'TAG' :                
								name = selector.toUpperCase();                    
								break;

							case 'ID' :                
								index = selector.indexOf( '#' );                
								name = selector.slice( index + 1 );        
								tagName = selector.slice( 0, index ).toUpperCase();                    
								break;
						}

						return [ type, name, tagName ];
					}

					return nSelector.finder[ type ](selector, context, nextSelector);
				},
				finder: {
					// id选择器
					ID : function( selector, context ){
						return context[0].getElementById( selector.slice(selector.indexOf('#') + 1) );
					},
					// class选择器
					CLASS : function( selector, context ){        
						var elems = [],
						index = selector.indexOf( '.' ),
						tagName = selector.slice( 0, index ) || '*',
						// 选择器两边加空格以确保完全匹配(如：val不能匹配value) 
						className = ' ' + selector.slice( index + 1 ) + ' ',
						i = 0, 
						l = 0,
						elem, len, name;

						context = nSelector.finder.TAG( tagName, context, true );            
						len = context.length;

						for( ; i < len; i++ ){
							elem = context[i];
							name = elem.className;
							if( name && ~(' ' + name + ' ').indexOf(className) ){
								elems[l++] = elem;
							}
						}

						elem = context = null;
						return elems;
					},
					// tag选择器
					TAG : function( selector, context, noCheck ){
						var elems = [],
							prevElem = context[0],
							contains = nJs.contains,
							makeArray = nJs.makeArray,
							len = context.length,
							i = 0,
							elem;

						// class选择器和context元素只有一个时不需要检测contains的情况
						noCheck = noCheck || len === 1;

						for( ; i < len; i++ ){
							elem = context[i];
							if( !noCheck ){
								// 检测contains情况确保没有重复的DOM元素
								if( !contains(prevElem, elem) ){
									prevElem = elem;    
									elems = makeArray( elem.getElementsByTagName(selector), elems );
								}
							}else{
								elems = makeArray( elem.getElementsByTagName(selector), elems );
							}
						}

						prevElem = elem = context = null;
						return elems;
					},
					// 属性选择器
					ATTR : function( selector, context, isFiltered ){
						var elems = [],
							matches = selector.match( rAttr ),
							getAttribute = nSelector.getAttribute,
							attr = matches[1],
							symbol = matches[2] || undefined,
							attrVal = matches[5] || matches[4],            
							i = 0,
							l = 0,
							len, elem, val, matchAttr, sMatches, filterBase, name, tagName;            

						selector = selector.slice( 0, selector.indexOf('[') ) || '*';
						context = isFiltered ? context : nSelector.adapter( selector, context );
						len = context.length;
						sMatches = nSelector.adapter( selector );
						filterBase = nSelector.filter[ sMatches[0] ];
						name = sMatches[1];
						tagName = sMatches[2];       

						for( ; i < len; i++ ){
							elem = context[i];
							if( !isFiltered || filterBase(elem, name, tagName) ){
								val = getAttribute( elem, attr );        
								// 使用字符串的方法比正则匹配要快
								matchAttr = val === null ? 
									symbol === '!=' && val !== attrVal :
									symbol === undefined ? val !== null :
									symbol === '=' ? val === attrVal :
									symbol === '!=' ? val !== attrVal :
									symbol === '*=' ? ~val.indexOf( attrVal ) :
									symbol === '~=' ? ~( ' ' + val + ' ' ).indexOf( ' ' + attrVal + ' ' ) :
									symbol === '^=' ? val.indexOf( attrVal ) === 0 :
									symbol === '$=' ? val.slice( val.length - attrVal.length ) === attrVal :                            
									symbol === '|=' ? val === attrVal || val.indexOf( attrVal + '-' ) === 0 :
									false;

								if( matchAttr ){
									elems[l++] = elem;
								}
							}
						}

						elem = context = null;    
						return elems;
					}
				},
				filter: {
					// ID过滤器    
					ID : function( elem, name, tagName ){
						var isTag = isTag = tagName === '' || elem.tagName === tagName;
						return isTag && elem.id === name;
					},

					// class过滤器
					CLASS : function( elem, name, tagName ){
						var className = elem.className,
						isTag = tagName === '' || elem.tagName === tagName;                
						return isTag && className && ~( ' ' + className + ' ' ).indexOf( name );
					},

					// tag过滤器
					TAG : function( elem, name ){
						return elem.tagName === name;
					}
				}
			}
	});
}(n);
/**
 * @author johnqing(刘卿)
 * @module DATA
 * @link n.js
 */
!function(n){
	//生成时间戳
	function timeStp(){
		return (new Date).getTime();
	}
	var exp = 'NJS' + timeStp(),
		windowData = {};
	n.exp = exp;
	n.mix(n, {
		isEmptyObject: function(obj){
			for(var i in obj){
				return false;
			}
			return true;
		},
		data: function(elem, name, data){
			// 取得元素保存数据的键值
			var nuid = elem[exp], 
				cache = n.cache,
				thisCache;
			// 没有 id 的情况下，无法取值
			if (!nuid && n.isString(name) && n.isUndefined(data)) {
				return null;
			};
			//为元素计算一个唯一的id
			if (!nuid) {
				nuid = n.nuid();
			};
			//如果不在缓存 创建一个
			if (!cache[nuid]) {
				//在元素上保存键值
				elem[exp] = nuid; 
				//在 cache 上创建一个对象保存元素对应的值
				cache[nuid] = {};
			};
			thisCache = cache[nuid];
			//保存,防止重写
			if (n.isUndefined(data)) {
				thisCache[name] = data;
			};
			// 返回对应的值
			return n.isString(name) ? thisCache[name] : thisCache;

		},
		removeData: function(elem, name){
			// 取得元素保存数据的键值
			var nuid = elem[exp], 
				cache = n.cache,
				thisCache = cache[nuid];

			if (name) {
				if (thisCache) {
					//删除缓存
					delete thisCache[name];
					//元素上的缓存都被删掉的时候，删除缓存
					if (n.isEmptyObject(thisCache)) {
						n.removeData(elem);
					};
				};
			}else{
				delete elem[n.exp];
				//删除全局缓存
				delete cache[nuid];
			}
		}
	});
	//
	n.mix(n.fn, {
		data: function(key, val){
			//val不传，返回当前的key
			if (n.isUndefined(val)) {
				return n.data(this[0], key);
			}else{
				this.forEach(function(){
					n.data(this, key, value);
				});
			}
		},
		removeData: function(){
			return this.forEach(function(){
				n.removeData(this, key);
			});
		}
	});

}(n);

/**
 * @author johnqing(刘卿)
 * @module DOM
 * @link n.js
 */
!function(n){
	var document = window.document,
	slice = Array.prototype.slice,
	rRelative = /[>\+~][^\d\=]/,
	rSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
	rTagName = /<([\w:]+)/,
	rXhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rNumpx = /^-?\d+(?:px)?$/i,
	rAlpha = /alpha\([^)]*\)/i,        
	rNum = /^-?\d/,
	rPosition = /^(?:left|right|top|bottom)$/i,
	rBorderWidth = /^border(\w)+Width$/,
	isECMAStyle = !!(document.defaultView && document.defaultView.getComputedStyle),
	hasDuplicate = false,    // 是否有重复的DOM元素
	hasParent = false,    // 是否检测重复的父元素
	baseHasDuplicate = true;    // 检测浏览器是否支持自定义的sort函数

	// 检测浏览器是否支持自定义的sort函数
	[ 0, 0 ].sort(function(){
		baseHasDuplicate = false;
		return 0;
	});
	var getStyle = window.getComputedStyle ?
		function(a, b, c){
			if( c == undefined){
				b = b.replace(/([A-Z])/g, "-$1");
				b = b.toLowerCase();
				return window.getComputedStyle(a, null).getPropertyValue(b);
			}else{
				a.style[b] = c;
			}
		}
		:function(a, b, c){
			if( c == undefined){
				if(b == "opacity"){
					return a.style.filter.indexOf("opacity=") >= 0 ? parseFloat(a.style.filter.match(/opacity=([^)]*)/)[1]) / 100 : "1";
				}else {
					return a.currentStyle[b] == "auto" ? 0 : a.currentStyle[b];
				}
			}else{
				if(b == "opacity"){
					a.style.filter = (a.filter || "").replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + c * 100 + ")";
				}else{
					a.style[b] = c;
				}
			}
		}
	/**
	 * 设置样式
	 * @param {String} name 样式名
	 * @param {String} val  设置的值
	 */
	function setCss(elem, name, val){
		//ie6总是这么特殊，单独处理
		if (name === 'opacity' && n.browser.ie && n.browser.version.toString().indexOf('6')  !== -1) {
			name = 'filter';
			val = 'alpha(opacity='+ val*100 +')';
		}else{
			val = (name === 'opacity' || isNaN(parseInt(val)) ) ? val : (parseInt(val) + 'px');
		}
		elem.style[name] = val;
	}
	//获取元素的位置
	function position(elem, type){
		elem = elem[0];
		var elementScrollLeft,
			actLeft = elem.offsetLeft,
			actTop = elem.offsetTop,
			currNode = elem.offsetParent;

		while(!n.isNull(currNode)){
			actTop += currNode.offsetTop;
			actLeft += currNode.offsetLeft;
			currNode = currNode.offsetParent;			
		}
		if (!type) {
			return {
				left: actLeft,
				top: actTop
			};
		};
		var bdy = document.body,
			delem = document.documentElement;
		elementScrollLeft = delem.scrollLeft;
		elementScrollTop = delem.scrollTop;

		if (document.compatMode != 'CSS1Compat') {
			elementScrollLeft = bdy.scrollLeft;
			elementScrollTop = bdy.scrollTop
		};
		return {
			left: actualLeft - elementScrollLeft,
			top: actualTop - elementScrollTop
		};

	}

	var nNode = {
		/**
		 * 获取节点列表
		 * @return {Array} 
		 */
		getNodelist: function (arg, context){
			var elems;
			if (n.isString(arg)) {
				elems = n.create(arg, context);
				return elems ? n.makeArray(elems) : [context.createTextNode(arg)];
			};
			//elem对象返回自身
			if (arg.nodeType == 1 || arg.nodeType == 11) {
				return [arg];
			};
			if (n.isNumber(arg.length)) {
				return n.makeArray(arg);
			};
			return [];
		},
		clone: function(elem){
			return elem.cloneNode(true);
		},
		/**
		 * dom节点公共方法
		 * @param  {Object}   elem      操作元素
		 * @param  {Function} fn        适配方法
		 * @param  {Boolean}  isReverse 是否反选
		 * @param  {Object}   context   根节点
		 * @return {[type]}             [description]
		 */
		domMain: function (elem, fn, isReverse, context){
			var source,
				sourceLen,
				elemsLen,
				lastIndex,
				fragment,
				elems = [];

			if (isReverse) {
				source = nNode.getNodelist(elem[0], context);
				elem = this;
			}else{
				source = this;
			}
			sourceLen = source.length;
			elemsLen = elem.length;
			lastIndex = sourceLen - 1;

			for (var i = 0; i < elemsLen; i++) {
				elems = n.makeArray(nNode.getNodelist(elem[i], context), elems);
			};

			if (elems.length === 1) {
				fragment = elems[0];
			}else{
				//元素很多的时候 添加到文档碎片
				fragment = context.createDocumentFragment();
				for (var i = 0; i < elems.length; i++) {
					fragment.appendChild(elems[i]);
				};
			}

			for (var i = 0; i < sourceLen; i++) {
				fn.call(source[i], i === lastIndex ? fragment : nNode.clone(fragment));	
			}

			fragment = elems = elem = null;
			return this;

		}
	}
	//给n上注册方法
	n.mix(n, {
		/**
		 * create DOM element
		 * @param  {String} html dom节点字符串
		 * @param  {Object} doc   父对象
		 * @return {Object}
		 */
		create: function(html, doc){
			if(!html) return;
			doc = doc || document;

			var tagName = html.match(rTagName),
				pNode,fragment;
			//取出当前的节点名
			if(!tagName) return;
			tagName = tagName[1];
			//只有一个节点之间创建
			if (rSingleTag.test(html)) {
				return [doc.createElement(tagName)];
			}
			//防止<div/>这样的标签
			html = html.replace(rXhtml, '<$1><' + '/$2>'); 
			pNode = doc.createElement('p');
			fragment = doc.createDocumentFragment();

			fragment.appendChild(pNode);

			pNode.innerHTML = html;
			return pNode.childNodes;
		},
		/*
		* 对一组DOM元素按照在DOM树中的顺序进行排序
		* 同时删除重复或同级的DOM元素
		* @param { Array } DOM数组
		* @param { Boolean } 是否检测重复的父元素，如果该参数为true，
		* 将删除同级元素，只保留第一个
		* @return { Array } 
		*/
		unique : function( nodelist, isParent ){
			if( nodelist.length < 2 ){
				return nodelist;
			}
			var i = 0,
			k = 1,
			len = nodelist.length;

			hasDuplicate = baseHasDuplicate;
			hasParent = isParent;

			// IE的DOM元素都支持sourceIndex
			if( nodelist[0].sourceIndex ){
				var arr = [],                  
				obj = {},
				elems = [],
				j = 0,
				index, elem;

				for( ; i < len; i++ ){
					elem = nodelist[i];
					index = ( hasParent ? elem.parentNode.sourceIndex : elem.sourceIndex ) + 1e8;    

					if( !obj[index] ){
						( arr[j++] = new String(index) ).elem = elem;
						obj[index] = true;
					}
				}

				arr.sort();

				while( j ){
					elems[--j] = arr[j].elem;
				}

				arr = null;
				return elems;
			}
			// 标准浏览器的DOM元素都支持compareDocumentPosition
			else{
				nodelist.sort(function( a, b ){
					if( hasParent ){
						a = a.parentNode;
						b = b.parentNode;
					}

					if( a === b ){
						hasDuplicate = true;
						return 0;
					}

					return a.compareDocumentPosition(b) & 4 ? -1 : 1;
				});

				if( hasDuplicate ){
					for( ; k < nodelist.length; k++ ){
						elem = nodelist[k];
						if( hasParent ? elem.parentNode === nodelist[k - 1].parentNode : elem === nodelist[k - 1] ){
							nodelist.splice( k--, 1 );
						}
					}
				}

				return nodelist;
			}
		}
	});
	//n的原型上注册方法
	n.mix(n.fn, {
		show: function(){
			this.forEach(function(){
				this.style.display = "";
			});
			return this;
		},
		hide: function(){
			this.forEach(function(){
				this.style.display = "none";
			});
			return this;
		},
		/**
		 * 查找子节点
		 * @param  {String} selector 节点名
		 * @return {Array}          nodeList
		 */
		find: function( selector ){        
			if(typeof selector === 'string'){            
				return n.makeArray(n.query(selector, this), n());                    
			}
		},
		/**
		 * 节点克隆
		 * @return {Array} 节点数组
		 */
		clone: function(){
			var elems = [],i = 0;
			this.forEach(function(){
				elems[i++] = nNode.clone(this);
			});
			return elems;
		},
		/**
		 * 插入字符串或获取当前
		 * @param  {String|Object} context 插入的元素
		 * @return 
		 */
		html: function(context){
			if (!context) {
				return (this[0] && n.trim(this[0].innerHTML)) || '';
			};
			return this.forEach(function(){
				this.innerHTML = context;
			});
		},
		/**
		 * 设置或获取style
		 * @param  {String|Object} name 
		 * @param  {String} val  
		 * @return
		 */
		css: function(name, val){
			if (n.isUndefined(val)) {
				return getStyle(this[0], name, val);
			};
			this.forEach(function(){
				setCss(this, name, val);
			});			
			return this;
		},
		/**
		 * 判断是否有当前样式
		 * @param  {String}  name 样式名
		 * @return {Boolean} 
		 */
		hasClass: function(name){
			return n(this)[0].className.indexOf(name) > -1;
		},
		/**
		 * 添加样式
		 * @param {String} name 样式名
		 */
		addClass: function(name){
			var _this = n(this);
			if (_this.hasClass(name)) return;
			_this[0].className += _this[0].className.length == 0 ? name : ' ' + name;
			return this;
		},
		/**
		 * 删除样式
		 * @param  {String} name 样式名
		 * @return
		 */
		removeClass: function(name){
			var _this = n(this);
			if (!_this.hasClass(name)) return;
			_this[0].className = _this[0].className.replace(new RegExp('(?:^|\\s)' + regEscape(name) + '(?=\\s|$)', 'ig'), '');
			return this;
		},
		/**
		 * 设置或获取属性
		 * @param  {String|Object} name 
		 * @param  {String} val  
		 */
		attr: function(name, val){
			var _this = n(this);
			if (n.isObject(name)) {
				n.each(name, function(n, v){
					_this.attr(n, v);
				});
			};
			if (n.isUndefined(val)) {
				return _this[0].getAttribute(name);
			};
			this.forEach(function(){
				this.setAttribute(name, val);
			});
			return this;
		},
		/**
		 * 删除属性
		 * @param  {String} name 属性名
		 * @return
		 */
		removeAttr: function(name){
			n(this).attr(name);
			return this;
		},
		/**
		 * 设置或获取元素的值
		 * @param  {String} context
		 * @return
		 */
		val: function(context){
			if (!context) {
				return (this[0] && n.trim(this[0].value)) || '';
			};
			return this.forEach(function(){
				this.value = context;
			});
		},
		/**
		 * 筛取元素
		 * @param  {Number} start 起始位置
		 * @param  {Number} end   结束位置
		 * @return {Array}       筛选出的数组
		 */
		slice: function(start, end){
			end = end ? end : this.length;
			return n.makeArray(slice.call(this, start, end), n());
		},
		/**
		 * 获取指定索引的元素
		 * @param  {Object} index 索引
		 * @return {Object}
		 */
		eq: function(index){
			return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
		},
		/**
		 * 获取当前元素的一些坐标信息
		 * @return {Object} width|height|scrollX|scrollY|scrollWidth|scrollHeight
		 */
		docRect: function(){
			 var _this = n(this)[0],
			 	win = _this.defaultView || _this.parentWindow,
			 	mode = _this.compatMode,
			 	root = _this.documentElement,
			 	h = win.innerHeight || 0,
				w = win.innerWidth || 0,
				scrollX = win.pageXOffset || 0,
				scrollY = win.pageYOffset || 0,
				scrollW = root.scrollWidth,
				scrollH = root.scrollHeight;
			//ie6 Quirks模式返回正确的值
			if (mode != 'CSS1Compat') {
				root = _this.body;
				scrollW = root.scrollWidth;
				scrollH = root.scrollHeight;
			};
			//ie,Gecko
			if (mode && n.browser.opera) {
				w = root.clientWidth;
				h = root.clientHeight;
			};
			//网页内容能够在浏览器窗口中全部显示，不出现滚动条
			//clientWidth和scrollWidth根据浏览器不同，值可能不等
			//所以取较大的值
			scrollW = Math.max(scrollW, w);
			scrollH = Math.max(scrollH, h);

			scrollX = Math.max(scrollX, _this.documentElement.scrollLeft, _this.body.scrollLeft);
			scrollY = Math.max(scrollY, _this.documentElement.scrollTop, _this.body.scrollTop);

			return {
				width: w,
				height: h,
				scrollWidth: scrollW,
				scrollHeight: scrollH,
				scrollX: scrollX,
				scrollY: scrollY
			};
		},
		/**
		 * 获取元素的相对位置
		 * @return {Object} left|top
		 */
		position: function(){
			var _this = n(this);
			return position(_this, 1);
		},
		/**
		 * 获取元素的绝对位置
		 * @return {Object} left|top
		 */
		offset: function(){
			var _this = n(this);
			return position(_this);
		}
	});
	//DOM使用
	n.each({
		append: function(source, target){
			source.appendChild( target );
			source = target = null;
		},
		before: function(source, target){
			source.parentNode.insertBefore(target, source);
			source = target = null;
		},
		after: function(source, target){
			source.parentNode.insertBefore(target, source.nextSibling);
			source = target = null;
		}
	},function(key, fn){
		var index = key.indexOf('To'),
			flag = index !== -1,
			name = flag ? key.substring(0, index) : key;

		n.fn[key] = function(){
			var arg = arguments[0],
				context = this[0].ownerDocument;

			//没有任何参数直接弹回
			if (n.isUndefined(arg)) {
				return this;
			};

			return nNode.domMain.call(this, arguments, function(elem){
				fn(this, elem);
			}, flag, context)
		}
	});
	//关系查找器
	n.each({
		siblings: function(filter, flag, name, tagName, context){
			var len = context.length,
				elems = [],
				i = 0,
				l = 0,
				elem, self;    

			for( ; i < len; i++ ){
				self = context[i];
				// 先查找到该元素的第一个同级元素
				elem = self.parentNode.firstChild;

				while( elem ){
					// 需要过滤掉自身
					if( elem.nodeType === 1 && elem !== self && (flag || filter(elem, name, tagName)) ){
						elems[ l++ ] = elem;
					}
					// 使用next去遍历同级元素
					elem = elem.nextSibling;
				}            
			}

			elem = self = context = null;
			return elems;
		},
		children: function(filter, flag, name, tagName, context){
			var len = context.length,
				clen,
				elems = [],
				i = 0,
				l = 0,
				j = 0,
				elem, node;

			for (; i < len; i++) {
				elem = context[i].childNodes;
				clen = elem.length;
				for (;j < clen; j++) {
					node = elem[j];
					if( node.nodeType === 1 && (flag || filter(node, name, tagName)) ){
						elems[l++] = node
					}
				};
			};
			elem = node = context = null;
			return elems;
		},
		parent: function(filter, flag, name, tagName, context){
			var isType = n.isString(filter),
				len,
				elems = [],
				i = 0,
				l = 0,
				elem, self;    

			context = n.unique(context, true);
			len = context.length;

			for( ; i < len; i++ ){
				self = context[i];
				elem = self.parentNode;

				while(elem){
					// 需要过滤掉自身
					if( elem.nodeType !== 11 && (flag || filter(elem, name, tagName)) ){
						elems[ l++ ] = elem;
						if (!isType) {
							break;
						};
					}
					// 使用next去遍历同级元素
					elem = elem.parentNode;
				}            
			}

			elem = self = context = null;
			return elems;
		}
	}, function(key, fn){
		n.fn[key] = function(selector){
			var flag = false,
				isType = false,
				context = n.makeArray(this),
				matches, filter, name, tagName, type, elems;

			if (!selector) {
				flag = true;
			}else{
				matches = n.nSelector.adapter(selector);
				filter = n.nSelector.filter[matches[0]] || matches[0];
				name = matches[1];
				tagName = matches[2];
				if (n.isString(filter)) {
					isType = flag = true;
				};
			}

			elems = fn(filter, flag, name, tagName, context);

			elems = isType ? n.nSelector.finder[filter](selector, elems, true) : elems;

			// siblings的查找结果需要去重
			if( key === 'siblings' ){
				elems = n.unique(elems);
			}

			context = null;


			// 逗号选择器的结果查找父元素可能存在重复的结果需要去重
			return n.makeArray((key === 'parent' && selector ? n.unique(elems) : elems), n());
		}
	});
}(N);

/**
 * @author johnqing(刘卿)
 * @module Event
 * @link n.js
 */
!function(n){
	var document = window.document,
		eventIndexId = 1;
		handlers = {},
		evtMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];
	//获取/设置当前元素的唯一id
	function getGuid(obj){
		return obj.eventIndexId || (obj = eventIndexId++);;
	};

	function bind(o, type, fn){
		if (o.addEventListener){
			o.addEventListener(type, fn, false);	
		}else{
			o['e' + type + fn] = fn;
			o[type + fn] = function(){
				o['e' + type + fn](window.event);
			};
			o.attachEvent('on' + type, o[type + fn]);
		}
	}

	function unbind(o, type, fn){
		if (o.removeEventListener){
			o.removeEventListener(type, fn, false);
			return o;
		}
		o.detachEvent('on' + type, o[type + fn]);
		o[type + fn] = null;
	}

	function parseEvt(evt){
		var parts = ('' + evt).split('.');
		return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
	}

	function matcherFor(ns){
		return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
	}

	function findHdls(el, evt, fn, sel){
		evt = parseEvt(evt);
		if (evt.ns) var m = matcherFor(evt.ns);
		return n.filter(handlers[getGuid(el)] || [], function(hdl){
			return hdl
				&& (!evt.e  || hdl.e == evt.e)
				&& (!evt.ns || m.test(hdl.ns))
				&& (!fn     || hdl.fn == fn)
				&& (!sel    || hdl.sel == sel);
		});
	}

	var nEvent = {
		/**
		 * 代理
		 * @param  {Object} evt 事件对象
		 * @return {Object}
		 */
		createProxy: function (evt){
			evt = evt || window.event;
			evt.target = evt.target || evt.srcElement;
			var proxy = n.mix({originalEvent: evt}, evt);
			n.each(evtMethods, function(key){
				proxy[key] = function(){
					return evt[key].apply(evt, arguments);
				};
			});
			return proxy;
		},
		addEvt: function (el, evts, fn, sel, delegate){
			var id = getGuid(el), handlersSet = (handlers[id] || (handlers[id] = []));
			n.each(evts.split(/\s/), function(evt){
				var handler = n.mix(parseEvt(evt), {fn: fn, sel: sel, del: delegate, i: handlersSet.length});
				handlersSet.push(handler);
				bind(el, handler.e, delegate || fn);
			});
			el = null;
		},
		remEvt: function(el, evts, fn, sel){
			var id = getGuid(el);
			n.each((evts || '').split(/\s/), function(evt){
				n.each(findHdls(el, evt, fn, sel), function(hdl){
					delete handlers[id][hdl.i];
					unbind(el, hdl.e, hdl.del || hdl.fn);
				});
			});
		}
	}
	//多个事件同时绑定
	n.each('blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error'.split(' '), function(key){
		n.fn[key] = function(fn){
			return this.forEach(function(){
				nEvent.addEvt(this, key, fn);
			});
		}
	});
	//注册到n.prototype上去的方法
	n.mix(n.fn, {
		/**
		 * 绑定
		 * @param  {String} type    事件类型
		 * @param  {Function} handler 绑定函数
		 * @return {Object}        this对象
		 */
		on: function(type, handler){
			return this.forEach(function(){
				nEvent.addEvt(this, type, handler);
			});
		},
		/**
		 * 解除绑定
		 * @param  {String} type    事件类型
		 * @param  {Function} handler 绑定函数
		 * @return {Object}        this对象
		 */
		un: function(type, handler){
			return this.forEach(function(){
				 nEvent.remEvt(this, type, handler);
			});
		},
		/**
		 * 绑定事件代理
		 * @param  {String} selector 委托目标
		 * @param  {String} type     委托事件类型
		 * @param  {Function} handler  委托函数
		 * @return 
		 */
		delegate: function(selector, type, handler){
			return this.forEach(function(i, el){
				el = el[0];
				nEvent.addEvt(el, type, handler, selector, function(ev){
					var target = ev.target,
						merg,
						nodes = n(selector, el);
					while (target && nodes.indexOf(target) < 0){
						target = target.parentNode;
					}
					if (target && !(target === el) && !(target === document)){
						merg = n.mix(nEvent.createProxy(ev), {currentTarget: target, liveFired: el});
						handler.call(target, merg);
					}
				});
			});
		},

		unDelegate: function(selector, type, handler){
			return this.forEach(function(){
			 	nEvent.remEvt(this, type, handler, selector);
			});
		},
		/**
		* 触发对象的指定事件
		* @param	{Object}	el	要触发事件的对象
		* @param	{string}	type	事件名称
		* @return
		*/
		fire: function(type){
			var el = n(this)[0];
			if (document.dispatchEvent) {
				var evt = null,
					doc = el.ownerDocument || el;
				if (/mouse|click/i.test(type)) {
					evt = doc.createEvent('MouseEvents');
					evt.initMouseEvent(type, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
				} else {
					evt = doc.createEvent('Events');
					evt.initEvent(type, true, true, doc.defaultView);
				}
				el.dispatchEvent(evt);
			} else {
				el.fireEvent('on' + type);
			}
			return this;
		}
	});
}(n);
/**
 * @author johnqing(刘卿)
 * @module 浏览器嗅探模块
 * @link n.js
 */
!function(window){
	var document = window.document;
	n.mix(n, {
		browser: function(){
			var version = 0,
				agent = navigator.userAgent.toLowerCase(),
				opera = window.opera,
				browser = {
					/**
					 * 判断是否ie
					 * @type {Boolean} true|false
					 */
					ie: !!window.ActiveXObject,
					/**
					 * 判断是否opera
					 * @type {Boolean} true|false
					 */
					opera: (!!opera && opera.version),
					/**
					 * 判断是否webkit
					 * @type {Boolean} true|false
					 */
					webkit: (agent.indexOf(' applewebkit/') > -1),
					/**
					 * [quirks description]
					 * @type {Boolean} true|false
					 */
					quirks: (document.compatMode == 'BackCompat'),
					/**
					 * 判断是否gecko
					 * @type {Boolean} true|false
					 */
					gecko: (navigator.product == 'Gecko' && !this.webkit && !this.opera)

				};
			/**
			 * ie 版本
			 */
			if (browser.ie) {
				version = parseFloat(agent.match(/msie (\d+)/ )[1]);
				/**
				* 检测浏览器是否为 IE9 模式
				* @type {Boolean} true|false
				*/
				browser.ie9Compat = document.documentMode == 9;
				/**
				* 检测浏览器是否为 IE8 浏览器
				* @name ie8
				* @type {Boolean} true|false
				*/
				browser.ie8 = !!document.documentMode;

				/**
				* 检测浏览器是否为 IE8 模式
				* @name ie8Compat
				* @type {Boolean} true|false
				*/
				browser.ie8Compat = document.documentMode == 8;

				/**
				* 检测浏览器是否运行在 兼容IE7模式
				* @name ie7Compat
				* @type {Boolean} true|false
				*/
				browser.ie7Compat = ((version == 7 && !document.documentMode) || document.documentMode == 7);

				/**
				* 检测浏览器是否IE6模式或怪异模式
				* @name ie6Compat
				* @type {Boolean} true|false
				*/
				browser.ie6Compat = (version < 7||browser.quirks);
			};
			/**
			 * gecko 版本
			 */
			if ( browser.gecko ){
				var geckoRelease = agent.match(/rv:([\d\.]+)/);
				if (geckoRelease){
					geckoRelease = geckoRelease[1].split( '.' );
					version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
				}
			}
			/**
			* 检测浏览器是否为chrome
			* @name chrome
			* @type {Boolean} true|false
			*/
			if (/chrome\/(\d+\.\d)/i.test(agent)) {
				browser.chrome = + RegExp['\x241'];
			}
			/**
			* 检测浏览器是否为safari
			* @name safari
			* @type {Boolean} true|false
			*/
			if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
				browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
			}


			// Opera 9.50+
			if (browser.opera){
				version = parseFloat(opera.version());
			}

			// WebKit 522+ (Safari 3+)
			if (browser.webkit){
				version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
			}
			/**
			* 浏览器版本判断
			* IE系列返回值为5,6,7,8,9,10等
			* gecko系列会返回10900，158900等.
			* webkit系列会返回其build号 (如 522等).
			* @name version
			* @example
			* if (n.browser.ie && n.browser.version == 6 ){
			*     alert( "万恶的IE6，去死吧!" );
			* }
			*/
			browser.version = version;
			/**
			* 是否是兼容模式的浏览器
			* @name isCompatible
			* @type {Boolean} true|false
			* @example
			* if (n.browser.isCompatible){
			*     alert("你的浏览器相当不错哦！");
			* }
			*/
			browser.isCompatible =
				!browser.mobile && ((browser.ie && version >= 6) 
				|| (browser.gecko && version >= 10801) 
				|| (browser.opera && version >= 9.5) || (browser.air && version >= 1) 
				|| (browser.webkit && version >= 522) || false);

			return browser;
		}()
	});
}(this);

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
		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
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
					resType = xmlHttp[_this.responseFields[_this.dataType]];
					_this.success.call(_this, resType);
				}else if(xmlHttp.status == 0){
					_this.error.call(_this, '请求失败');
				}else{
					_this.error.call(_this, xmlHttp.responseText);
				}
			};
			if(type === "POST"){
				xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
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
 * @author 王迎然(www.wangyingran.com)
 * @module ready模块
 * @link n.js
 */

!function(n) {

	var document = window.document,
		funcQueue = [],
		addEventListener = document.addEventListener,
		eventType = addEventListener ? 'DOMContentLoaded' : 'readystatechange',
		isReady = false,
		readyBound = false;

	var fireReady = function() {
		// 如果加载完毕，直接返回
		if (isReady) return;
		// 设置标识
		isReady = true;
		// 执行队列函数
		while (funcQueue.length) {
			funcQueue.shift()();
		}
		// 清空队列
		funcQueue = null;
	}

	var DOMContentLoaded = function() {
		var readyState = document.readyState;
		if (addEventListener || readyState === "complete") {
			n(document).un(eventType, DOMContentLoaded);
			fireReady();		
		}		
    };

	var readyPromise = function() {

		if (readyBound) return;
		readyBound = true;
		
		// 绑定事件
		n(document).on(eventType, DOMContentLoaded);

		if (!addEventListener){
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			// 如果是ie，并且不存在iframe，连续检查是否加载完毕
			if (top && top.doScroll) {
				(function doScrollCheck() {
					if (!isReady) {
						try {
							top.doScroll('left');
						} catch (e) {
							setTimeout(doScrollCheck, 0);
							return;
						}
						fireReady();
					}
				})();
			}
		}

	};

	var ready = function(f) {
		if (isReady) {
			f();
		} else {
			funcQueue.push(f);
			readyPromise();
		}
	};

	/**
	 * 追加ready模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		ready : function(f) {
			ready(f);
		}
	});

}(n);

/**
 * @author johnqing(刘卿)
 * @module Class
 * @link n.js
 */
n.mix(n, {
	/**
	 * js类包装器
	 * @param {Function} parent 需要继承的类
	 * @param {Object} data   该类的方法和属性集合，接口为Init（构造器）/Public（公共）/Private（私有），必须包含Init构造器
	 * @return {Function} 该类
	 */
	Class: function(parent, data){
		var init,
			privates,
			publics;

		var merge = n.mix,
			bind = n.bind;
			isFn = n.isFunction;
		//上下文限定
		var bound = function(b, ob){
			var reta = {};
			//合并b到空对象上去
			merge(reta, b);
			//递归取出其中的函数
			for(var m in b){
				b.hasOwnProperty(m) && isFn(b[m]) && (reta[m] = bind(b[m], ob));
			};
			return reta;
		}
		data = n.isUndefined(data) ? parent : data;
		//取出传入对象的 共有和私有方法
		publics = data.Public || {};
		privates = data.Private || {};
		//构造函数必须存在
		init = data.Init;

		//没有构造函数 直接报错
		if (!isFn(init)) {
			throw '构造函数不存在';
		};
		//如果共有方法内存在私有方法，报错
		for(var m in publics){
			if(privates[m] !== undefined ){
				throw "方法 "+ m +" 不应在公有和私有方法中同时出现";
			}
		}
		//klass
		var klass = function(){
			var i, 
				uper = klass.prototype.$uper;
			if (parent && parent.prototype) {
				var parentPro = parent.prototype,
				//构造器的父级
				uper = {};
				merge(uper, parentPro);
				parent.apply(uper, arguments);

				//继承
				merge(this, uper);
				merge(this, bound(uper, parentPro));
				this.$uper = uper;
			};
			//创造一个hash表，来存储函数
			var vis = {},
				_this = this;

			//拆分对象
			var updateObj = function(){
				for(var p in vis){
					if (privates.hasOwnProperty(p) && vis.hasOwnProperty(p) && privates[p] !== vis[p]) {
						privates[p] = vis[p];
					}else if (publics.hasOwnProperty[p] && _this[p] !== vis[p]) {
						_this[p] = vis[p];
					};
				}
			}
			//切换this的指向
			var vt = function(fun){
				return function(){
					fun.apply(vis, arguments);
					updateObj();
				}
			}
			//遍历Pubice下的方法和属性
			for(i in publics){
				if (publics.hasOwnProperty(i) && isFn(publics[i])) {
					//函数需要切换this的指向
					_this[i] = vt(publics[i]);
				}else if(publics.hasOwnProperty(i)){
					//普通属性之间赋值
					_this[i] = publics[i];
				}
			}
			//合并私有方法和属性
			merge(vis, privates);
			//合并this
			merge(vis, _this);
			//init的上下文切换
			init.apply(vis, arguments);

			updateObj();

		}
		return klass;
	}
});