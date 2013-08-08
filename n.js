;(function(window, undefined){
	var document = window.document,
		version = '1.0.0',
		released = '2013-08-08 14:41';
	/**
	 * getClass
	 * @param  {String} searchClass
	 * @param  {Object} node
	 * @param  {String} tag
	 * @return {Object}
	 */
	if(!document.getElementsByClassName){
	    document.getElementsByClassName = function(className, element){
	        var children = (element || document).getElementsByTagName('*');
	        var elements = new Array();
	        for (var i=0; i<children.length; i++){
	            var child = children[i];
	            var classNames = child.className.split(' ');
	            for (var j=0; j<classNames.length; j++){
	                if (classNames[j] == className){ 
	                    elements.push(child);
	                    break;
	                }
	            }
	        } 
	        return elements;
	    };
	}
	/**
	 * forEach
	 * @param  {Function} callbackfn 必需。 一个接受最多三个参数的函数。 对于数组中的每个元素，forEach 都会调用 callbackfn 函数一次。
	 * @param  {String} scope 可选。 可在 callbackfn 函数中为其引用 this 关键字的对象。 如果省略 thisArg，则 undefined 将用作 this 值。
	 * @return {Object}
	 */
	if (!Array.prototype.forEach) {
	    Array.prototype.forEach = function (callbackfn, scope) {
	        var i, len;
	        for (i = 0, len = this.length; i < len; ++i) {
	            if (i in this) {
	                callbackfn.call(scope, this[i], i, this);
	            }
	        }
	    };
	}
	/**
	 * n选择器
	 * @param  {String} a 筛选元素
	 * @param  {Object} b 筛选的父级
	 * @return {Object}
	 */
	var n = function(a, b){
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
	 * 缓存模块
	 * @type {Object}
	 */
	n.cache = {};
	//版本信息
	n.version = version;
	//更新时间
	n.released = released;
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

	window.n = window.N = n;
}(this));
