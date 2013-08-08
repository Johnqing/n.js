;(function(window, undefined){
	var document = window.document;
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
	 * create DOM element
	 * @param  {String} elStr
	 * @return {Object}
	 */
	n.md = function(elStr){
		var doc = document, 
		cElem = doc.createElement('p');
		cElem.innerHTML = elStr;
		elStr = doc.createDocumentFragment;

		while(doc = cElem.firstChild){
			elStr.appendChild(doc);
		}
		return elStr;
	}

	window.n = window.N = n;
}(this));
