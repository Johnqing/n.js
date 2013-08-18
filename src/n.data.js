/**
 * @author johnqing(刘卿)
 * @module DATA
 * @link n.js
 */
!function(n){
	//生成时间戳
	function timeStp(){
		return (new Date).getTime();
	}
	var exp = 'NJS' + timeStp(),
		windowData = {};
	n.exp = exp;
	n.mix(n, {
		isEmptyObject: function(obj){
			for(var i in obj){
				return false;
			}
			return true;
		},
		data: function(elem, name, data){
			// 取得元素保存数据的键值
			var nuid = elem[exp], 
				cache = n.cache,
				thisCache;
			// 没有 id 的情况下，无法取值
			if (!nuid && n.isString(name) && n.isUndefined(data)) {
				return null;
			};
			//为元素计算一个唯一的id
			if (!nuid) {
				nuid = n.nuid();
			};
			//如果不在缓存 创建一个
			if (!cache[nuid]) {
				//在元素上保存键值
				elem[exp] = nuid; 
				//在 cache 上创建一个对象保存元素对应的值
				cache[nuid] = {};
			};
			thisCache = cache[nuid];
			//保存,防止重写
			if (n.isUndefined(data)) {
				thisCache[name] = data;
			};
			// 返回对应的值
			return n.isString(name) ? thisCache[name] : thisCache;

		},
		removeData: function(elem, name){
			// 取得元素保存数据的键值
			var nuid = elem[exp], 
				cache = n.cache,
				thisCache = cache[nuid];

			if (name) {
				if (thisCache) {
					//删除缓存
					delete thisCache[name];
					//元素上的缓存都被删掉的时候，删除缓存
					if (n.isEmptyObject(thisCache)) {
						n.removeData(elem);
					};
				};
			}else{
				delete elem[n.exp];
				//删除全局缓存
				delete cache[nuid];
			}
		}
	});
	//
	n.mix(n.fn, {
		data: function(key, val){
			//val不传，返回当前的key
			if (n.isUndefined(val)) {
				return n.data(this[0], key);
			}else{
				this.forEach(function(){
					n.data(this, key, value);
				});
			}
		},
		removeData: function(){
			return this.forEach(function(){
				n.removeData(this, key);
			});
		}
	});

}(n);
