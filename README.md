n.js
====

> 轻量级的工具集合（兼容傻x ie6），简化日常小型项目中的开发

##配置##
通过grunt配置当前那些模块需要合并和压缩

##核心模块##

* domReady 模块 n.ready();
<pre>
n.ready(function(){
    // dom is loaded!
})
</pre>

* DOM 选择器 n()
<pre>
n('#id')
n('.class')
n('tag')
</pre>
* 异步加载script n.loadScript()
<pre>
n.loadScript('url', function(){
	console.log('加载完成');
})
</pre>
* 事件绑定 n.on()
<pre>
n.on(elem, 'click', function(){
	console.log('哈哈')
})
</pre>
* 解除事件绑定 n.un()
<pre>
n.un(elem, 'click', fn)
</pre>
* 触发对象的指定事件 n.fire()
<pre>
n('#id').onclick = function(){console.log(11)}
n.fire(n('#id'));
</pre>
* 支持链式调用 
<pre>
n('#test li').html('li的值被改变了').on('click', function(){
	alert(n(this).html());
}).fire('click');
</pre>
* 数组/普通对象/字符串/类数组遍历 n.each()
<pre>
var node = document.getElementsByTagName('li');
n.each(node, function(e, i){
	cosnole.log(e.innerHTML + i)
})
</pre>
* 格式化日期 n.dFormat()
<pre>
var d = new Date();
console.log(n.dFormat(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss"));
</pre>
* 去除字符串的前后空格 n.trim()
<pre>
n.trim(' 我前面有空格，我后面也有 ');
</pre>
* 是否为对象 n.isObject()
<pre>
var x = {};
n.isObject(x);
</pre>
* 是否为字符串 n.isString()
<pre>
var x = 'xxx';
n.isString(x);
</pre>
* 是否为数组 n.isArray()
<pre>
var x = [1,2,3];
n.isArray(x);
</pre>
* 是否为函数 n.isFunction()
<pre>
var x = function(){};
n.isArray(x);
</pre>
* 将源对象的属性并入到目标对象 n.mix()
<pre>
var a = {x:1},
	b = {y:2}
n.mix(a,b);
console.log(a);
</pre>
* 防止命名空间冲突 n.noConflict()
<pre>
n.noConflict('$');
$('#test').innerHTML = "$";
</pre>
* 调用给定的迭代函数N次 n.times()
<pre>
n.times(3, function(){
	console.log('times!');
})
</pre>
* 只能运行一次的函数，以后调用不会执行 n.once()
<pre>
function onceTest(){
	console.log('执行几次呢？');
}
n.once(onceTest);
onceTest();
</pre>
* 用指定的context作为fn上下文，也就是this n.bind()
<pre>
n.bind(function(){console.log(this)}, this);
</pre>
* 生成全局唯一id n.nuid()
<pre>
//如果不传参数，返回纯数字id
n.nuid('id_');
</pre>
* encodeURI一个Json对象 n.encodeURIJson()
<pre>
console.log(n.encodeURIJson({eb:1,y:2}));
</pre>
* ajax n.ajax/n.get/n.post
<pre>
//dataType如果是jsonp的话，这个请求为jsonp请求
n.ajax({
	url: 'http:127.0.0.1:10011',
	method: 'get',
	data: 'x=1&y=2',
	dataType: 'json',
	success: function(data){
		console.log(data);
	}
});
n.get('http://xxx',{x:1,y:2},function(){});
n.post('http://xxx',{x:1,y:2},function(){});
n.jsonp('http://xxx',{x:1,y:2},function(){});
</pre>
*浏览器嗅探 n.browser
<pre>
console.log(n.browser);
//chrome下打印出以下信息
{
	chrome: 28
	gecko: true
	ie: false
	isCompatible: true
	opera: false
	quirks: false
	version: 537
	webkit: true
}
</pre>

##业务模块##

* url参数解析 n.queryUrl()
<pre>
n.queryUrl('a=1&b=2&c=3');
</pre>
* 对前端字符串的编译和反编译模块 用法请查看[encode模块](https://github.com/Johnqing/n.js/blob/master/extras/n.encode.js)
* cookie n.cookie
<pre>
n.cookie('name', 'hello', 7);  //设置cookie
n.cookie('name');  //获取cookie
n.cookie('name', null);  //删除cookie
n.cookie('name', '', -1);  //删除cookie
</pre>
* 模板渲染引擎 n.tpl()/n.openTag/n.closeTag  [具体用法](https://github.com/Johnqing/Ntpl.js)
<pre>
//如果不设置分隔符默认为&lt;%
n.openTag = "&lt;#";
n.closeTag = "#&gt;";
console.log(n.tpl('name:&lt;#= name #&gt;', {name: 'n.js'}));
</pre>
* 动画模块 n.animate()
<pre>
//最后一个参数，可自行先加载easing算子，然后设置
n.animate(n('#animateTest'), {width:'100px', height:'10px'}, 2000, function(){
	alert('动画完成!');
},'jstwer');
</pre>
* 随机数模块 n.random()
<pre>
// 参数一：最小整数
// 参数二：最大整数 (可选)
// 参数三：输出随机个数 (可选)
n.random(0, 100, 10);  // 输出0-100范围内的10个随机数
n.random(10, 100); // 输出10-100范围内的1个随机数
n.random(10); // 输出0-10范围内的1个随机数
</pre>

##支持##

如果你有的意见可以到[这里](https://github.com/Johnqing/n.js/issues)也可以[邮件](mailto:csssnow@gmail.com)

##贡献者##

[@掰漏斯特](http://weibo.com/210126534) [@hard2easy](http://weibo.com/nister) [@王迎然](http://weibo.com/wangyingran)

