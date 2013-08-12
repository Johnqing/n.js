/**
 * @author www.wangyingran.com(王迎然)
 * @module cookie模块
 * @link n.js
 */
!function(window){
	/**
	 * cookie方法
	 * @property {Object}
	 */
	var cookie = {
		/**
		 * 设置cookie
		 * @param  {String} name    cookie名
		 * @param  {String} value   cookie值
		 * @param  {Object} options 设置cookie的有效期，路径，域，安全  
		 * @return 
		 */
		set: function(name, value, options){
			options = options || {}; 
			//如果值为空，删除该cookie    
			if (isNull(value)) {     
				value = '';     
				options.expires = -1;     
			}  
			var expires = '';     
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {     
				var date;     
				if (typeof options.expires == 'number') {     
					date = new Date();     
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));     
				} else {     
					date = options.expires;     
				}     
				expires = '; expires=' + date.toUTCString();     
			}     
			//设置参数
			var path = options.path ? '; path=' + (options.path) : '';     
			var domain = options.domain ? '; domain=' + (options.domain) : '';     
			var secure = options.secure ? '; secure': '';     
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join(''); 
		},
		/**
		 * 获取cookie
		 * @param  {String} name cookie名
		 * @return {String}
		 */
		get: function(name){
			var cookieValue = null,
				dck = document.cookie,
				cookieStart,cookieEnd;     
			if (dck&& dck != '') {  
				//通过indexOf()来检查这个cookie是否存在，不存在就为 -1　
				cookieStart = dck.indexOf(name + "=");
				if(cookieStart != -1){
					cookieStart += name.length + 1;
					cookieEnd = dck.indexOf(";", cookieStart);
					if(cookieEnd == -1){
						cookieEnd = dck.length;
					}
					return decodeURIComponent(dck.substring(cookieStart, cookieEnd));
				}   
			}     
			return '';
		},
		remove: function(name){
			cookie.set(name, null);
		}
	}
	/**
	 * 追加cookie模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		cookie: function (name, value, options){
			if (!isUndefined(value)) {  
		        	cookie.set(name, value, options);
		    	}else{
				return cookie.get(name, value, options);
		    	}
		},
		removeCookie: function(name){
			cookie.remove(name);
		}
	});
	
}(this);
