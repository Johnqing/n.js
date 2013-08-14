/**
 * 防止前端xss攻击
 * @author johnqing(刘卿)
 */
!function(){
	n.mix(n, {
		/**
		 * 为http的不可见字符、不安全字符、保留字符作转码
		 * @method encodeHttp
		 * @param {String} str 字符串
		 * @return {String} 返回处理后的字符串
		 */
		encodeHttp: function(str) {
			return str.replace(/[\u0000-\u0020\u0080-\u00ff\s"'#\/\|\\%<>\[\]\{\}\^~;\?\:@=&]/g, function(a) {
				return encodeURIComponent(a);
			});
		},

		/**
		 * 字符串为Html转码
		 * @method encodeHtml
		 * @param {String} str 字符串
		 * @return {String} 返回处理后的字符串
		 * @example
		 var str="<div>dd";
		 alert(encode4Html(str));
		 */
		encodeHtml: function(str) {
			var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
			var text = document.createTextNode(str);
			el.appendChild(text);
			return el.innerHTML;
		},
		/**
		 * 反编译
		 * @param {String} str 字符串
		 * @return {String} 返回处理后的字符串
		 */
		decodeHtml: function(str) {
			var div = document.createElement('div');
			div.innerHTML = StringH.stripTags(str);
			return div.childNodes[0] ? div.childNodes[0].nodeValue || '' : '';
		},
		/**
		 * url参数解析
		 * @param  {String} url url参数字符串
		 * @return {Object} json对象
		 */
		queryUrl: function(url){
			var t = {},
				s;
			url = url.split('&');
			for (var i = url.length - 1; i >= 0; i--) {
				s = url[i].split('=');
				t[s[0]] = s[1];
			};
			return t;
		},
		/**
		 * eval字符串转为js执行
		 * @param  {String} str  需要编译的字符串
		 * @param  {Object} opts 参数
		 * @param  {[type]} fl   是否为正则表达式 true:正则 false:非正则
		 * @return {Function}    根据字符串返回
		 */
		evalCode: function(str, opts, fl) {
			if(!fl){
				return new Function("opts", str)(opts);
			}			
			return new Function("opts", "return (" + str + ");")(opts);
		}
	});
}(this);