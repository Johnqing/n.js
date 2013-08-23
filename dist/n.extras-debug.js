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
		 * encodeURI一个Json对象
		 * @param {Json} json  Json数据，只有一层json，每一键对应的值可以是字符串或字符串数组
		 * @returns {string} : 返回被encodeURI结果。
		 */
		encodeURIJson: function(json){
			var s = [];
			for(var p in json){
				if(json[p] == null) continue;
				if(json[p] instanceof Array){
					for (var i=0;i<json[p].length;i++) s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
				}else{
					s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
				}
			}
			return s.join('&');
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
/**
 * @author 王迎然(www.wangyingran.com)
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
	n.mix(n.fn, {
		cookie: function (name, value, options){
			if (!isUndefined(value)) {  
				cookie.set(name, value, options);
			}else{
				return cookie.get(name, value, options);
			}
			return this;
		},
		removeCookie: function(name){
			cookie.remove(name);
			return this;
		}
	});
	
}(this);

/**
 * @author johnqing
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @up: 模板拼接改为字符串拼接，提升高版本浏览器模板拼接速度
*/
!function(window){
    var NTpl = n.tpl || {},
        doc = window.document,
        vars = 'var ',
        logicInTpl = {},
        codeArr = ''.trim ?
        ['ret = "";', 'ret +=', ';', 'ret;']
        :['ret = [];', 'ret.push(', ')', 'ret.join("");'],
        keys = ('break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if'
            + ',in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with'
            // Reserved words
            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto'
            + ',implements,import,int,interface,long,native,package,private,protected,public,short'
            + ',static,super,synchronized,throws,transient,volatile'
            
            // ECMA 5 - use strict
            + ',arguments,let,yield').split(','),
        keyMap = {};
        
    for (var i = 0, len = keys.length; i < len; i ++) {
        keyMap[keys[i]] = 1;
    }

    /**
     * 编译器
     * @param str
     * @returns {Function} 返回模板拼接函数
     * @private
     */
    var _compile  = function(str){
        var openArr = str.split(NTpl.openTag),
            tmpCode = '';
            
        for (var i = 0, len = openArr.length; i < len; i ++) {
            var c = openArr[i],
                cArr = c.split(NTpl.closeTag);
            if (cArr.length == 1) {
                tmpCode += _html(cArr[0]);
            } else {
                tmpCode += _js(cArr[0]);
                tmpCode += cArr[1] ? _html(cArr[1]) : '';
            }
        }
    
        var code = vars + codeArr[0] + tmpCode + 'return ' + codeArr[3];
        console.log(tmpCode);
        return new Function('$data', '$getValue', code);
    };

    /**
     * 对外接口函数
     * @param str id
     * @param data 数据
     * @returns {*}
     */
    NTpl.tpl = function(str, data){
        var fn = (function(){
            var elem = doc.getElementById(str);
            if(elem){
                //缓存编译后的函数模板
                if(nt.cache[str]){
                    return nt.cache[str];
                }
                var html = /^(textarea|input)$/i.test(elem.nodeName) ? elem.value : elem.innerHTML;
                return nt.cache[str] = _compile(html);
            }else{
                return _compile(str);
            }
        })();
        //有数据则返回HTML字符串，没有数据则返回函数
        var result = typeof data === 'object' ? fn(data, getValue) : fn;
        fn = null;
        return result;
    };
    /**
     * 分隔符
     * @type {string}
     */
    NTpl.openTag =  NTpl.openTag || '<%';
    NTpl.closeTag = NTpl.closeTag || '%>';
    /**
     * html解析
     * @param  {String} s 模板
     * @return {String}   解析完成字符串
     */
    function _html (s) {
        s = s
        .replace(/('|"|\\)/g, '\\$1')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
        
        s = codeArr[1] + '"' + s + '"' + codeArr[2];
        
        return s + '\n';
    }
    /**
     * js解析
     * @param  {String} s 模板
     * @return {String}   解析完成字符串
     */
    function _js (s) {
        /**
         * 非js逻辑语句
         */
        if (/^=/.test(s)) {
            s = codeArr[1] + s.substring(1).replace(/[\s;]*$/, '') + codeArr[2];
        }
        dealLogic(s);        
        return s + '\n';
    }
    /**
     * 处理js逻辑语句
     * @param  {String} s 模板
     */
    function dealLogic (s) {
        s = s.replace(/\/\*.*?\*\/|'[^']*'|"[^"]*"|\.[\$\w]+/g, '');
        var sarr = s.split(/[^\$\w\d]+/);
        // console.log(s);
        for (var i = 0, len = sarr.length; i < len; i ++) {
            var logic = sarr[i];
            if (!logic || keyMap[logic] || /^\d/.test(logic)) {
                continue;
            }
            if (!logicInTpl[logic]) {
                vars += (logic + '= $getValue("' + logic + '", $data),');
                logicInTpl[logic] = 1;
            }
        }
    }
    /**
     * 数据解析
     * @param  {String} v     key
     * @param  {Object} $data 数据
     * @return {String}       value
     */
    function getValue (v, $data){
        return $data.hasOwnProperty(v) ? $data[v] : window[v];
    }
    /**
     * 命名空间
     * @type {*}
     */
    var nt = NTpl.tpl;
    /**
     * 缓存
     */
    nt.cache = {};

    n.mix(n, NTpl);
}(this);

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
/**
 * @author 王迎然(www.wangyingran.com)
 * @module random模块
 * @link n.js
 */
!function(window){
    
	/**
     * random
     * @param  {Number} min  最小整数
     * @param  {Number} max  最大整数 (可选)
     * @param  {Number} num  输出随机个数 (可选)
     * @return {Array}
     */
	var random = function(min, max, num) {
        
        if (n.isUndefined(num)) {
            if (n.isUndefined(max)) {
                if (min == 0) return 0;
                max = min;
                min = 0;
            }
            return min + (0 | Math.random() * (max - min) + 1);
        }

        if (max - min < num) return;

        var a = [],
            j = {};

        for (; a.length < num;) {
            var i = min + (0 | Math.random() * (max - min) + 1);
            if (!j[i]) {
                j[i] = i;
                a.push(i);
            }
        }

        return a;
    }
    
    /**
     * 追加random模块到n命名空间上
     * @namespace n
     */
    n.mix(n, {
        random : function(min, max, num) {
            return random(min, max, num);
        }
    });
	
}(this);
