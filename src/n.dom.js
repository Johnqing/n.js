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
					var curStyle = a.currentStyle[b];
					return curStyle == "auto" ? 0 : curStyle;
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
			pNode = doc.createElement('div');
			fragment = doc.createDocumentFragment();
			pNode.innerHTML = html;

			fragment.appendChild(pNode);

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
			var _this = this;
			if (n.isUndefined(val) && n.isObject(name)) {
				n.each(name, function(k, v){
					n(_this).css(k, v);
				});
				return _this;
			};
			if (!val) {
				return getStyle(_this[0], name, val);
			};
			_this.forEach(function(){
				setCss(_this[0], name, val);
			});			
			return _this;
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
