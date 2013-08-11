/**
 * @author www.wangyingran.com(王迎然)
 * @module cookie模块
 */
!function(window){
  
	/**
	 * Cookie模块参数说明
	 * @name : cookie名
	 * @value : cookie值
	 * @time : cookie日期
	 */
	var Cookie = function(name, value, time) {
		this.name = name;
		this.value = value;
		this.time = time;
		this.oDate = new Date();
	}
	
	Cookie.prototype = {
		set : function() {
			this.oDate.setDate(this.oDate.getDate() + this.time);
	    	document.cookie = this.name + '=' + this.value + ';expires=' + this.oDate.toUTCString();
		},
		get : function() {
			var arrA = document.cookie.split('; ');
		    for (var i = 0; i < arrA.length; i++) {
		        var arrB = arrA[i].split('=');
		        if (arrB[0] == this.name) {
		            return arrB[1];
		            break;
		        }
		    }
		}
	}
	
	/**
	 * 追加cookie模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		cookie: function (name, value, time){
			if (!n.isUndefined(value)) {
				if (n.isNull(value)) {
					new Cookie(name, '', -1).set();
					return;
				}
				new Cookie(name, value, time).set();
			} else {
				return new Cookie(name).get();
			}
		}
	});
	
}(this);
