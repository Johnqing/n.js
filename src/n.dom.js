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
