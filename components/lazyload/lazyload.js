!function(nJs){
	//默认配置
	var defaultConfig = {
		placeholder: 'img/greg.gif',
		event: "scroll",
		effect: "show",
		container: window,
		dataAttribute: "original"
	}
	//接口外放
	nJs.fn.lazyload = function(opts){
		opts = nJs.mix(opts, defaultConfig);

		var elems = this,
			cls = 'data-lazyOff',
			imgArray = [],
			images = elems[0].nodeName == 'img' ? elems : n(elems).find('img'),
			el = opts.container === window ? nJs(document) : nJs(opts.container);
			container = (nJs.isUndefined(opts.container) || opts.container === window) ? nJs(window) : nJs(opts.container);

		//img插入数组
		for (var i = 0; i < images.length; i++) {
			var node = images[i];
			n(node).attr('src', opts.placeholder);
			imgArray.push(node);
		}
		//图片更新src
		function update(){
			var i = 0,
				imgNode;
				len = imgArray.length;

			for (; i < len; i++) {
				imgNode = nJs(imgArray[i]);
				var imgPosY = imgNode.offset().top,
					dRec = el.docRect(),
					data = imgNode.attr(opts.dataAttribute),
					windowPosY = dRec.scrollY + dRec.height;

				if (imgNode.hasClass(cls)) continue;

				if(windowPosY >= imgPosY && data){
					imgNode.addClass(cls).attr('src', data)[opts.effect]();
				}
			};
		}
		//默认执行
		update();
		container.on(opts.event, update);
		container.on('resize', update);
	}
}(n);