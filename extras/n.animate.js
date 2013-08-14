/**
 * 动画模块
 * @author johnqing（刘卿）
 * @link n.js
 */
!function(window){
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
		anim = {};
	var Animate = function(elem, jsonDate, time, callback, easing){
		this.elem = elem;
		this.jsonDate = jsonDate;
		this.time = time;
		this.easing = easing || 'jstwer';
		this.callback = callback;
		this.lazy = this.lazyque = 10;
		//获取唯一标识符
		this.uuid = this.getUid();
		this.f = 0;
		this.fn = elem.fn || [];
		//动画队列
		anim[this.uuid] = {};
		anim[this.uuid]['stop'] = true;
	}

	Animate.prototype = {
		/**
		 * 获取唯一id
		 * @return {String} 唯一id
		 */
		getUid: function(){
			var _this = this, 
				uuid = _this.elem.anid;
			if(!n.isString(uuid)){
				uuid = n.nuid();
				_this.elem.anid = uuid;
				return uuid;
			}
			return uuid;
		},
		run: function(){
			var _this = this,
				jd = _this.jsonDate,
				t = _this.time,
				que = _this.fn,
				queLen = que.length;
			que[queLen] = [];
			que[queLen]['callback'] = _this.callback;
			//循环解锁参数
			for(var i in jd){
				que[queLen].push([i, jd[i], t]);
				if(queLen == 0){
					i == 'opacity' ? _this.entrance(_this.alpha, [jd[i], t], _this.lazyque) : 
					_this.entrance(_this.execution, [i, jd[i], t], _this.lazyque);
				}
			}
			_this.elem.fn = _this.fn;
		},
		stop: function(){
			var _this = this;
			anim[_this.uuid]['stop'] = false;
			_this.fn.length = _this.elem.fn = 0;
			_this.elem.anid = null;
			return _this;
		},
		entrance: function(fn, data, time){
			var root = n, _this = this;
			//fn 调用函数 data 参数 time 延迟时间
			setTimeout(function(){
				fn(data[0], data[1], data[2], root, _this);
			}, (time || 0));
		},
		/**
		 * 动画变化函数
		 * @param  {String} key 变化样式
		 * @param  {String} val 变化值
		 * @param  {Number} t   毫秒
		 * @return
		 */
		execution: function(key, val, t, root, that){
			var tween = root.easing[that.easing],
				nowTime = (new Date()).getTime(),
				duration = t || 500,
				beigin = parseFloat(that.elem.style[key]) || 0;
			var changeValue = that.nMath(val, beigin),
				// 单位
				un = val.match(/\d+(.+)/)[1];
			(function(){
				var t = (new Date()).getTime() - nowTime;
				if (t > duration){
					t = duration;
					that.elem.style[key] = parseInt(tween(t, beigin, changeValue, duration)) + un;
					// 操作队列
					that.queue(); 
					return that;
				}
				that.elem.style[key] = parseInt(tween(t, beigin, changeValue, duration)) + un;
				anim[that.uuid]['stop'] && setTimeout(arguments.callee, that.lazy);
			})();
		},
		/**
		 * 队列
		 */
		queue: function(){
			var _this = this,
				f = _this.f,
				que = _this.fn,
				lazyque = _this.lazyque;

			if (que && ++f == que[0].length){
				f = 0;// 清空计数器
				que[0].callback ? que[0].callback.apply(elem) : false;

				// 判断是否有动画在等待执行
				if (que.length > 1){
					que[0].callback = que[1].callback;
					que = _this.elem.fn || [];// 从dom对象上获取最新动画队列
					que.shift();// 清除刚执行完的动画队列
					_this.elem.fn = que;// 把新的队列更新到dom
					var am = que[0];

					// 循环播放队列动画
					for(var i = 0; i < am.length; i++){

						am[i][0] === 'opacity' ? _this.entrance(_this.alpha, [am[i][1], am[i][2]], lazyque):
						_this.entrance(_this.execution, [am[i][0], am[i][1], am[i][2]], lazyque);

					}
				}else{
					//清除队列
					que.length = 0;
					_this.elem.fn.length = 0;
					_this.elem.anid = null;
				}

			}
		},
		/**
		 * 解析传入的值
		 */
		nMath: function(val, beigin){
			var numMath, re = /^([+-\\*\/]=)([-]?[\d.]+)/ ;
			if (re.test(val)){
				var reg = val.match(re);
				reg[2] = parseFloat(reg[2]);
				switch (reg[1]){
					case '+=':
						numMath = reg[2];
						break;
					case '-=':
						numMath = -reg[2];
						break;
					case '*=':
						numMath = beigin*reg[2] - beigin;
						break;
					case '/=':
						numMath = beigin/reg[2] - beigin;
						break;
				}
				return numMath;
			} 
			return parseFloat(val) - beigin;
		},
		alpha: function(val, t){
			var _this = this,
				elem = _this.elem,
				lazy = _this.lazy,
				s = (new Date()).getTime(),
				d = t || 500, b, c;
			if(document.defaultView){
				b = document.defaultView.getComputedStyle(elem,null)['opacity'] || 1,
				c = _this.nMath(val,b) * 100;
				(function(){
					var t = (new Date()).getTime() - s;
					if(t > d){
						t = d;
						elem.style['opacity'] = tween(t, (100 * b), c, d) / 100;
						_this.queue(); // 队列控制
						return _this;
					}
					elem.style['opacity'] = tween(t, (100 * b), c, d) / 100;
					anim[_this.uuid]['stop'] && setTimeout(arguments.callee, lazy);
				})();
			}else{
				b = elem.currentStyle['filter'] ? 
				(elem.currentStyle['filter'].match(/^alpha\(opacity=([\d\.]+)\)$/))[1]/100 : 1;
				c = _this.nMath(val, b) * 100;
				(function(){
					var t = (new Date()).getTime() - s;
					if (t > d){
						t = d;
						elem.style['filter']='alpha(opacity='+ tween(t, (100 * b), c, d) +')';
						_this.queue(); // 队列控制
						return _this;
					}
					elem.style['filter'] = 'alpha(opacity='+ tween(t, (100*b) , c, d) +')';
					anim[_this.uuid]['stop'] && setTimeout(arguments.callee, lazy);
				})();
			}
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
		},
		animate: function(elem, jsonDate, time, callback){
			new Animate(elem, jsonDate, time, callback).run();
		}
	});
}(this);