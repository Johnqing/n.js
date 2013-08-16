/**
 * @author johnqing(刘卿)
 * @module Event
 * @link n.js
 */
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