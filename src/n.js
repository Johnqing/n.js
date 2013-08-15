!function(window, undefined){
	var document = window.document,
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
		// 无参数时需要初始化length 如：E();
		this.length = 0;

		if(!selector){
			return this;
		}

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
				elem = nSelector.adapter( matchItem, lastElem, nextMatch );    

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

	var nSelector = {
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

			type = nextSelector !== undefined ? 'RELATIVE' :
			~selector.indexOf( ':' ) ? 'PSEUDO' :
			~selector.indexOf( '#' ) ? 'ID' :
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
			}
		}
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
	/*
	* 遍历对象并执行回调
	* @param { Object/Array } 对象
	* @param { Function } 回调函数(如果回调函数的返回值为false将退出循环)
	* @param { Object } 上下文
	* @return { Object } 
	*/
	nJs.each = function( obj, fn, context ){        
		var isObj = obj.length === undefined || typeof obj === 'function',
		i;

		if( isObj ){
			for( i in obj ){
				if( fn.call(context, i, obj[i]) === false ){
					break;
				}
			}
		}

		return obj;
	}
	/**
	* 去除字符串的前后空格
	* @param  {String} str
	* @return {String}
	*/
	nJs.trim = function(str){
		return str.replace(/(^\s*)|(\s$)/g, '');
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
	nJs.isNull = function(obj){
		return obj === null;
	}
	nJs.isUndefined = function(obj){
		return obj === void 0;
	}
	nJs.isElement = function(obj){
		return !!obj && obj.nodeType === 1;
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
	* @param  {Function} fn      需要指定上下文的函数
	* @param  {Object}   context 上下文
	* @return
	*/
	nJs.bind = function (fn, context) {
		return function () {
			return fn.apply(context, arguments);
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
	nJs.mix(n.fn, {
		forEach: function( fn ){
			var len = this.length,
			i = 0;

			for( ; i < len; i++ ){
				fn.call( this[i], i, this );
			}

			return this;
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