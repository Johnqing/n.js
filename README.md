n.js
====

> 轻量级的工具集合（兼容傻x ie6），简化日常小型项目中的开发

##方法支持##

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
* 创建dom元素 n.md()
<pre>
var c = n.md('&lt;h1&gt;'+i+'&lt;/h1&gt;');
elem.appendChild(c);
</pre>
* 数组/普通对象/字符串/类数组遍历 n.forEach()
<pre>
var node = document.getElementsByTagName('li');
n.forEach(node, function(e, i){
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
* url参数解析 n.queryUrl()
<pre>
n.queryUrl('a=1&b=2&c=3');
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
* 将源对象的属性并入到目标对象 n.tpl() 这个函数内部二次封装了 [NTpl模板引擎](https://github.com/Johnqing/Ntpl.js)
<pre>
n.tpl(n('#tpl'), '&lt;%= name %&gt;', {name:'johnqing'});
</pre>
* 防止命名空间冲突 n.noConflict()
<pre>
n.noConflict('$');
$('#test').innerHTML = "$";
</pre>

##支持##

如果你有的意见可以到[这里](https://github.com/Johnqing/n.js/issues)也可以[邮件](mailto:csssnow@gmail.com)

##贡献者##

[@掰漏斯特](http://weibo.com/210126534) [@hard2easy](http://weibo.com/nister)

