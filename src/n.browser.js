/**
 * @author johnqing(刘卿)
 * @module 浏览器嗅探模块
 * @link n.js
 */
!function(window){
	var document = window.document;
	n.mix(n.fn, {
		browser: function(){
			var version = 0,
				agent = navigator.userAgent.toLowerCase(),
				opera = window.opera,
				browser = {
					/**
					 * 判断是否ie
					 * @type {Boolean} true|false
					 */
					ie: !!window.ActiveXObject,
					/**
					 * 判断是否opera
					 * @type {Boolean} true|false
					 */
					opera: (!!opera && opera.version),
					/**
					 * 判断是否webkit
					 * @type {Boolean} true|false
					 */
					webkit: (agent.indexOf(' applewebkit/') > -1),
					/**
					 * [quirks description]
					 * @type {Boolean} true|false
					 */
					quirks: (document.compatMode == 'BackCompat'),
					/**
					 * 判断是否gecko
					 * @type {Boolean} true|false
					 */
					gecko: (navigator.product == 'Gecko' && !this.webkit && !this.opera)

				};
			/**
			 * ie 版本
			 */
			if (browser.ie) {
				version = parseFloat(agent.match(/msie (\d+)/ )[1]);
				/**
				* 检测浏览器是否为 IE9 模式
				* @type {Boolean} true|false
				*/
				browser.ie9Compat = document.documentMode == 9;
				/**
				* 检测浏览器是否为 IE8 浏览器
				* @name ie8
				* @type {Boolean} true|false
				*/
				browser.ie8 = !!document.documentMode;

				/**
				* 检测浏览器是否为 IE8 模式
				* @name ie8Compat
				* @type {Boolean} true|false
				*/
				browser.ie8Compat = document.documentMode == 8;

				/**
				* 检测浏览器是否运行在 兼容IE7模式
				* @name ie7Compat
				* @type {Boolean} true|false
				*/
				browser.ie7Compat = ((version == 7 && !document.documentMode) || document.documentMode == 7);

				/**
				* 检测浏览器是否IE6模式或怪异模式
				* @name ie6Compat
				* @type {Boolean} true|false
				*/
				browser.ie6Compat = (version < 7||browser.quirks);
			};
			/**
			 * gecko 版本
			 */
			if ( browser.gecko ){
				var geckoRelease = agent.match(/rv:([\d\.]+)/);
				if (geckoRelease){
					geckoRelease = geckoRelease[1].split( '.' );
					version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
				}
			}
			/**
			* 检测浏览器是否为chrome
			* @name chrome
			* @type {Boolean} true|false
			*/
			if (/chrome\/(\d+\.\d)/i.test(agent)) {
				browser.chrome = + RegExp['\x241'];
			}
			/**
			* 检测浏览器是否为safari
			* @name safari
			* @type {Boolean} true|false
			*/
			if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
				browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
			}


			// Opera 9.50+
			if (browser.opera){
				version = parseFloat(opera.version());
			}

			// WebKit 522+ (Safari 3+)
			if (browser.webkit){
				version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
			}
			/**
			* 浏览器版本判断
			* IE系列返回值为5,6,7,8,9,10等
			* gecko系列会返回10900，158900等.
			* webkit系列会返回其build号 (如 522等).
			* @name version
			* @example
			* if (n.browser.ie && n.browser.version == 6 ){
			*     alert( "万恶的IE6，去死吧!" );
			* }
			*/
			browser.version = version;
			/**
			* 是否是兼容模式的浏览器
			* @name isCompatible
			* @type {Boolean} true|false
			* @example
			* if (n.browser.isCompatible){
			*     alert("你的浏览器相当不错哦！");
			* }
			*/
			browser.isCompatible =
				!browser.mobile && ((browser.ie && version >= 6) 
				|| (browser.gecko && version >= 10801) 
				|| (browser.opera && version >= 9.5) || (browser.air && version >= 1) 
				|| (browser.webkit && version >= 522) || false);

			return browser;
		}()
	});
}(this);
