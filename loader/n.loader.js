/**
 * @author johnqing(刘卿)
 * @module Loader
 * @link n.js
 */
!(function(window){
	var nLoad = window.nLoad || {};
	nLoad.version = '@VERSION';
	/**
	* 私有类型判断函数
	* @param  {String}  type Object/String/Function/Array
	* @return {Boolean}
	*/
	function isType(type){
		return function(obj){
			return toString.call(obj) == "[object "+ type +"]";
		}
	}
	/**
	* 类型判断
	* @type {Boolean}
	*/
	var isObject = isType('Object'),
		isString = isType('String'),
		isNumber = isType('Number'),
		isArray = isType('Array'),
		isFunction = isType('Function'),
		isUndefined = function(obj){
			return obj === void 0;
		}
	//分析module的依赖关系
	function parseDependencies(code) {
		var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
		var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
		var ret = [];
		code.replace(commentRegExp, "").replace(cjsRequireRegExp, function(match, dep) {
		  dep && ret.push(parseVars(dep));
		})
		return ret;
	}
	//define参数分析
	function parseDefineConfig(id, deps, factory){
		//define(factory)
		if (arguments.length === 1) {
			factory = id;
			id = undefined;
		}else if(arguments.length === 2){
			factory = deps;
			deps = undefined;
			if (isArray(id)) {
				deps = id;
				id = undefined;
			};
		}
		if (!isArray(deps) && isFunction(factory)) {
			deps = parseDependencies(factory.toString());
		};
		//
		return {
			id: id,
			deps: deps,
			factory: factory
		}
	}
	var nModule = {
		// 获取当前运行脚本的文件的名称
		// 用于获取匿名模块的模块名
		getCurrentScript : function(){
			var script, scripts, i, stack;

			// 标准浏览器(IE10、Chrome、Opera、Safari、Firefox)
			// 通过强制捕获错误(e.stack)来确定为当前运行的脚本
			// http://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html        
			try{
				// 运行一个不存在的方法强制制造错误
				a.b.c();
			}
			// 捕获错误
			// safari的错误对象只有line,sourceId,sourceURL
			catch( e ){ 
				stack = e.stack;
			}

			if( stack ){        
				// 取得最后一行,最后一个空格或@之后的部分
				stack = stack.split( /[@ ]/g ).pop();
				// 去掉换行符
				stack = stack[0] === '(' ? stack.slice( 1, -1 ) : stack.replace( /\s/, '' );
				//去掉行号与或许存在的出错字符起始位置
				return stack.replace( /(:\d+)?:\d+$/i, '' ).match( rModId )[1];             
			}

			// IE6-8通过遍历script标签，判断其readyState为interactive来确定为当前运行的脚本
			scripts = head.getElementsByTagName( 'script' );
			i = scripts.length - 1;

			for( ; i >= 0; i-- ){
				script = scripts[i];
				if( script.className === modClassName && script.readyState === 'interactive' ){
					break;
				}
			}        

			return script.src.match( rModId )[1];
		}
	}
	/** 
	* Defines a module. 
	* @param {String}  id  标识号 
	* @param {Array} deps  依赖模块列表 
	* @param {Function|Object} factory  处理函数 
	*/  
	window.define = function(id, deps, factory){
		var cf = parseDefineConfig(id, deps, factory);



	}

})(this);