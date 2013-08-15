/*
* @example
* n.lazyload(imgNodes, {
*   original: 'data-original',
*   container: 'document',
*   event: 'scroll'
* }, function(){});
* 
* @author: johnqing
* @version: 0.1
*/
!function(window){
      var doc = window.document,
      getObjPoint = function(o){
          var x=y=0;
          do {
              x += o.offsetLeft || 0;
              y += o.offsetTop  || 0;
              o = o.offsetParent;
          } while (o);

          return {'x':x,'y':y};
      };
      /**
      * 默认配置
      * @type {Object}
      */
      var defineConfig = {
        original: 'data-original',
        container: doc,
        event: 'scroll'
      },
      imgLazyLoad = function(target, opts, callback){
          opts = n.mix(defineConfig, opts);
          callback = callback || function(){};

          var imgArray = [],
              dataName = 'img_offset',
              container = opts.container['body'] || opts.container['documentElement'];

          //遍历所以图片
          n.forEach(target, function(el){
              imgArray.push(el);
          });
          //图片加载
          var loader = function(){
              var i = 0,
                ObjPoint, 
                elem, 
                lazySrc,
                top = container.scrollTop,
                height = container.clientHeight;
              //遍历数组内的图片
               n.forEach(imgArray, function(el){
                if(el.className != dataName){
                  lazySrc = el.getAttribute(opts.original);

                  if(lazySrc && el.src !== lazySrc){
                      //当前图片的绝对位置
                      ObjPoint = getObjPoint(el).y; 
                      if(ObjPoint >= top && ObjPoint <= (top+height)){
                        // 加载图片
                        el.src = lazySrc;
                        el.className = dataName;
                      }
                  }
                };                  
               });
               //回调 
              callback();      
          };
          // 绑定事件
          n.on(window, opts.event, loader);
          n.on(window, 'resize', loader);
          // 初始化
          loader();
          return this;
      }    
      n.mix(n, {lazyload: imgLazyLoad});
  }(this);