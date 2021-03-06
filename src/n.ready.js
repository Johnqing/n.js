/**
 * @author 王迎然(www.wangyingran.com)
 * @module ready模块
 * @link n.js
 */

!function(n) {

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
			n(document).un(eventType, DOMContentLoaded);
			fireReady();		
		}		
    };

	var readyPromise = function() {

		if (readyBound) return;
		readyBound = true;
		
		// 绑定事件
		n(document).on(eventType, DOMContentLoaded);

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
	n.mix(n, {
		ready : function(f) {
			ready(f);
		}
	});

}(n);
