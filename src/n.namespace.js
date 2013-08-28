/**
 * @author johnqing(刘卿)
 * @module 实现JS命名空间的管理，模块的定义，与自动加载依赖模块的脚本文件
 * @link n.js
 */
!function(n, undefined){
	var that = {},			//当前命名空间
		jsParent = null,	//用于插入script节点的父节点。
		doc = document,		//变量引用速度更快
		JSManager = {},		//要暴露出的JS管理器
		RequireCache = [],	//模块需求列表缓存
		ExecuteQueue = [],	//模块执行队列
		RequireList = [],	//总模块需求列表
		ModuleCache = {},	//模块缓存
		JSRequested = {},	//已请求过的JS模块
		RequireTree = {},	//模块需求多叉树
		Traversed = {},		//遍历缓存
		ModuleLoaded = [],	//已经加载的模块的名字列表（用于调试）
		RequireHash = {};	//模块需求列表的位置索引

	/**
	 * @method loadModule 加载一个模块
	 * @param {String} mName 模块的名称
	 */
	function loadModule(mName){
		n.loadScript((JSManager.$basepath || '') + mName.split('.').join('/') + '.js?version=' + JSManager.$version);
	}

	/**
	 * @method setModuleCache 设置模块加载成功
	 * @param {String} mName 模块的名称
	 */
	function setModuleReady(mName){
		if(ModuleCache[mName] === 'ready'){return;}
		var nsParent, ns = that,
			arrName = (mName || '').split('.');
		n.each(arrName, function(name){
			nsParent = ns;
			ns = ns[name] = ns[name] || {};
		});
		nsParent[arrName.pop()] = ModuleCache[mName].call(null,that) || {};
		ModuleCache[mName] = 'ready';
		ModuleLoaded.push(mName);
	}

	/**
	 * @method traverse 深度遍历模块引用多叉树，设置模块加载成功
	 * @param {String} name 节点名称
	 */
	function traverse(name){
		if(!name || Traversed[name]){return;}	//确保每个节点只能访问一次（避免循环引用造成的死锁）
		Traversed[name] = true;					//事实上一个初始化模块，必定只允许运行一次
		n.each(RequireTree[name],traverse);
		setModuleReady(name);
	}

	/**
	 * @method checkReady 检查依赖列表中的模块文件是否都已就绪。
	 * @desc 如果都就绪了，就开始进行遍历（假定队列中的每个模块都是顶节点，进行多叉树深度遍历）。
	 */
	function checkReady(){
		if(!RequireList.join('')){
			n.each(ExecuteQueue.reverse(),traverse);
			ExecuteQueue.length = 0;
			RequireList.length = 0;
			RequireHash = {};
		}
	}

	/**
	 * @method checkDepend 检查模块依赖文件是否已请求
	 * @param {String} mName 模块名称
	 */
	function checkDepend(mName){
		var requires = [].concat(RequireCache);
		RequireCache.length = 0;
		RequireTree[mName] = requires;
		n.each(requires,function(name){
			if(!JSRequested[name]){
				ExecuteQueue.unshift(name);
				RequireHash[name] = RequireList.length;
				RequireList.push(name);
				loadModule( name );
				JSRequested[name] = true;
			}
		});
		checkReady();
	}

	/**
	 * @method register 注册一个模块
	 * @param {String} mName 模块的名称
	 * @param {Function} maker 模块构造函数
	 */
	function register(mName, maker){
		if(ModuleCache[mName]){
			throw('The "' + mName + '" has been registered!!!');
		}
		ModuleCache[mName] = maker;
		if(!JSRequested[mName]){
			ExecuteQueue.push(mName);
			JSRequested[mName] = true;
		}
		if(RequireHash[mName] !== undefined){
			RequireList[ RequireHash[mName] ] = '';
		}
		checkDepend(mName);
	}

	/**
	 * @method $Import 加载（引入）一个模块
	 * @param {String} name 模块的名称
	 */
	function $Import(name){
		RequireCache.push(name);
	}

//---------------------------
	//参数配置区：
	var spaceName = 'SPORE';				//定义顶层命名空间的名称
	var managerName = '$JSManager';			//要暴露出去的JS管理器的名称
	var regName = 'register';				//要暴露出去的注册组件函数的名称
	var impName = '$Import';				//要暴露出去的引用组件函数的名称
	JSManager.$basepath = 'js/';			//JS库所在的线上路径
	JSManager.$charset = 'utf-8';			//JS文件的编码	
	JSManager.$version = new Date() - 0;	//JS版本号
//---------------------------

	//适配器：
	that[impName] = $Import;
	that[regName] = register;
	that[managerName] = JSManager;
	ModuleCache[impName] = ModuleCache[regName] = ModuleCache[managerName] = 'ready';
	JSManager.$ModuleCache = ModuleCache;
	JSManager.$RequireList = RequireList;
	JSManager.$ModuleLoaded = ModuleLoaded;
	if(!this[spaceName]){
		this[spaceName] = that;
	}else{
		n.each(that, function(prop, name){
			if(!this[spaceName][name]){
				this[spaceName][name] = prop;
			}else{
				throw('Lib "' + spaceName + '" exists the same prop: ' + name);
			}
		});
		that = this[spaceName];
	}
}(n);

!function(n){
	//模块管理
	var JSManager = {},
		//模块列表
		moduleMap = {};
	//构建一个模块
	function _define(){
		
	}
	//API List
	n.mix(n, {
		require: _require,
		use: _use,
		define: _define
	});
}(n);