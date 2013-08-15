/* n.js - v1.0.0 - https://github.com/Johnqing/n.js - 2013-08-15 */
!function(window, undefined){
	var ObjProto = Object.prototype,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty,
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
	nJs.released = '2013-08-15';
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
/**--------------DOM----------------------------------------------------**/
!function(n){
	var rRelative = /[>\+~][^\d\=]/,
    rSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
    rTagName = /<([\w:]+)/,
    rXhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rNumpx = /^-?\d+(?:px)?$/i,
    rAlpha = /alpha\([^)]*\)/i,        
    rNum = /^-?\d/,
    rPosition = /^(?:left|right|top|bottom)$/i,
    rBorderWidth = /^border(\w)+Width$/,
    isECMAStyle = !!(document.defaultView && document.defaultView.getComputedStyle),
    cssHooks = {};

	/** 
	 * 获得element对象当前的样式
	 * @method	getCurrentStyle
	 * @param	{element|string|wrap}	el
	 * @param	{string}                attribute	样式名
	 * @return	{string}				
	 */
	function getCurrentStyle(el, attribute) {
		if(isECMAStyle){
			var doc = el.ownerDocument,
				defaultView = doc.defaultView,
				val;

			if( defaultView ){
				val = defaultView.getComputedStyle( el, null )[ attribute ];
			}

			// 取不到计算样式就取其内联样式
			if( val === '' ){
				val = el.style[ attribute ];
			}
			return val;
		}
		return getCurrent(el, attribute);
	}
	function getCurrent(el, attribute){
		var val = el.currentStyle && el.currentStyle[ attribute ],
			style = el.style,
			left, rsLeft;

		// 取不到计算样式就取其内联样式
		if( val === null ){
			val = style[ attribute ];
		}

		// 将IE中的字体大小的各种单位统一转换成px：12pt => 16px
		if( !rNumpx.test(val) && rNum.test(val) ){
			left = style.left;
			rsLeft = el.runtimeStyle && el.runtimeStyle.left;

			if( rsLeft ){
				el.runtimeStyle.left = el.currentStyle.left;
			}

			style.left = attribute === 'fontSize' ? '1em' : ( val || 0 );
			val = style.pixelLeft + 'px';

			style.left = left;
			if ( rsLeft ) {
				el.runtimeStyle.left = rsLeft;
			}
		}

		// IE6-8中borderWidth如果为0px返回的是medium，需进行修复
		if( val === 'medium' && rBorderWidth.test(attribute) ){
			return '0px';
		}

		return val;
	}
	//给n上注册方法
	n.mix(n, {
		sibling: function( n, elem ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}

			return r;
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
		/**
		 * 插入字符串或获取当前
		 * @param  {String|Object} context 插入的元素
		 * @return 
		 */
		html: function(context){
			//不传值，为取值
			if (n.isUndefined(context)) {
				var el = this[0];
				return n.isElement(el) ? el.innerHTML : null;
			};

			if(n.isString(context)){
				context = context.replace(rXhtml, '<$1><' + '/$2>');
				//遍历数组
				this.forEach(function(){
					if(this.nodeType === 1){
						this.innerHTML = context;
					}
				});
			}else{
				this[0].innerHTML = context;
			}
			return this;
		},
		/**
		 * 设置或获取style
		 * @param  {String|Object} name 
		 * @param  {String} val  
		 * @return
		 */
		css: function(name, val){
			if (n.isUndefined(val) && n.isString(name)) {
				return getCurrentStyle(n(this)[0], name);
			};
			var _this = n(this);
			if (n.isObject(name)) {
				n.each(name, function(n, v){
					_this.css(n, v);
				});
				return this;
			}
			name = n.camelize(name);
			this.forEach(function(){
				this.style[name] = val;
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
			_this[0].className += ' ' + name;
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
		 * @param  {String} name
		 * @return
		 */
		val: function(name){
			var _this = n(this)[0],
				v = 'innerHTML';
			if (n.isUndefined(name)) {
				return _this.value;
			};
			if (/^(textarea|input)$/i.test(_this.nodeName)) {
				v = 'value';
			};
			this.forEach(function(){
				this[v] = name;
			});
			return this;
		}
	});
}(N);

/**--------------Event----------------------------------------------------**/
!function(n){
	var document = window.document;

	n.mix(n.fn, {
		on: function(type, handler){
			var el = n(this)[0];
			el.addEventListener ? el.addEventListener(type, handler, false) : el.attachEvent("on" + type, handler);
			return this;
		},
		un: function(type, handler){
			var el = n(this)[0];
			el.removeEventListener ? el.removeEventListener(type, handler, false) : el.detachEvent("on" + type, handler);
			return this;
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
	n.mix(n.fn, {
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
	n.mix(n.fn, {
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

!function(window) {

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
			n.un(document, eventType, DOMContentLoaded);
			fireReady();		
		}		
    };

	var readyPromise = function() {

		if (readyBound) return;
		readyBound = true;
		
		// 绑定事件
		n.on(document, eventType, DOMContentLoaded);

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
	n.mix(n.fn, {
		ready : function(f) {
			ready(f);
		}
	});

}(this);
