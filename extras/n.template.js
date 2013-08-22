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
