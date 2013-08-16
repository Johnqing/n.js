/**
 * @author johnqing(刘卿)
 * @module DATA
 * @link n.js
 */
!function(n){
	n._uuid = 2;
	var nUid = n.nuid(),
	nDate = {
		getCacheIndex: function(el, isSetting){
			if (n.isElement(el)) {
				return !isSetting || nUid in el ? el[nUid] : (el[nUid] = ++n._uuid);
			};
			return n.isWindow(el) ? 0 : el.nodeType === 9 ? 1 : el.tagName === 'HTML' ? 2 : -1;
		},
		/**
		 * 插入/获取缓存
		 * @param  {Object}  el      当前dom元素
		 * @param  {String}  type    命名空间: d(数据)
		 * @param  {[type]}  key     [description]
		 * @param  {[type]}  val     [description]
		 * @param  {Boolean} isCache [description]
		 * @return {[type]}          [description]
		 */
		data: function(el, type, key, val, isCache){
			var cache = n.cache,
				isValUn = n.isUndefined(val),
				index = this.getCacheIndex(el, !isValUn);
			if (n.isUndefined(index)) {
				//不在缓存并且非undefined，创建一个缓存
				if (!(index in cache) && !isValUn) {
					cache[index] = {};
				};
				cache = cache[index];
				//缓存如果为空 pass
				if (!cache) {
					return
				};

				
			};
		}
	}
	n.mix(n.fn, {
		data: function(name, val){
			var _this = this;
			if (n.isObject(name)) {
				n.each(name, function(key, val){
					_this.data(key, val);
				});
				return _this;
			};

			if (n.isUndefined(val)) {
				return nDate.data(_this[0], 'd', name);
			};
		}
	});	
}(n);
