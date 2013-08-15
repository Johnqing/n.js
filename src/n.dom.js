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
    cssHooks = {},
	hasDuplicate = false,    // 是否有重复的DOM元素
	hasParent = false,    // 是否检测重复的父元素
	baseHasDuplicate = true;    // 检测浏览器是否支持自定义的sort函数

	// 检测浏览器是否支持自定义的sort函数
	[ 0, 0 ].sort(function(){
		baseHasDuplicate = false;
		return 0;
	});
	/** 
	 * 获得element对象当前的样式
	 * @method	getCurrentStyle
	 * @param	{Object|String}	el
	 * @param	{String}                attribute	样式名
	 * @return	{String}				
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

			elem = context = null;
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
