/**
 * @author johnqing(刘卿)
 * @module Selector
 * @link n.js
 */
!function(nJs){
	// 检测a元素是否包含了b元素
	nJs.contains = function( a, b ){
		// 标准浏览器支持compareDocumentPosition
		if( a.compareDocumentPosition ){
			return !!( a.compareDocumentPosition(b) & 16 );
		}
		// IE支持contains
		else if( a.contains ){
			return a !== b && a.contains( b );
		}

		return false;
	}
	// DOM元素过滤器
	n.filter = function( source, selector ){
		var target = [],
			l = 0,
			matches, filter, type, name, elem, tagName, len, i;

		source = nJs.makeArray( source );
		len = source.length;

		if(nJs.isString(selector) ){
			matches = nJs.nSelector.adapter( selector );
			filter = nJs.nSelector.filter[ matches[0] ];
			name = matches[1];
			tagName = matches[2];
			if( !filter ){
				type = matches[0];
			}

			if( type ){
				target = nJs.nSelector.finder[ type ]( selector, source, true );
			}
			else{
				for( i = 0; i < len; i++ ){
					elem = source[i];
					if( filter(elem, name, tagName) ){
						target[ l++ ] = elem;    
					}                    
				}
			}
		}        
		else if(nJs.isFunction(selector)){
			for( i = 0; i < len; i++ ){
				elem = source[i];
				if( selector.call(elem, i) ){
					target[ l++ ] = elem;
				}
			}            
		}

		source = elem = null;
		return target;
	}
	/**
	* 选择器
	* @param  {String} selector 选择元素
	* @param  {Object} context  父容器
	* @return {Array}           
	*/
	nJs.query = function(selector, context){
		context = context || document;

		if(!nJs.isString(selector)){
			return context;
		}

		var elems = [],
			contains = nJs.contains,
			makeArray = nJs.makeArray,
			nodelist, selectors, splitArr, matchArr, splitItem, matchItem, prevElem,
			lastElem, nextMatch, matches, elem, len, i;

		// 标准浏览器和IE8支持querySelectorAll方法
		if( document.querySelectorAll ){
			try{
				context = makeArray(context);
				len = context.length;
				prevElem = context[0];
				for( i = 0; i < len; i++ ){
					elem = context[i];
					if( !contains(prevElem, elem) ){
						prevElem = elem;
						elems = makeArray(elem.querySelectorAll(selector), elems);
					}
				}
				prevElem = elem = context = null;
				return elems;                
			}catch( e ){};
		}

		splitArr = selector.split( ',' );
		len = splitArr.length;

		for( i = 0; i < len; i++ ){
			nodelist = [ context ];
			splitItem = splitArr[i];

			// 将选择器进行分割
			// #list .item a => [ '#list', '.item', 'a' ]
			if( rRelative.test(splitItem) ){
				splitItem = splitItem.replace( /[>\+~]/g, function( symbol ){
					return ' ' + symbol + ' ';
				});
			}

			matchArr = splitItem.match( /[^\s]+/g );

			for( var j = 0, clen = matchArr.length; j < clen; j++ ){
				matchItem = matchArr[j];                                
				lastElem = makeArray( nodelist[ nodelist.length - 1 ] );

				// 关系选择器要特殊处理
				nextMatch = /[>\+~]/.test( matchItem ) ? matchArr[++j] : undefined; 
				elem = nJs.nSelector.adapter( matchItem, lastElem, nextMatch );    

				if( !elem ){
					return elems;
				}

				nodelist[ nodelist.length++ ] = elem;
			}

			elems = makeArray( nodelist[nodelist.length - 1], elems );        
		}

		nodelist = lastElem = context = elem = null;

		return elems;
	}
	//关于不同属性的适配
	nJs.mix(nJs, {
			nSelector : {
				getAttribute : function( elem, name ){
					return attrMap[ name ] ? elem[attrMap[name]] || null :
					rAttrUrl.test( name ) ? elem.getAttribute( name, 2 ) :
					elem.getAttribute( name );
				},
				/*
				* 选择器的适配器
				* @param { String } 选择器字符串
				* @param { Object } 查找范围
				* @param { String } 关系选择器的第二级选择器
				* @return { Array } 
				* 无查找范围返回[ 选择器类型, 处理后的基本选择器, tagName ]
				* 有查找范围将返回该选择器的查找结果
				*/
				adapter : function( selector, context, nextSelector ){
					var index, name, tagName, matches, type;

					type = nextSelector !== undefined || ~selector.indexOf( '#' ) ? 'ID' :
					~selector.indexOf( '[' ) ? 'ATTR' :
					~selector.indexOf( '.' ) ? 'CLASS' : 'TAG';            

					if( !context ){
						switch( type ){            
							case 'CLASS' :                 
								index = selector.indexOf( '.' );                
								name = ' ' + selector.slice( index + 1 ) + ' ';    
								tagName = selector.slice( 0, index ).toUpperCase();                
								break;                

							case 'TAG' :                
								name = selector.toUpperCase();                    
								break;

							case 'ID' :                
								index = selector.indexOf( '#' );                
								name = selector.slice( index + 1 );        
								tagName = selector.slice( 0, index ).toUpperCase();                    
								break;
						}

						return [ type, name, tagName ];
					}

					return nSelector.finder[ type ](selector, context, nextSelector);
				},
				finder: {
					// id选择器
					ID : function( selector, context ){
						return context[0].getElementById( selector.slice(selector.indexOf('#') + 1) );
					},
					// class选择器
					CLASS : function( selector, context ){        
						var elems = [],
						index = selector.indexOf( '.' ),
						tagName = selector.slice( 0, index ) || '*',
						// 选择器两边加空格以确保完全匹配(如：val不能匹配value) 
						className = ' ' + selector.slice( index + 1 ) + ' ',
						i = 0, 
						l = 0,
						elem, len, name;

						context = nSelector.finder.TAG( tagName, context, true );            
						len = context.length;

						for( ; i < len; i++ ){
							elem = context[i];
							name = elem.className;
							if( name && ~(' ' + name + ' ').indexOf(className) ){
								elems[l++] = elem;
							}
						}

						elem = context = null;
						return elems;
					},
					// tag选择器
					TAG : function( selector, context, noCheck ){
						var elems = [],
							prevElem = context[0],
							contains = nJs.contains,
							makeArray = nJs.makeArray,
							len = context.length,
							i = 0,
							elem;

						// class选择器和context元素只有一个时不需要检测contains的情况
						noCheck = noCheck || len === 1;

						for( ; i < len; i++ ){
							elem = context[i];
							if( !noCheck ){
								// 检测contains情况确保没有重复的DOM元素
								if( !contains(prevElem, elem) ){
									prevElem = elem;    
									elems = makeArray( elem.getElementsByTagName(selector), elems );
								}
							}else{
								elems = makeArray( elem.getElementsByTagName(selector), elems );
							}
						}

						prevElem = elem = context = null;
						return elems;
					},
					// 属性选择器
					ATTR : function( selector, context, isFiltered ){
						var elems = [],
							matches = selector.match( rAttr ),
							getAttribute = nSelector.getAttribute,
							attr = matches[1],
							symbol = matches[2] || undefined,
							attrVal = matches[5] || matches[4],            
							i = 0,
							l = 0,
							len, elem, val, matchAttr, sMatches, filterBase, name, tagName;            

						selector = selector.slice( 0, selector.indexOf('[') ) || '*';
						context = isFiltered ? context : nSelector.adapter( selector, context );
						len = context.length;
						sMatches = nSelector.adapter( selector );
						filterBase = nSelector.filter[ sMatches[0] ];
						name = sMatches[1];
						tagName = sMatches[2];       

						for( ; i < len; i++ ){
							elem = context[i];
							if( !isFiltered || filterBase(elem, name, tagName) ){
								val = getAttribute( elem, attr );        
								// 使用字符串的方法比正则匹配要快
								matchAttr = val === null ? 
									symbol === '!=' && val !== attrVal :
									symbol === undefined ? val !== null :
									symbol === '=' ? val === attrVal :
									symbol === '!=' ? val !== attrVal :
									symbol === '*=' ? ~val.indexOf( attrVal ) :
									symbol === '~=' ? ~( ' ' + val + ' ' ).indexOf( ' ' + attrVal + ' ' ) :
									symbol === '^=' ? val.indexOf( attrVal ) === 0 :
									symbol === '$=' ? val.slice( val.length - attrVal.length ) === attrVal :                            
									symbol === '|=' ? val === attrVal || val.indexOf( attrVal + '-' ) === 0 :
									false;

								if( matchAttr ){
									elems[l++] = elem;
								}
							}
						}

						elem = context = null;    
						return elems;
					}
				},
				filter: {
					// ID过滤器    
					ID : function( elem, name, tagName ){
						var isTag = isTag = tagName === '' || elem.tagName === tagName;
						return isTag && elem.id === name;
					},

					// class过滤器
					CLASS : function( elem, name, tagName ){
						var className = elem.className,
						isTag = tagName === '' || elem.tagName === tagName;                
						return isTag && className && ~( ' ' + className + ' ' ).indexOf( name );
					},

					// tag过滤器
					TAG : function( elem, name ){
						return elem.tagName === name;
					}
				}
			}
	});
}(n);