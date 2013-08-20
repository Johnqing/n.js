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