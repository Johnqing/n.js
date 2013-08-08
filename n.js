;(function(window, undefined){
  var document = window.document;
	/**
	 * getClass
	 * @param  {String} searchClass
	 * @param  {Object} node
	 * @param  {String} tag
	 * @return {Object}
	 */
	if(!document.getElementsByClassName){
	    document.getElementsByClassName = function(className, element){
	        var children = (element || document).getElementsByTagName('*');
	        var elements = new Array();
	        for (var i=0; i<children.length; i++){
	            var child = children[i];
	            var classNames = child.className.split(' ');
	            for (var j=0; j<classNames.length; j++){
	                if (classNames[j] == className){ 
	                    elements.push(child);
	                    break;
	                }
	            }
	        } 
	        return elements;
	    };
	}
	/**
	 * n选择器
	 * @param  {String} a 筛选元素
	 * @param  {Object} b 筛选的父级
	 * @return {Object}
	 */
	var n = function(a, b){
		a = a.match(/^(\W)?(.*)/); 
		return(b || document)[
		"getElement" + (        
		  a[1]
		    ? a[1] == "#"
		      ? "ById"           // node by ID,
		      : "sByClassName"   // nodes by class name, or
		    : "sByTagName"       // nodes by tag name,
		)
		](a[2]);
	}
	window.n = window.N = n;
}(this));
