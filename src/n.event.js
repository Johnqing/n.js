/**
 * @author johnqing(刘卿)
 * @module Event
 * @link n.js
 */
!function(n){
	var document = window.document,
		_DelegateCpatureEvents = 'change,focus,blur';
	//注册到n.prototype上去的方法
	n.mix(n.fn, {
		//TODO: 需要重新设计
		on: function(type, handler, cpature){
			var el = n(this)[0];
			el.addEventListener ? el.addEventListener(type, handler, cpature || false) : el.attachEvent("on" + type, handler);
			return this;
		},
		//TODO: 需要重新设计
		un: function(type, handler, cpature){
			var el = n(this)[0];
			el.removeEventListener ? el.removeEventListener(type, handler, cpature || false) : el.detachEvent("on" + type, handler);
			return this;
		},
		/**
		 * 绑定事件代理
		 * @param  {String} selector 委托目标
		 * @param  {String} type     委托事件类型
		 * @param  {Function} handler  委托函数
		 * @return 
		 */
		delegate: function(selector, type, handler){
			//return this.on(types, selector, fn);
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