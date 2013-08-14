/**
 * @author 王迎然(www.wangyingran.com)
 * @module random模块
 * @link n.js
 */
!function(window){
    
	/**
     * random
     * @param  {Number} min  最小整数
     * @param  {Number} max  最大整数 (可选)
     * @param  {Number} num  输出随机个数 (可选)
     * @return {Array}
     */
	var random = function(min, max, num) {
        
        if (n.isUndefined(num)) {
            if (n.isUndefined(max)) {
                if (min == 0) return 0;
                max = min;
                min = 0;
            }
            return min + (~~Math.random() * (max - min) + 1);
        }

        if (max - min < num) return;

        var a = [],
            j = {};

        for (; a.length < num;) {
            var i = min + (~~Math.random() * (max - min) + 1);
            if (!j[i]) {
                j[i] = i;
                a.push(i);
            }
        }

        return a;
    }
    
    /**
     * 追加random模块到n命名空间上
     * @namespace n
     */
    n.mix(n, {
        random : function(min, max, num) {
            return random(min, max, num);
        }
    });
	
}(this);
