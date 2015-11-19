/**
 * 调试函数
 * @param  info 调试信息
 */
Dplayer.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Dplayer【%s】【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        } else {
            console.log("Dplayer【%s】【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        }
    }
}

/**
 * 输出错误信息
 * @param info 错误信息
 */
Dplayer.prototype.error = function(info) {
    if (this.config.id) {
        if (info instanceof Object) {
            console.error("Dplayer【%s】【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        } else {
            console.error("Dplayer【%s】【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        }
    } else {
        console.error("Dplayer【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
    }
    if (this.config.on_player_error && this.config.on_player_error instanceof Function) {
        this.config.on_player_error(info);
    }
}

/**
 * 输出警告信息
 * @param info 警告信息
 */
Dplayer.prototype.warn = function(info) {
    if (this.config.id) {
        if (info instanceof Object) {
            console.warn("Dplayer【%s】【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        } else {
            console.warn("Dplayer【%s】【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"),this.config.id, info);
        }
    } else {
        console.warn("Dplayer【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
    }
    if (this.config.on_player_warn && this.config.on_player_warn instanceof Function) {
        this.config.on_player_warn(info);
    }
}

/**
 * 数组查找函数
 * @param  目标数组
 * @param  待查找元素
 */
Dplayer.prototype.index_of = function(array, find) {
    var finder = array.join();
    return finder.indexOf(find) >= 0;
}

/**
 * 时间格式化函数
 * @param  second 秒数
 */
Dplayer.prototype.format_time = function(second) {
    var time = [parseInt(second / 60 / 60), parseInt(second / 60 % 60), second % 60].join(":");
    return time.replace(/\b(\d)\b/g, "0$1");
}

/**
 * 百分比换算函数
 * @param  numerator 分子
 * @param  denominator 分母
 */
Dplayer.prototype.format_percent = function(numerator, denominator) {
    if (!denominator) {
        return 0;
    } else {
        return (Math.round(numerator / denominator * 10000) / 100.00);
    }
}

/**
 * 日期格式化函数
 * @param  date 时间对象
 * @param  fmt  待输出格式
 */
Dplayer.prototype.format_date = function(date,fmt) { 
    var o = { 
     "M+" : date.getMonth()+1,                 //月份 
     "d+" : date.getDate(),                    //日 
     "h+" : date.getHours(),                   //小时 
     "m+" : date.getMinutes(),                 //分 
     "s+" : date.getSeconds(),                 //秒 
     "q+" : Math.floor((date.getMonth()+3)/3), //季度 
     "S"  : date.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) 
     fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    for(var k in o) 
     if(new RegExp("("+ k +")").test(fmt)) 
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
    return fmt; 
}

/**
 * 左偏移量计算
 * @param  event 事件
 */
Dplayer.prototype.get_offset_x = function(event,target) {
    var offset = event.clientX - target.getBoundingClientRect().left;
    return parseInt(offset);
}

/**
 * 上偏移量计算
 * @param  event 事件对象
 */
Dplayer.prototype.get_offset_y = function(event,target) {
    var offset = event.clientY - target.getBoundingClientRect().top;
    return parseInt(offset);
}

/**
 * 是否包含类判断
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Dplayer.prototype.has_class = function(element, class_name) {
    class_name = class_name || '';
    if (class_name.replace(/\s/g, '').length == 0) return false;
    return new RegExp(' ' + class_name + ' ').test(' ' + element.className + ' ');
}

/**
 * 添加类
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Dplayer.prototype.add_class = function(element, class_name) {
    if (!this.has_class(element, class_name)) {
        element.className = element.className == '' ? class_name : element.className + ' ' + class_name;
    }
}

/**
 * 移除类
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Dplayer.prototype.remove_class = function(element, class_name) {
    if (this.has_class(element, class_name)) {
        var newClass = ' ' + element.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + class_name + ' ') >= 0) {
            newClass = newClass.replace(' ' + class_name + ' ', ' ');
        }
        element.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Dplayer.prototype.create_element = function(class_name, inner_text) {
    var element = document.createElement('div');
    element.className = class_name;
    if (inner_text) {
        element.innerText = inner_text;
    }
    return element;
}

/**
 * 根据类名定位元素
 * @param  class_name 类名
 */
Dplayer.prototype.query_element = function(class_name){
    if(class_name){
        var selector = "." + class_name;
        var result = document.querySelector(selector);
        result.has_class = function(class_name){
            class_name = class_name || '';
            if (class_name.replace(/\s/g, '').length == 0) return false;
            return new RegExp(' ' + class_name + ' ').test(' ' + this.className + ' ');
        };
        result.add_class = function(class_name){
            if (!this.has_class(class_name)) {
                this.className = this.className == '' ? class_name : this.className + ' ' + class_name;
            }
        };
        result.remove_class = function(class_name){
            if (this.has_class(class_name)) {
                var newClass = ' ' + this.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + class_name + ' ') >= 0) {
                    newClass = newClass.replace(' ' + class_name + ' ', ' ');
                }
                this.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        };
        return result;
    } else {
        return null;
    }
}