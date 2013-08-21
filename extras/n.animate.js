/**
 * 动画模块
 * @author johnqing（刘卿）
 * @link n.js
 */
!function(n){
	/**
	 * Animate类
	 * @param  {Object}   elem     运动元素
	 * @param  {Object}   jsonDate 样式对象
	 * @param  {Number}   time     毫秒数
	 * @param  {Function} callback 完成后的回调
	 * @param  {Object}   easing   缓动公式
	 * @return
	 */
	var document = window.document,
		guid = 0,
		que = [];

	/**
	 * 格式化传入的值
	 * @param  {Object} jsonMap 动画参数
	 * @return {Array}         返回整理后的数组
	 */
	var getJsonMap = function(jsonMap){

		var arr = [];
		var a = null;
		for(a in jsonMap){
			var json = {};
			var test = String(jsonMap[a]).match(/(\d+)($|([a-z]+))/);
			json.interval = null;
			json.style = a;
			json.val = typeof jsonMap[a] == "number" ? jsonMap[a] : parseFloat(test[1]);
			json.px = test[3];
			arr[arr.length] = json;
		}
		return arr;

	}
	//获取全局唯一id
	function getGuid(el){
		return el.animateId ? el.animateId : guid++;
	}
	var Animate = function(elem, jsonDate, time, callback, easing){
		this.guid = getGuid(elem);
		que[this.guid] = n.mix({
			el: elem,
			guid: this.guid,
			delay: 0,
			jsonMap: getJsonMap(jsonDate),
			time: time || 400,
			ease: n.easing[easing] || n.easing['jstwer'],
			callback: n.isUndefined(callback) ? n.isFunction(time) ? time : undefined : callback
		}, que[this.guid]);
	}

	Animate.prototype = {
		play: function(){
			var _this = this,
				config = que[_this.guid];
			//如果延时存在，就延迟执行
			if (config.delay) {
				setTimeout(function(){
					_this.play();
				}, config.delay);
				//重置为0，不然陷入无限等待
				config.delay = 0;
				return _this;
			};

			var guid = config.guid,
				el = config.el,
				callBack = config.callback,
				time = config.time,
				len = config.jsonMap.length,
				ease = config.ease,
				i = 0,
				j = 0;
			//遍历参数,执行动画
			for (; i < len; i++) {
				config.interval = _this.run(el, config.jsonMap[i].style, config.jsonMap[i].val, callBack, time, config.jsonMap[i].px, ease);
			};

			//回调
			function systemCallBack(){
				if (++j === len) {
					callback && callback(el)
				};
			}

			return _this;
		},

		run: function(elem, style, val, callBack, time, px, ease){
			px = px || '';

			var tmr = null,
				b = parseInt(n(elem).css(style)),
				st = (new Date()).getTime();

			val = val - b;

			tmr = setInterval(function(){
				var t = new Date().getTime() - st;
				if( t > time){
					t = time;
					clearInterval(tmr);
					callBack&&callBack(elem);
				}
				var num = parseFloat(ease(t, b, val, time)) + px;
                n(elem).css(style, num);
			}, 10);

			return tmr;
		},
		/**
		 * 定制当前动画
		 * @param  {Boolean} flg true|false
		 * @return
		 */
		stop: function(flg){
			var _this = this,
				config = que[_this.guid],
				guid = config.guid,
				i = 0,
				len = config.jsonMap.length;

			for (; i < len; i++) {
				if(config.interval){
					clearTimeout(config.interval);
				}
				if(flg == true){
					n(config.el).css(config.jsonMap[i].style, config.jsonMap[i].val + config.jsonMap[i].px);
				}
			};

			return _this;
		},
		delay: function(time){
			que[this.guid].delay = time;
			return this;
		}
	}
	/**
	 * 添加easing
	 * @description 后期可通过使用n.mix(n.easing,新的算子)来添加新的算子
	 * t: current time, b: begInnIng value, c: change In value, d: duration
	 */
	n.mix(n, {
		easing: {
			'jstwer': function(t, b, c, d){
				return - c * (t /= d) * (t - 2) + b;
			}
		}
	})
	n.mix(n.fn, {

		animate: function(jsonDate, time, callback, easing){
			new Animate(n(this), jsonDate, time, callback, easing).play();
			return this;
		},
		stop: function(){
			new Animate(n(this)).stop();
			return this;
		},
		fadeIn: function(time, callback, easing){
			n(this).css('opacity',0);
			new Animate(n(this), {'opacity': 1}, time, callback, easing).play();
			return this;
		},
		fadeOut: function(time, callback, easing){
			n(this).css('opacity',1);
			new Animate(n(this), {'opacity': 0}, time, callback, easing).play();
			return this;
		},
		delay: function(time){
			new Animate(n(this)).delay(time).play();
			return this;
		}
	});
}(n);