/**
 * Dplayer - Smart HTML5 Video Player
 *
 * Version - 1.0.0
 *
 * Copyright 2015,Dengjialong
 *
 */
function Dplayer(config) {

    //初始化配置
    this.config = this.build_config(config);

    //检查配置项是否正确
    if (this.check_config()) {

        //运行时数据初始化
        this.runtime = this.build_runtime();

        //初始化
        this.init();
    }
}

/**
 * 初始化配置项
 * @param config 配置项
 */
Dplayer.prototype.build_config = function(config) {
    //默认配置项
    var _config = {
        //调试开关
        debug: false,
        //皮肤
        theme: null,
        //容器ID
        container: null,
        //宽度
        width: 0,
        //高度
        height: 0,
        //播放器ID
        id: null,
        //播放器ID
        autoplay: false,
        //是否多个视频
        multiple: false,
        //视频源
        src: null,
        //封面图
        thumb: null,
        //播放列表
        playlist:[],
        //是否异步读取播放列表
        playlist_aysnc: false,
        //播放列表获取地址地址
        playlist_url: null
    }
    if (config) {
        for (var p in config) {
            _config[p] = config[p];
        }
    }
    return _config;
}

/**
 * 初始化运行时数据
 */
Dplayer.prototype.build_runtime = function() {
    var runtime = {
        //容器
        container: null,
        //video对象
        video: null,
        //video外层DIV
        video_container: null,
        //视频框架
        frame: null,
        //正在全屏
        fullscreening: false,
        //正在播放
        playing: false,
        //正在调整进度
        progressing: false,
        //播放列表
        playlist:[],
        //当前播放视频索引
        play_index:0,
        //当前播放清晰度
        play_definition:'',
    };
    if(this.config.multiple){
        runtime.playlist = this.config.playlist;
    }

    return runtime;
}

/**
 * 配置文件校验函数
 */
Dplayer.prototype.check_config = function() {
    if (!this.config.multiple) {
        if(!this.config.src){
            this.error('视频源配置错误');
            return false;
        }
    } else {
        if(!this.config.playlist){
            this.error('视频源配置错误');
            return false;
        }
    }
    if(this.config.playlist_aysnc && !this.config.playlist_url){
        this.error('视频源配置错误');
        return false;
    }
    return true;
}

/**
 * 初始化函数
 */
Dplayer.prototype.init = function() {
    if (!this.config.id) {
        this.config.id = "Dplayer_" + new Date().getTime() + Math.floor(Math.random() * 100);
    }
    if (this.config.theme) {
        var css = this.css_link(this.config.theme);
        this.css_ready(css, this.on_theme_ready.bind(this));
    } else {
        this.build_player();
    }
}

/**
 * 皮肤加载完毕回调
 */
Dplayer.prototype.on_theme_ready = function() {
    this.debug('播放器皮肤加载完毕');
    this.build_player();
}
/**
 * 类名样式表
 */
Dplayer.prototype._class = {

    //基础样式
    BASE: 'Dplayer',
    VIDEO: 'video',
    CONTROL_BAR: 'control-bar',
    HIDDEN: 'hidden',

    //视频遮罩层
    VIDEO_MASK: 'video-mask',
    VIDEO_MASK_ABOUT: 'video-mask-about',
    VIDEO_MASK_TEXT: 'video-mask-text',

    //进度条
    PROGRESS_CONTROL_BAR: 'progress-control-bar',
    PROGRESS_BAR: 'progress-bar',
    TIME_BAR: 'time-bar',
    BUFFER_BAR: 'buffer-bar',
    KNOB_BAR: 'knob-bar',

    //控制栏
    BUTTON_BAR: 'button-bar',
    LEFT_GROUP: 'left-group',
    RIGHT_GROUP: 'right-group',
    ICON_BASE: 'icon',
    ICON_LEFT: 'icon-left',
    ICON_RIGHT: 'icon-right',
    LABEL_TEXT: 'label-text',


    //左半控制栏
    ICON_SWITCH: 'icon-switch',
    ICON_PLAY: 'icon-play',
    ICON_PAUSE: 'icon-pause',
    ICON_FORWARD: 'icon-step-forward',
    ICON_BACKWARD: 'icon-step-backward',
    LABEL_POSITION: 'label-position',
    LABEL_DURATION: 'label-duration',

    //右半控制栏
    ICON_RESIZE: 'icon-resize',
    ICON_FULLSCREEN: 'icon-fullscreen',
    ICON_EXITFULLSCREEN: 'icon-resize-small',
    ICON_VOLUME: 'icon-volume',
    ICON_VOLUME_OFF: 'icon-volume-off',
    ICON_VOLUME_UP: 'icon-volume-up',
    ICON_SETTING: 'icon-cog',

    //声音进度条
    VOLUME_CONTROL_BAR: 'volume-control-bar',
    VOLUME_PROGRESS_BAR: 'volume-progress-bar',
    VOLUME_BAR: 'volume-bar',
    VOLUME_KNOB_BAR: 'volume-knob-bar',

    //清晰度设置栏
    DEFINITION_BAR: 'definition-bar',
    DEFINITION_LABEL: 'definition-label',
    DEFINITION_PANEL: 'definition-panel',
    DEFINITION_OPTION: 'definition-option',
    DEFINITION_OPTION_LAST: 'definition-option-last',
    DEFINITION_OPTION_SELECTED: 'definition-option-selected',
}

/**
 * 对外提供的事件
 */
Dplayer.prototype._event = [
    'ready',
    'resize',
    'play',
    'pause',
    'complete'
];

/**
 * 事件注册器
 * @param  evnet_name 事件名
 * @param  fun        回调函数
 */
Dplayer.prototype.on = function(evnet_name, fun) {

    if (this.index_of(this._event, evnet_name)) {
        if (fun && fun instanceof Function) {
            this['on_player_' + evnet_name] = fun;
        } else {
            this.error("注册函数参数错误");
        }
    } else {
        this.warn("该事件不支持");
    }
}
/**
 * 调试函数
 * @param  info 调试信息
 */
Dplayer.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Dplayer【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
        } else {
            console.log("Dplayer【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
        }
    }
}

/**
 * 输出错误信息
 * @param info 错误信息
 */
Dplayer.prototype.error = function(info) {
    if (info instanceof Object) {
        console.error("Dplayer【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
    } else {
        console.error("Dplayer【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
    }
}

/**
 * 输出警告信息
 * @param info 警告信息
 */
Dplayer.prototype.warn = function(info) {
    if (info instanceof Object) {
        console.warn("Dplayer【%s】:%o", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
    } else {
        console.warn("Dplayer【%s】:%s", this.format_date(new Date(),"yyyy-M-dd hh:mm:ss S"), info);
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
 * 异步get
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Dplayer.prototype.async_get = function(url, data, callback) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    this.debug(AjaxRequest.response);
                    if (!AjaxRequest.response) {
                        this.error('ajax返回格式错误');
                    } else {
                        callback(AjaxRequest.response);
                    }
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    url += "?time=" + new Date().getTime();
    for (var p in data) {
        url += "&" + p + "=" + data[p];
    }
    AjaxRequest.open('GET', url, true);　
    AjaxRequest.send(null);
}

/**
 * 异步post
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Dplayer.prototype.async_post = function(url, data, callback) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    callback(AjaxRequest.response);
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    var UploaDplayer = new FormData();
    if (UploaDplayer) {
        for (var p in data) {
            UploaDplayer.append(p, data[p]);
        }
        AjaxRequest.open('POST', url, true);　
        AjaxRequest.send(UploaDplayer);
    } else {
        this.error("提交过程出现错误");
    }
}

/**
 * 添加css头
 * @param  url [css链接地址]
 */
Dplayer.prototype.css_link = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'stylesheet');
    linkTag.setAttribute('type', 'text/css');
    linkTag.href = url;
    head.appendChild(linkTag);
    return linkTag;
}

/**
 * css加载判断
 * @param  link     [css链接]
 * @param  callback [回调函数]
 */
Dplayer.prototype.css_ready = function(link, callback) {
    var d = document,
        t = d.createStyleSheet,
        r = t ? 'rules' : 'cssRules',
        s = t ? 'styleSheet' : 'sheet',
        l = d.getElementsByTagName('link');
    // passed link or last link node
    link || (link = l[l.length - 1]);

    function check() {
        try {
            return link && link[s] && link[s][r] && link[s][r][0];
        } catch (e) {
            return false;
        }
    }

    (function poll() {
        check() && setTimeout(callback, 0) || setTimeout(poll, 100);
    })();
}


/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Dplayer.prototype.create_element = function(class_name, inner_text) {
    var element = document.createElement('div');
    if(class_name instanceof Array){
        element.className = class_name.join(' ');
    } else {
        element.className = class_name;
    }
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
            if (class_name.replace(/\s/g, '').length == 0) {
                return false;
            }
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

/**
 * 构造播放器
 */
Dplayer.prototype.build_player = function() {
    //初始化容器
    this.runtime.container = document.getElementById(this.config.container);
    this.runtime.frame = this.create_element(this._class.BASE);
    this.runtime.frame.style.width = this.config.width + 'px';
    //视频播放器
    this.runtime.frame.appendChild(this.build_video());
    //操作区
    this.runtime.frame.appendChild(this.build_control_bar());
    //渲染DOM
    this.runtime.container.appendChild(this.runtime.frame);
    //延迟100毫秒执行on_player_build，确保事件成功注册
    setTimeout(this.on_player_build.bind(this), 100);
}

/**
 * 构造视频区域
 * @return {[type]} [description]
 */
Dplayer.prototype.build_video = function() {
    //Video外层容器
    this.runtime.video_container = this.create_element(this._class.VIDEO);
    this.runtime.video_container.style.width = this.config.width + 'px';
    this.runtime.video_container.style.height = this.config.height + 'px';
    //Video DOM
    this.runtime.video = document.createElement("video");
    this.runtime.video.width = this.config.width;
    this.runtime.video.height = this.config.height;
    //初始化视频源
    this.init_src();
    //初始化封面
    this.init_poster();
    this.runtime.video_container.appendChild(this.runtime.video);
    //遮罩层
    this.runtime.video_container.appendChild(this.build_video_mask());
    return this.runtime.video_container;
}

/**
 * 构造遮罩层
 * @return {[type]} [description]
 */
Dplayer.prototype.build_video_mask = function() {
    var video_mask = this.create_element(this._class.VIDEO_MASK);
    //右键菜单
    video_mask.appendChild(this.build_context_menu());
    return video_mask; 
}

/**
 * 构造右键菜单
 * @return {[type]} [description]
 */
Dplayer.prototype.build_context_menu = function(){
    var video_mask_about = this.create_element([this._class.VIDEO_MASK_ABOUT,this._class.HIDDEN]);

    var about_name = this.create_element(this._class.VIDEO_MASK_TEXT,'名称:Dplayer');
    about_name.setAttribute('action','http://www.Dplayer.com');
    video_mask_about.appendChild(about_name);

    var about_version = this.create_element(this._class.VIDEO_MASK_TEXT,'版本:1.0.0');
    about_version.setAttribute('action','http://www.Dplayer.com');
    video_mask_about.appendChild(about_version);

    var about_author = this.create_element(this._class.VIDEO_MASK_TEXT,'作者:龙翔云际');
    about_author.setAttribute('action','http://dalong.me');
    video_mask_about.appendChild(about_author);

    if(this.config.about && this.config.about.length){
        for(var i=0;i<this.config.about.length;i++){
            var about = this.create_element(this._class.VIDEO_MASK_TEXT,this.config.about[i].text);
            about.setAttribute('action',this.config.about[i].link);
            video_mask_about.appendChild(about);
        }
    }

    return video_mask_about;
}

/**
 * 构造操作区
 */
Dplayer.prototype.build_control_bar = function() {
    var control_bar = this.create_element(this._class.CONTROL_BAR);
    //播放进度条
    control_bar.appendChild(this.build_progress_control_bar());
    //用户操作区
    control_bar.appendChild(this.build_button_bar());
    return control_bar;
}

/**
 * 构造播放进度条
 */
Dplayer.prototype.build_progress_control_bar = function() {
    //进度条控制区
    var progress_control_bar = this.create_element(this._class.PROGRESS_CONTROL_BAR);
    //进度条区
    var progress_bar = this.create_element(this._class.PROGRESS_BAR);
    //缓冲进度条
    progress_bar.appendChild(this.create_element(this._class.BUFFER_BAR));
    //播放进度条
    progress_bar.appendChild(this.create_element(this._class.TIME_BAR));
    //进度调节器
    progress_bar.appendChild(this.create_element([this._class.KNOB_BAR,this._class.HIDDEN]));
    progress_control_bar.appendChild(progress_bar);
    return progress_control_bar;
}

/**
 * 构造按钮区
 */
Dplayer.prototype.build_button_bar = function() {
    var button_bar = this.create_element(this._class.BUTTON_BAR);
    //左区域
    button_bar.appendChild(this.build_button_bar_left());
    //右区域
    button_bar.appendChild(this.build_button_bar_right());
    return button_bar;
}

/**
 * 构造按钮左区域
 */
Dplayer.prototype.build_button_bar_left = function() {
    var left_group = this.create_element(this._class.LEFT_GROUP);
    //播放按钮
    left_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_PLAY,this._class.ICON_SWITCH]));
    if (this.config.multiple) {
        //播放上一节
        left_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_BACKWARD]));
        //播放下一节
        left_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_FORWARD]));
    }
    //当前时间
    left_group.appendChild(this.create_element([this._class.LABEL_TEXT,this._class.LABEL_POSITION], '00:00:00'));
    //分隔符
    left_group.appendChild(this.create_element([this._class.LABEL_TEXT,this._class.LABEL_SPLITE], '|'));
    //总时长
    left_group.appendChild(this.create_element([this._class.LABEL_TEXT,this._class.LABEL_DURATION], '00:00:00'));
    return left_group;
}

/**
 * 构造按钮右区域
 */
Dplayer.prototype.build_button_bar_right = function() {
    var right_group = this.create_element(this._class.RIGHT_GROUP);
    //音量按钮
    right_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_VOLUME_UP,this._class.ICON_VOLUME]));
    //声音控制条
    right_group.appendChild(this.build_volume_control_bar());
    //清晰度
    if(!this.config.multiple){
        right_group.appendChild(this.build_definition_control_bar(this.config.src)); 
    } else {
        right_group.appendChild(this.build_definition_control_bar(this.config.playlist[0].src)); 
    }
    //设置按钮
    right_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_SETTING]));
    //全屏
    right_group.appendChild(this.create_element([this._class.ICON_BASE,this._class.ICON_FULLSCREEN,this._class.ICON_RESIZE]));
    return right_group;
}

/**
 * 构造声音控制条
 */
Dplayer.prototype.build_volume_control_bar = function() {
    var volume_control_bar = this.create_element(this._class.VOLUME_CONTROL_BAR);
    //音量进度条
    volume_control_bar.appendChild(this.create_element(this._class.VOLUME_PROGRESS_BAR));
    //音量进度条
    volume_control_bar.appendChild(this.create_element(this._class.VOLUME_BAR));
    //音量进度条选择器
    volume_control_bar.appendChild(this.create_element(this._class.VOLUME_KNOB_BAR));
    return volume_control_bar;
}

/**
 * 构造清晰度选项
 * @param  src_array  视频源信息
 */
Dplayer.prototype.build_definition_control_bar = function(src_array){
    var definition_control_bar = this.create_element(this._class.DEFINITION_BAR);
    
    //清晰度
    definition_control_bar.appendChild(this.create_element(this._class.DEFINITION_LABEL, '清晰度'));
    
    //清晰度选择面板
    var definition_panel = this.create_element([this._class.DEFINITION_PANEL,this._class.HIDDEN]);

    if(src_array instanceof Array){
        for(var i=0;i<src_array.length;i++){
            var definition_option;
            if(src_array[i]['index'] == this.runtime.play_definition){
                definition_option = this.create_element(this._class.DEFINITION_OPTION_SELECTED,src_array[i]['name']);
            } else {
                definition_option = this.create_element(this._class.DEFINITION_OPTION,src_array[i]['name']);
            } 
            definition_option.setAttribute('definition',src_array[i]['index']);       
            if(i == src_array.length - 1){
                this.add_class(definition_option,this._class.DEFINITION_OPTION_LAST);
            }    
            definition_panel.appendChild(definition_option);
        }
    } else {
        this.add_class(definition_control_bar,'hidden');
    }

    //设置面板 SETTING_PANEL
    definition_control_bar.appendChild(definition_panel);

    return definition_control_bar;
}

/**
 * 播放器DOM创建完毕回调
 */
Dplayer.prototype.on_player_build = function() {
    this.debug('播放器初始化完毕');
    //执行ready回调
    if (this.on_player_ready && this.on_player_ready instanceof Function) {
        this.on_player_ready();
    }
    //注册全局事件
    this.delegate_document_event();
    //注册video事件
    this.delegate_video_event();
    //注册control事件
    this.delegate_control_event();     
    //注册遮罩层事件
    this.delegate_mask_event();
    //自动播放   
    if (this.config.autoplay) {
        this.play();
    }
}
/**
 * 代理注册器
 * @param  class_name 类名
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Dplayer.prototype.delegate = function(class_name, event_name, fun) {
    var root = this.query_element(this._class.BASE);
    root.addEventListener(event_name, function(event) { 
        var target = event.target || event.srcElement;
        var path = [target.className];
        while(target.parentElement && target != root){
            path.push(target.parentElement.className);
            target = target.parentElement;
        }
        if(class_name){
            var target = event.target || event.srcElement;
            if (this.index_of(path, class_name)) {
                fun(event);
            };
        } else {
            fun(event);
        }
        return false;
    }.bind(this));
}

/**
 * 绑定video事件
 * @return {[type]} [description]
 */
Dplayer.prototype.delegate_video_event = function() {
    //视频可以播放
    this.runtime.video.addEventListener('canplay', this.on_video_canplay.bind(this));
    //视频正在请求数据
    this.runtime.video.addEventListener('progress', this.on_video_progress.bind(this));
    //视频播放开始时
    this.runtime.video.addEventListener('play', this.on_video_play.bind(this));
    //视频播放暂停时
    this.runtime.video.addEventListener('pause', this.on_video_pause.bind(this));
    //视频播放进行时
    this.runtime.video.addEventListener('timeupdate', this.on_video_playing.bind(this));
    //视频播放结束时
    this.runtime.video.addEventListener('ended', this.on_video_ended.bind(this));
}

Dplayer.prototype.delegate_mask_event = function(){
    this.delegate(this._class.VIDEO_MASK, 'contextmenu', this.on_mask_contextmenu.bind(this));
    this.delegate(this._class.VIDEO_MASK_ABOUT, 'mouseup', this.on_mask_about_click.bind(this));
}

/**
 * 绑定按钮区事件
 * @return {[type]} [description]
 */
Dplayer.prototype.delegate_control_event = function() {
    //进度条切换
    this.delegate(this._class.BASE, 'mousemove', this.on_control_progress_on.bind(this));
    this.delegate(this._class.BASE, 'mouseout', this.on_control_progress_off.bind(this));
    this.delegate(this._class.PROGRESS_BAR, 'mousedown', this.on_control_progress_select.bind(this));
    this.delegate(this._class.PROGRESS_BAR, 'mouseup', this.on_control_progress_seek.bind(this));
    this.delegate(this._class.BASE,'mouseup', this.on_control_progress_selected.bind(this));
    //播放开关
    this.delegate(this._class.ICON_SWITCH, 'mousedown', this.on_control_play.bind(this));
    //播放上一个视频
    this.delegate(this._class.ICON_FORWARD, 'mousedown', this.on_control_forward.bind(this));
    //播放下一个视频
    this.delegate(this._class.ICON_BACKWARD, 'mousedown', this.on_control_backward.bind(this));
    //静音开关
    this.delegate(this._class.ICON_VOLUME, 'mousedown', this.on_control_volume.bind(this));
    //调节音量
    this.delegate(this._class.VOLUME_CONTROL_BAR, 'mouseup', this.on_control_volume_seek.bind(this));
    //清晰度切换
    this.delegate(this._class.DEFINITION_BAR,'mouseover',this.on_control_definition_on.bind(this));
    this.delegate(this._class.DEFINITION_BAR,'mouseout',this.on_control_definition_off.bind(this));
    this.delegate(this._class.DEFINITION_OPTION,'mouseup',this.on_control_definition_change.bind(this));
    //设置
    this.delegate(this._class.ICON_SETTING, 'mousedown', this.on_control_setting.bind(this));
    //全屏
    this.delegate(this._class.ICON_RESIZE, 'mousedown', this.on_control_fullscreen.bind(this));
}

/**
 * 注册全局函数
 * @return {[type]} [description]
 */
Dplayer.prototype.delegate_document_event = function(){
    //坑爹的全屏API
    document.addEventListener('fullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('mozfullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('MSFullscreenChange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('mouseup', function() {
        this.runtime.progressing = false;
        this.query_element('video-mask-about').add_class('hidden');
    }.bind(this));    
}
/**
 * 获取视频地址索引
 * @param  src_array 视频源列表
 * @param  definition 清晰度选择
 */
Dplayer.prototype.get_video_src_index = function(src_array,definition){
    if(src_array){
        for(var i=0;i<src_array.length;i++){
            if(!definition){
                if(src_array[i]['default']){
                    return i;
                }
            } else {
                if(src_array[i]['index'] == definition){
                    return i;
                }
            }
        }
    } else {
        return '';
    }
}

/**
 * 初始化视频源
 */
Dplayer.prototype.init_src = function(){
	//视频源信息
	var video_src_info;
	if (!this.config.multiple) {
		video_src_info = this.config.src;
	} else {
		video_src_info = this.runtime.playlist[0].src;
	}
	if(video_src_info instanceof Array){
	    var video_src_index = this.get_video_src_index(video_src_info);
	    this.runtime.video.src = video_src_info[video_src_index]['url'];
	    this.runtime.play_definition = video_src_info[video_src_index]['index'];
	} else {
	    this.runtime.video.src = this.config.src;
	}
}

/**
 * 初始化封面
 */
Dplayer.prototype.init_poster = function(){
	if (!this.config.multiple) {      
        if (this.config.thumb) {
            this.runtime.video.poster = this.config.thumb;
        }
    } else {
        if (this.runtime.playlist[0].thumb) {
            this.runtime.video.poster = this.runtime.playlist[0].thumb;
        }
    }
}

/**
 * 切换视频源
 * @param  src    	  视频源信息
 * @param  from_begin 是否从头播放
 */
Dplayer.prototype.change_src = function(src,from_begin){
    if(!this.runtime.playing){
        this.runtime.video.src = src;
        this.change_buffer(0);
        this.change_progress(0);
    } else {
        this.pause();
        if(from_begin){
            this.runtime.video.src = src;
            this.change_buffer(0);
            this.change_progress(0);
        } else {
            var position = this.runtime.video.currentTime;
            this.runtime.video.src = src;
            this.runtime.video.currentTime = position;
        }
        this.play();
    }
}

/**
 * 视频播放
 */
Dplayer.prototype.play = function() {
    this.runtime.video.play();
    this.runtime.playing = true;
    this.query_element(this._class.ICON_SWITCH).remove_class(this._class.ICON_PLAY);
    this.query_element(this._class.ICON_SWITCH).add_class(this._class.ICON_PAUSE);
}

/**
 * 视频暂停
 */
Dplayer.prototype.pause = function() {
    this.runtime.video.pause();
    this.runtime.playing = false;
    this.query_element(this._class.ICON_SWITCH).remove_class(this._class.ICON_PAUSE);
    this.query_element(this._class.ICON_SWITCH).add_class(this._class.ICON_PLAY);
}

Dplayer.prototype.change_play = function(index){
    if(!this.runtime.playing){
        if(this.runtime.playlist[index].thumb){
            this.runtime.video.poster = this.runtime.playlist[index].thumb;
        } else {
            this.runtime.video.poster = '';
        }
    }
    //获取视频源
    var new_src = this.runtime.playlist[index].src;
    if(new_src instanceof Array){
        var index = this.get_video_src_index(new_src);
        var src = new_src[index]['url'];
        this.runtime.play_definition = new_src[index]['index'];
        //重构清晰度选项面板
        this.on_definition_panel_rebuild(new_src);
        //切换播放源
        this.change_src(src,true);        
        //显示清晰度控制按钮
        this.query_element(this._class.DEFINITION_BAR).remove_class('hidden'); 
    } else {
        //切换播放源
        this.change_src(new_src,true);
        //隐藏清晰度控制按钮
        this.query_element(this._class.DEFINITION_BAR).add_class('hidden'); 
    }
}


/**
 * 视频进入全屏
 */
Dplayer.prototype.fullscreen = function() {
	var frame = this.query_element(this._class.BASE);
    if (frame.requestFullscreen) {
        frame.requestFullscreen();
    } else if (frame.mozRequestFullScreen) {
        frame.mozRequestFullScreen();
    } else if (frame.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen();
    } else if (frame.msRequestFullscreen) {
        frame.msRequestFullscreen();
    }
}

/**
 * 视频退出全屏
 */
Dplayer.prototype.exitfullscreen = function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozExitFullScreen) {
        document.mozExitFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * 视频大小调整
 * @param  width  宽度
 * @param  height 高度
 */
Dplayer.prototype.resize = function(width, height) {
    this.runtime.frame.style.width = width + 'px';
    this.runtime.frame.style.height = height + 'px';
    this.runtime.video_container.style.width = width + 'px';
    this.runtime.video_container.style.height = height + 'px';
    this.runtime.video.width = width;
    this.runtime.video.height = height;
}

/**
 * 视频缓存状态变更
 * @param  bufferd 缓冲描述
 */
Dplayer.prototype.change_buffer = function(bufferd) {
    var duration = parseInt(this.runtime.video.duration);
    var percent = this.format_percent(bufferd, duration);
    this.query_element(this._class.BUFFER_BAR).style.width = percent + "%";
}

/**
 * 视频进度状态变更
 * @param  position 播放秒数
 */
Dplayer.prototype.change_progress = function(position) {
    var duration = parseInt(this.runtime.video.duration);
    var percent = this.format_percent(position, duration);
    var total_width = this.query_element(this._class.PROGRESS_BAR).clientWidth;
    var knob_width = this.query_element(this._class.KNOB_BAR).clientWidth;
    var left = (total_width * percent) / 100;
    if (left <= knob_width / 2) {
        this.query_element(this._class.KNOB_BAR).style.left = (knob_width / 2) + "px";
    } else if (left >= (total_width - knob_width / 2)) {
        this.query_element(this._class.KNOB_BAR).style.left = (total_width - knob_width / 2) + "px";
    } else {
        this.query_element(this._class.KNOB_BAR).style.left = percent + "%";
    }
    this.query_element(this._class.TIME_BAR).style.width = percent + "%";
}

/**
 * 视频音量变更
 * @param  volume 音量大小
 */
Dplayer.prototype.change_volume = function(volume) {
    this.runtime.video.volume = volume / 100;
    var percent = this.format_percent(volume, 100);
    this.query_element(this._class.VOLUME_KNOB_BAR).style.left = percent + "%";
    this.query_element(this._class.VOLUME_BAR).style.width = percent + "%";
}
/**
 * 视频能够播放状态回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_canplay = function(event) {
    this.debug('视频可以播放')
    var duration = parseInt(this.runtime.video.duration);
    this.query_element(this._class.LABEL_DURATION).innerText = this.format_time(duration);
}

/**
 * 视频缓冲数据回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_progress = function(event) {
    if(this.runtime.playing){
        var TimeRanges = this.runtime.video.buffered;
        if (TimeRanges && TimeRanges.length) {
            var bufferd = parseInt(TimeRanges.end(TimeRanges.length - 1));
            this.change_buffer(bufferd);
        }
    }
}

/**
 * 视频播放回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_play = function(event) {
    this.debug('视频播放开始');
    if (this.on_player_play && this.on_player_play instanceof Function) {
        this.on_player_play();
    }
}

/**
 * 视频暂停回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_pause = function(event) {
    this.debug('视频播放暂停');
    if (this.on_player_pause && this.on_player_pause instanceof Function) {
        this.on_player_pause();
    }
}

/**
 * 视频播放期回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_playing = function(event) {
    if (!this.runtime.progressing) {
        var position = parseInt(this.runtime.video.currentTime);
        var duration = parseInt(this.runtime.video.duration);
        this.query_element(this._class.LABEL_POSITION).innerText = this.format_time(position);
        this.query_element(this._class.LABEL_DURATION).innerText = this.format_time(duration);     
        this.change_progress(position);
    }
}

/**
 * 视频播放结束回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_ended = function(event){
    this.debug('视频播放');
    this.runtime.playing = false;
    this.query_element(this._class.ICON_SWITCH).remove_class(this._class.ICON_PAUSE);
    this.query_element(this._class.ICON_SWITCH).add_class(this._class.ICON_PLAY);
}

/**
 * 视频全屏状态变更回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_fullscreenchange = function(event) {
    if (!this.runtime.fullscreening) {
        this.debug('视频进入全屏');
        var control_bar_height = this.query_element(this._class.CONTROL_BAR).clientHeight;
        var width = 0;
        var height = 0;
        if (document.msRequestFullscreen) {
            width = window.screen.width;
            height = window.screen.height - control_bar_height;
        } else {
            width = window.screen.availWidth;
            height = window.screen.availHeight - control_bar_height-10;
        }
        this.resize(width, height);
        this.runtime.fullscreening = true;
        this.query_element(this._class.ICON_RESIZE).remove_class(this._class.ICON_FULLSCREEN);
        this.query_element(this._class.ICON_RESIZE).add_class(this._class.ICON_EXITFULLSCREEN);
    } else {
        this.debug('视频退出全屏');
        this.resize(this.config.width, this.config.height);
        this.runtime.fullscreening = false;
        this.query_element(this._class.ICON_RESIZE).remove_class(this._class.ICON_EXITFULLSCREEN);
        this.query_element(this._class.ICON_RESIZE).add_class(this._class.ICON_FULLSCREEN);
    }
}
/**
 * 进入进度条回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_progress_on = function(event) {
    this.query_element(this._class.KNOB_BAR).remove_class(this._class.HIDDEN);
    if (this.runtime.playing && this.runtime.progressing) {
        var offset = this.get_offset_x(event,this.query_element(this._class.PROGRESS_BAR));
        var total = this.query_element(this._class.PROGRESS_BAR).clientWidth;
        var percent = this.format_percent(offset, total);
        var duration = parseInt(this.runtime.video.duration);
        var position = parseInt(duration * percent / 100);
        this.change_progress(position);
    }
}

/**
 * 离开进度条回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_progress_off = function(event) {
    this.query_element(this._class.KNOB_BAR).add_class(this._class.HIDDEN);
}

/**
 * 开始拖动进度条回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_progress_select = function(event) {
    this.runtime.progressing = true;
    //如果不使用preventDefault可能会使得mouseup事件失效。
    event.preventDefault();
}

/**
 * 进度条拖动完毕回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_progress_selected = function(event) {
    if (this.runtime.playing && this.runtime.progressing) {
        this.on_control_progress_seek(event);
    }
}

/**
 * 调整进度回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_progress_seek = function(event) {
    this.runtime.progressing = false;
    if (this.runtime.playing) {
        var offset = this.get_offset_x(event,this.query_element(this._class.PROGRESS_BAR));
        var total = this.query_element(this._class.PROGRESS_BAR).clientWidth;
        var percent = this.format_percent(offset, total);
        var position = parseInt(this.runtime.video.duration * percent / 100);
        this.change_progress(position);
        this.runtime.video.currentTime = position;
    }
    return false;
}

/**
 * 点击播放按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_play = function(event) {
    if (this.runtime.playing) {
        this.pause();
    } else {
        this.play();
    }
}

Dplayer.prototype.on_control_forward = function(event){
    var play_index = this.runtime.play_index;
    if(!this.runtime.playlist[play_index + 1]){
        this.error('不存在下一节');
        return false;
    }
    this.change_play(play_index + 1);
    this.runtime.play_index += 1;
}

Dplayer.prototype.on_control_backward = function(event){
    var play_index = this.runtime.play_index;
    if(!this.runtime.playlist[play_index - 1]){
        this.error('不存在上一节');
        return false;
    }
    this.change_play(play_index - 1);
    this.runtime.play_index -= 1;
}

/**
 * 点击音量按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_volume = function(event) {
    if (this.runtime.video.volume) {
        this.change_volume(0);
        this.query_element(this._class.ICON_VOLUME).remove_class(this._class.ICON_VOLUME_UP);
        this.query_element(this._class.ICON_VOLUME).add_class(this._class.ICON_VOLUME_OFF);
    } else {
        this.change_volume(100);
        this.query_element(this._class.ICON_VOLUME).remove_class(this._class.ICON_VOLUME_OFF);
        this.query_element(this._class.ICON_VOLUME).add_class(this._class.ICON_VOLUME_UP);
    }
}

/**
 * 点击音量按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_volume_seek = function(event) {
    var offset = this.get_offset_x(event,this.query_element(this._class.VOLUME_CONTROL_BAR));
    var total = this.query_element(this._class.VOLUME_CONTROL_BAR).clientWidth;
    var percent = this.format_percent(offset, total);
    this.change_volume(percent);
}

/**
 * 点击设置按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_setting = function(event) {
    this.debug('坑爹呢！');
}

/**
 * 点击全屏按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_fullscreen = function(event) {
    if (!this.runtime.fullscreening) {
        this.fullscreen();
    } else {
        this.exitfullscreen();
    }
}

Dplayer.prototype.on_control_definition_on = function(event){

    this.query_element(this._class.DEFINITION_PANEL).remove_class(this._class.HIDDEN);
}

Dplayer.prototype.on_control_definition_off = function(event){
    
    this.query_element(this._class.DEFINITION_PANEL).add_class(this._class.HIDDEN);
}

Dplayer.prototype.on_control_definition_change = function(event){
    var definition = event.target.getAttribute('definition');
    this.runtime.play_definition = definition;
    if(!definition){
        this.error('清晰度选择错误');
        return false;
    }
    //获取视频源
    var src_array = this.config.multiple ? this.config.playlist[this.runtime.play_index].src : this.config.src;
    var index = this.get_video_src_index(src_array,definition);
    var src = src_array[index]['url'];
    //切换播放源
    this.change_src(src);
    //重构清晰度选项面板
    this.on_definition_panel_rebuild(src_array);
}

Dplayer.prototype.on_definition_panel_rebuild = function(src_array){
    this.query_element(this._class.DEFINITION_PANEL).innerHTML='';
    for(var i=0;i<src_array.length;i++){
        var definition_option;
        if(src_array[i]['index'] == this.runtime.play_definition){
            definition_option = this.create_element(this._class.DEFINITION_OPTION_SELECTED,src_array[i]['name']);
        } else {
            definition_option = this.create_element(this._class.DEFINITION_OPTION,src_array[i]['name']);
        } 
        definition_option.setAttribute('definition',src_array[i]['index']);       
        if(i == src_array.length - 1){
            this.add_class(definition_option,this._class.DEFINITION_OPTION_LAST);
        }    
        this.query_element(this._class.DEFINITION_PANEL).appendChild(definition_option);
    }
}

/**
 * 视频遮罩层右键回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_mask_contextmenu = function(event){
    var offset_x = this.get_offset_x(event,this.query_element("video-mask"));
    var offset_y = this.get_offset_y(event,this.query_element("video-mask"));
    this.query_element(this._class.VIDEO_MASK_ABOUT).style.left = offset_x + 'px';
    this.query_element(this._class.VIDEO_MASK_ABOUT).style.top = offset_y + 'px';
    this.query_element(this._class.VIDEO_MASK_ABOUT).remove_class(this._class.HIDDEN);
    event.preventDefault();
}

/**
 * 关于层点击回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_mask_about_click =function(event){
    var link = event.target.getAttribute('action');
    window.open(link);
    event.preventDefault();
}