;(function(n){
	var Waterfall = n.Class({
		Init: function(){
			//console.log(this);
		},
		Public: {
			init: function(target, opts){
				this.target = target;
				//tpl
				var tmp = n.tpl(opts.id, opts.data);
				target.append(tmp);
				//DOM List
				this.cols = target.children();
				//
				this.lattice = [];
			},
			render: function(){
				
			}
		}
	});
	/**
	 * 配置
	 * @type {Object}
	 */
	var defaultConfig = {
		id: 'waterfall',
		data: {},
		col: 3
	}
	n.fn.waterFall = function(opts){
		opts = n.mix(opts, defaultConfig);
		new Waterfall().init(n(this), opts);
	};
})(n);

