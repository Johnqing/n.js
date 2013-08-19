/**
 * @author johnqing(刘卿)
 * @module Class
 * @link n.js
 */
n.mix(n, {
	Class: function(){
		var slice = Array.prototype.slice,
			args = slice.call(arguments),
			parent,
			defina,
			init,
			privates,
			publics;

		var merge = n.mix,
			bind = n.bind;
		//上下文限定
		var bound = function(b, ob){
			var reta = {};
			//合并b到空对象上去
			merge(reta, b);
			//递归取出其中的函数
			for(var m in b){
				if (b.hasOwnProperty(m) && n.isFunction(b[m])) {
					reta[m] = bind(b[m], ob);
				};
			};
			return reta;
		}
		//
		if (args.length > 1) {
			parent = args.shift();
		};
		//取出传入对象的 共有和私有方法
		defina = args.shift();
		publics = defina.Public || {};
		privates = defina.Private || {};
		//构造函数必须存在
		init = defina.Init;

		//没有构造函数 直接报错
		if (!n.isFunction(init)) {
			throw '构造函数不存在';
		};
		//如果共有方法内存在私有方法，报错
		for(var m in publics){
			if(privates[m] !== undefined ){
				throw "方法 "+m+" 不应在公有和私有方法中同时出现";
			}
		}
		//klass
		var klass = function(){
			var i, 
				uper = klass.prototype.$uper;
			if (parent && parent.prototype) {
				var parentPro = parent.prototype,
				//构造器的父级
				uper = {};
				merge(uper, parentPro);
				parent.apply(uper, arguments);

				//继承
				merge(this, uper);
				merge(this, bound(uper, parentPro));
				this.$uper = uper;
			};
			//创造一个hash表，来存储函数
			var vis = {},
				_this = this;

			//拆分对象
			var updateObj = function(){
				for(var p in vis){
					if (privates.hasOwnProperty(p) && vis.hasOwnProperty(p) && privates[p] !== vis[p]) {
						privates[p] = vis[p];
					}else if (publics.hasOwnProperty[p] && _this[p] !== vis[p]) {
						_this[p] = vis[p];
					};
				}
			}
			var vt = function(fun){
				return function(){
					fun.apply(vis, arguments);
					updateObj();
				}
			}

			for(i in publics){
				if (publics.hasOwnProperty(i) && n.isFunction(publics[i])) {
					_this[i] = vt(publics[i]);
				}else if(publics.hasOwnProperty(i)){
					_this[i] = publics[i];
				}
			}

			merge(vis, privates);
			merge(vis, _this);

			init.apply(vis, arguments);
			updateObj();

		}
		return klass;
	}
});