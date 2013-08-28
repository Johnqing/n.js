;(function(n){
	/**
	 * 使用for in运算返回数组中某一值的对应项数(比如算出最小的高度值是数组里面的第几个)
	 * @param  {Object|Array} obj 完整的数据项
	 * @param  {String|Number} v 需要取出key的值
	 * @return {Number|String}   返回key
	 */
	function getarraykey(obj, v){
		for(k in obj) {
			if(obj[k] == v) {
				return k;
			}
		}
	}
	//
	var Waterfall = {
		/**
		 * 初始化
		 * @param  {Object} target 容器
		 * @param  {Object} opts   参数
		 * @return 
		 */
		init: function(target, opts){
			this.target = target;
			this.space = opts.space;
			//tpl
			var tmp = n.tpl(opts.id, opts.data);
			target.append(tmp);
			//DOM List
			this.cols = target.find('.cols');
			//
			this.lattice = [];

			this.render();
		},
		/**
		 * 渲染项
		 * @return
		 */
		render: function(){
			var _this = this,
				els = _this.cols;
			if (!els.length) {
				return;
			};

			var elWidth = els.eq(0).docRect().width + _this.space,
				num = Math.round(_this.target.docRect().width/elWidth);
			//遍历
			n.each(els, function(el, i){
				var h = n(el).docRect().height,
					t = 0,
					l = 0;
				if (i < num) {
					_this.lattice[i] = h;
					l = elWidth * i;
				}else{
					//取出最小那一项
					var min_H = Math.min.apply(null, _this.lattice),
						minKey = getarraykey(_this.lattice, min_H);
					t = _this.space + min_H;
					l = minKey * elWidth;
					_this.lattice[minKey] += _this.space + h;
				}
				n(el).css({
					top: t,
					left: l
				});

			});
		}
	};
	/**
	 * 配置
	 * @type {Object}
	 */
	var defaultConfig = {
		id: 'waterfall',
		data: {},
		col: 3,
		space: 5
	}
	n.fn.waterFall = function(opts){
		opts = n.mix(opts, defaultConfig);
		Waterfall.init(n(this), opts);
	};
})(n);

