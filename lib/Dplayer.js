/**
 * Dplayer - Smart HTML5 Video Player
 *
 * Version - 1.0.0
 *
 * Copyright 2015,Dengjialong
 *
 */

/**
 * 构造函数
 * @param  config 配置项
 */
function Dplayer(config) {

    //初始化配置
    this.config = this.build_config(config);

    //检查配置项是否正确
    if (this.check_config()) {

        //运行时数据初始化
        this.runtime = this.build_runtime();

        //表单初始化
        this.init();
    }
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
 * 样式表
 */
Dplayer.prototype._class = {
    //基础样式
    BASE: 'Dplayer',
    VIDEO: 'video',
    CONTROL_BAR: 'control-bar',
    //进度条
    PROGRESS_BAR: 'progress-bar',
    TIME_BAR: 'time-bar',
    BUFFER_BAR: 'buffer-bar',
    KNOB_BAR: 'knob-bar hidden',
    //声音进度条
    VOLUME_CONTROL_BAR: 'volume-control-bar right-20',
    VOLUME_PROGRESS_BAR: 'volume-progress-bar right-20',
    VOLUME_BAR: 'volume-bar',
    VOLUME_KNOB_BAR: 'volume-knob-bar',
    //设置栏
    DEFINITION_BAR:'definition-bar',
    DEFINITION_LABEL: 'definition-label right-20 ',
    DEFINITION_PANEL:'definition-panel hidden',
    DEFINITION_OPTION:'definition-option',
    DEFINITION_OPTION_SELECTED:'definition-option-selected',
    //控制栏目
    BUTTON_BAR: 'button-bar',
    LEFT_GROUP: 'left-group',
    RIGHT_GROUP: 'right-group',
    ICON_PLAY: 'icon icon-play icon-switch left-20',
    ICON_PAUSE: 'icon icon-pause icon-switch left-20',
    ICON_FORWARD: 'icon icon-step-forward left-20',
    ICON_BACKWARD: 'icon icon-step-backward left-20',
    ICON_FULLSCREEN: 'icon icon-fullscreen right-20 control',
    ICON_EXITFULLSCREEN: 'icon icon-resize-small right-20 control',
    ICON_VOLUME_OFF: 'icon icon-volume icon-volume-off right-20 control',
    ICON_VOLUME_UP: 'icon icon-volume icon-volume-up right-20 control',
    ICON_SETTING: 'icon icon-cog right-20 control',
    LABEL_POSITION: 'label-text left-20 label-position',
    LABEL_SPLITE: 'label-text',
    LABEL_DURATION: 'label-text label-show label-duration',
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
    if (denominator <= 0) {
        return 0;
    } else {
        return (Math.round(numerator / denominator * 10000) / 100.00);
    }
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
        var result = this.runtime.container.querySelector(selector);
        return this.runtime.container.querySelector(selector);
    } else {
        return null;
    }
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
 * 调试函数
 * @param  info 调试信息
 */
Dplayer.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Dplayer【%s】:%o", this.config.id, info);
        } else {
            console.log("Dplayer【%s】:%s", this.config.id, info);
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
            console.error("Dplayer【%s】:%o", this.config.id, info);
        } else {
            console.error("Dplayer【%s】:%s", this.config.id, info);
        }
    } else {
        console.error(info);
    }
    if (this.config.on_error && this.config.on_error instanceof Function) {
        this.config.on_error(info);
    }
}

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
        this.error("事件不支持");
    }
}

/**
 * 代理注册器
 * @param  element    代理元素
 * @param  class_name 类名
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Dplayer.prototype.delegate = function(element, class_name, event_name, fun) {
    if(!element || !element instanceof Element){
        return;
    }
    element.addEventListener(event_name, function(event) {
        if(class_name){
            var target = event.target || event.srcElement;
            if (this.has_class(target, class_name)) {
                fun(event);
            };
        } else {
            fun(event);
        }
    }.bind(this));
}

/**
 * 初始化配置项
 * @param config [配置项]
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
        playlist:[]
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
        this.css_ready(css, this.on_player_css.bind(this));
    } else {
        this.build_player();
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
    this.runtime.video_container = document.createElement("div");
    this.runtime.video_container.className = this._class.VIDEO;
    this.runtime.video_container.style.width = this.config.width + 'px';
    this.runtime.video_container.style.height = this.config.height + 'px';

    this.runtime.video = document.createElement("video");
    this.runtime.video.width = this.config.width;
    this.runtime.video.height = this.config.height;
    if (!this.config.multiple) {
        if(this.config.src instanceof Array){
            var video_src_index = this.get_video_src_index(this.config.src);
            this.runtime.video.src = this.config.src[video_src_index]['url'];
            this.runtime.play_definition = this.config.src[video_src_index]['index'];
        } else {
            this.runtime.video.src = this.config.src;
        }
        if (this.config.thumb) {
            this.runtime.video.poster = this.config.thumb;
        }
    } else {
        this.runtime.video.src = this.runtime.playlist[0].src;
        if (this.runtime.playlist[0].thumb) {
            this.runtime.video.poster = this.runtime.playlist[0].thumb;
        }
    }
    this.runtime.video_container.appendChild(this.runtime.video);
    return this.runtime.video_container;
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
    var progress_control_bar = this.create_element(this._class.PROGRESS_BAR);
    progress_control_bar.setAttribute('draggable','false');
    //缓冲进度条
    progress_control_bar.appendChild(this.create_element(this._class.BUFFER_BAR));
    //播放进度条
    progress_control_bar.appendChild(this.create_element(this._class.TIME_BAR));
    //进度调节器
    progress_control_bar.appendChild(this.create_element(this._class.KNOB_BAR));
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
    left_group.appendChild(this.create_element(this._class.ICON_PLAY));
    if (this.config.multiple) {
        //播放上一节
        left_group.appendChild(this.create_element(this._class.ICON_BACKWARD));
        //播放下一节
        left_group.appendChild(this.create_element(this._class.ICON_FORWARD));
    }
    //当前时间
    left_group.appendChild(this.create_element(this._class.LABEL_POSITION, '00:00:00'));
    //分隔符
    left_group.appendChild(this.create_element(this._class.LABEL_SPLITE, '/'));
    //总时长
    left_group.appendChild(this.create_element(this._class.LABEL_DURATION, '00:00:00'));
    return left_group;
}

/**
 * 构造按钮右区域
 */
Dplayer.prototype.build_button_bar_right = function() {
    var right_group = this.create_element(this._class.RIGHT_GROUP);
    //音量按钮
    right_group.appendChild(this.create_element(this._class.ICON_VOLUME_UP));
    //声音控制条
    right_group.appendChild(this.build_volume_control_bar());
    //清晰度
    if(!this.config.multiple){
        right_group.appendChild(this.build_definition_control_bar(this.config.src)); 
    } else {
        right_group.appendChild(this.build_definition_control_bar(this.config.playlist[0].src)); 
    }
    //设置按钮
    right_group.appendChild(this.create_element(this._class.ICON_SETTING));
    //全屏
    right_group.appendChild(this.create_element(this._class.ICON_FULLSCREEN));
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
    var definition_panel = this.create_element(this._class.DEFINITION_PANEL);

    if(this.config.src instanceof Array){
        for(var i=0;i<src_array.length;i++){
            var definition_option;
            if(src_array[i]['index'] == this.runtime.play_definition){
                definition_option = this.create_element(this._class.DEFINITION_OPTION_SELECTED,src_array[i]['name']);
            } else {
                definition_option = this.create_element(this._class.DEFINITION_OPTION,src_array[i]['name']);
            } 
            definition_option.setAttribute('definition',src_array[i]['index']);       
            if(i == src_array.length - 1){
                this.add_class(definition_option,'definition-option-last');
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
 * 绑定video事件
 * @return {[type]} [description]
 */
Dplayer.prototype.rigester_video_event = function() {
    this.runtime.video.addEventListener('canplay', this.on_video_canplay.bind(this));
    this.runtime.video.addEventListener('progress', this.on_video_progress.bind(this));
    this.runtime.video.addEventListener('play', this.on_video_play.bind(this));
    this.runtime.video.addEventListener('pause', this.on_video_pause.bind(this));
    this.runtime.video.addEventListener('timeupdate', this.on_video_playing.bind(this));
    //坑爹的全屏API
    document.addEventListener('fullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('mozfullscreenchange', this.on_video_fullscreenchange.bind(this));
    document.addEventListener('MSFullscreenChange', this.on_video_fullscreenchange.bind(this));
}

/**
 * 绑定进度条控制区相关事件
 * @return {[type]} [description]
 */
Dplayer.prototype.rigester_progress_event = function() {
    this.delegate(this.query_element('Dplayer'),'', 'mousemove', this.on_progress_on.bind(this));
    this.delegate(this.query_element('control-bar'),'', 'mouseout', this.on_progress_off.bind(this));
    this.delegate(this.query_element('progress-bar'),'', 'mousedown', this.on_progress_select.bind(this));
    this.delegate(this.query_element('progress-bar'),'', 'mouseup', this.on_progress_seek.bind(this));
    //this.delegate(this.query_element('button-bar'),'', 'mouseup', this.on_progress_selected.bind(this));
    this.delegate(this.query_element('Dplayer'),'', 'mouseup', this.on_progress_selected.bind(this));
    document.addEventListener('mouseup', function() {
        this.runtime.progressing = false;
    }.bind(this));
}

/**
 * 绑定按钮区事件
 * @return {[type]} [description]
 */
Dplayer.prototype.rigester_control_event = function() {
    //播放开关
    this.delegate(this.query_element('button-bar'), 'icon-switch', 'mousedown', this.on_control_play.bind(this));
    //播放上一个视频
    this.delegate(this.query_element('button-bar'), 'icon-step-forward', 'mousedown', this.on_control_forward.bind(this));
    //播放下一个视频
    this.delegate(this.query_element('button-bar'), 'icon-step-backward', 'mousedown', this.on_control_backward.bind(this));
    //静音开关
    this.delegate(this.query_element('button-bar'), 'icon-volume', 'mousedown', this.on_control_volume.bind(this));
    //调节音量
    this.delegate(this.query_element('volume-control-bar'),'volume-bar', 'mouseup', this.on_volume_seek.bind(this));
    this.delegate(this.query_element('volume-control-bar'),'volume-progress-bar', 'mouseup', this.on_volume_seek.bind(this));
    //清晰度切换
    this.delegate(this.query_element('definition-bar'),'','mouseover',this.on_definition_on.bind(this));
    this.delegate(this.query_element('definition-bar'),'','mouseout',this.on_definition_off.bind(this));
    this.delegate(this.query_element('definition-bar'),'definition-option','mouseup',this.on_definition_change.bind(this));
    //设置
    this.delegate(this.query_element('button-bar'), 'icon-setting', 'mousedown', this.on_control_setting.bind(this));
    //全屏
    this.delegate(this.query_element('button-bar'), 'icon-fullscreen', 'mousedown', this.on_control_fullscreen.bind(this));
    this.delegate(this.query_element('button-bar'), 'icon-resize-small', 'mousedown', this.on_control_fullscreen.bind(this));
}

/**
 * 视频播放
 */
Dplayer.prototype.play = function() {
    this.runtime.video.play();
    this.runtime.playing = true;
    this.query_element("icon-play").className = this._class.ICON_PAUSE;
}

/**
 * 视频暂停
 */
Dplayer.prototype.pause = function() {
    this.runtime.video.pause();
    this.runtime.playing = false;
    this.query_element("icon-pause").className = this._class.ICON_PLAY;
}

Dplayer.prototype.change_src = function(src,from_begin){
    if(!this.runtime.playing){
        this.runtime.video.src = src;
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
 * 视频进入全屏
 */
Dplayer.prototype.fullscreen = function() {
    if (this.runtime.frame.requestFullscreen) {
        this.runtime.frame.requestFullscreen();
    } else if (this.runtime.frame.mozRequestFullScreen) {
        this.runtime.frame.mozRequestFullScreen();
    } else if (this.runtime.frame.webkitRequestFullscreen) {
        this.runtime.frame.webkitRequestFullscreen();
    } else if (this.runtime.frame.msRequestFullscreen) {
        this.runtime.frame.msRequestFullscreen();
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
    this.query_element("buffer-bar").style.width = percent + "%";
}

/**
 * 视频进度状态变更
 * @param  position 播放秒数
 */
Dplayer.prototype.change_progress = function(position) {
    var duration = parseInt(this.runtime.video.duration);
    var percent = this.format_percent(position, duration);
    var total_width = this.query_element("progress-bar").clientWidth;
    var knob_width = this.query_element("knob-bar").clientWidth;
    var left = (total_width * percent) / 100;
    if (left <= knob_width / 2) {
        this.query_element("knob-bar").style.left = (knob_width / 2) + "px";
    } else if (left >= (total_width - knob_width / 2)) {
        this.query_element("knob-bar").style.left = (total_width - knob_width / 2) + "px";
    } else {
        this.query_element("knob-bar").style.left = percent + "%";
    }
    this.query_element("time-bar").style.width = percent + "%";
}

/**
 * 视频音量变更
 * @param  volume 音量大小
 */
Dplayer.prototype.change_volume = function(volume) {
    this.runtime.video.volume = volume / 100;
    var percent = this.format_percent(volume, 100);
    this.query_element("volume-knob-bar").style.left = percent + "%";
    this.query_element("volume-bar").style.width = percent + "%";
}

/**
 * 皮肤加载完毕回调
 */
Dplayer.prototype.on_player_css = function() {
    this.debug('播放器皮肤加载完毕');
    this.build_player();
}

/**
 * 播放器DOM创建完毕回调
 */
Dplayer.prototype.on_player_build = function() {
    this.debug('播放器初始化完毕');
    //注册video事件
    this.rigester_video_event()
        //注册progress事件
    this.rigester_progress_event()
        //注册control事件
    this.rigester_control_event();
    //执行ready回调
    if (this.on_player_ready && this.on_player_ready instanceof Function) {
        this.on_player_ready();
    }
    if (this.config.autoplay) {
        this.play();
    }
}

/**
 * 视频能够播放状态回调
 */
Dplayer.prototype.on_video_canplay = function(event) {
    var duration = parseInt(this.runtime.video.duration);
    this.query_element("label-duration").innerText = this.format_time(duration);
}

/**
 * 视频缓冲数据回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_progress = function(event) {
    var TimeRanges = this.runtime.video.buffered;
    if (TimeRanges && TimeRanges.length) {
        var bufferd = parseInt(TimeRanges.end(TimeRanges.length - 1));
        this.change_buffer(bufferd);
    }
}

/**
 * 视频播放回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_play = function(event) {
    this.debug('video play');
    if (this.on_player_play && this.on_player_play instanceof Function) {
        this.on_player_play();
    }
}

/**
 * 视频暂停回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_pause = function(event) {
    this.debug('video pause');
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
        this.query_element("label-position").innerText = this.format_time(position);
        this.query_element("label-duration").innerText = this.format_time(duration);     
        this.change_progress(position);
    }
}

/**
 * 视频全屏状态修改回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_fullscreenchange = function(event) {
    if (!this.runtime.fullscreening) {
        var control_bar_height = this.query_element("control-bar").clientHeight;
        var width = 0;
        var height = 0;
        if (document.msRequestFullscreen) {
            width = window.screen.width;
            height = window.screen.height - control_bar_height;
        } else {
            width = window.screen.availWidth;
            height = window.screen.availHeight - control_bar_height;
        }
        this.resize(width, height);
        this.runtime.fullscreening = true;
        this.query_element("icon-fullscreen").className = this._class.ICON_EXITFULLSCREEN;
    } else {
        this.resize(this.config.width, this.config.height);
        this.runtime.fullscreening = false;
        this.query_element("icon-resize-small").className = this._class.ICON_FULLSCREEN;
    }
}

/**
 * 进入进度条回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_progress_on = function(event) {
    var knob_bar = this.query_element("knob-bar");
    this.remove_class(knob_bar, 'hidden');
    if (this.runtime.playing && this.runtime.progressing) {
        var offset = this.get_offset_x(event,this.query_element("control-bar"));
        var total = this.query_element("progress-bar").clientWidth;
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
Dplayer.prototype.on_progress_off = function(event) {
    var knob_bar = this.query_element("knob-bar");
    this.add_class(knob_bar, 'hidden');
}

/**
 * 开始拖动进度条回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_progress_select = function(event) {
    this.runtime.progressing = true;
    //如果不使用preventDefault可能会使得mouseup事件失效。
    event.preventDefault();
}

/**
 * 进度条拖动完毕回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_progress_selected = function(event) {
    if (this.runtime.playing && this.runtime.progressing) {
        this.on_progress_seek(event);
    }
}

/**
 * 调整进度回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_progress_seek = function(event) {
    this.runtime.progressing = false;
    if (this.runtime.playing) {
        var offset = this.get_offset_x(event,this.query_element("control-bar"));
        var total = this.query_element("progress-bar").clientWidth;
        var percent = this.format_percent(offset, total);
        var position = parseInt(this.runtime.video.duration * percent / 100);
        this.runtime.video.currentTime = position;
    }
    return false;
}

/**
 * 调整音量回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_volume_seek = function(event){
    var offset = this.get_offset_x(event,this.query_element("volume-progress-bar"));
    var total = this.query_element("volume-progress-bar").clientWidth;
    var percent = this.format_percent(offset, total);
    this.change_volume(percent);
}

Dplayer.prototype.on_definition_on = function(event){

    this.remove_class(this.query_element("definition-panel"), 'hidden');
}

Dplayer.prototype.on_definition_off = function(event){
    
    this.add_class(this.query_element("definition-panel"), 'hidden');
}

Dplayer.prototype.on_definition_change = function(event){
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
    this.query_element('definition-panel').innerHTML='';
    for(var i=0;i<src_array.length;i++){
        var definition_option;
        if(src_array[i]['index'] == this.runtime.play_definition){
            definition_option = this.create_element(this._class.DEFINITION_OPTION_SELECTED,src_array[i]['name']);
        } else {
            definition_option = this.create_element(this._class.DEFINITION_OPTION,src_array[i]['name']);
        } 
        definition_option.setAttribute('definition',src_array[i]['index']);       
        if(i == src_array.length - 1){
            this.add_class(definition_option,'definition-option-last');
        }    
        this.query_element('definition-panel').appendChild(definition_option);
    }
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
    if(!this.runtime.playing){
        if(this.runtime.playlist[play_index + 1].thumb){
            this.runtime.video.poster = this.runtime.playlist[play_index + 1].thumb;
        } else {
            this.runtime.video.poster = '';
        }
    }
    //获取视频源
    var new_src = this.runtime.playlist[play_index + 1].src;
    if(new_src instanceof Array){
        var index = this.get_video_src_index(new_src);
        var src = new_src[index]['url'];
        this.runtime.play_definition = new_src[index]['index'];
        //重构清晰度选项面板
        this.on_definition_panel_rebuild(new_src);
        //显示清晰度控制按钮
        this.remove_class(this.query_element('definition-bar'),'hidden');        
        //切换播放源
        this.change_src(src,true);

    } else {
        //切换播放源
        this.change_src(new_src,true);
        //隐藏清晰度控制按钮
        this.add_class(this.query_element('definition-bar'),'hidden'); 
    }
    this.runtime.play_index += 1;
}

Dplayer.prototype.on_control_backward = function(event){
    var play_index = this.runtime.play_index;
    if(!this.runtime.playlist[play_index - 1]){
        this.error('不存在上一节');
        return false;
    }
    if(!this.runtime.playing){
        if(this.runtime.playlist[play_index - 1].thumb){
            this.runtime.video.poster = this.runtime.playlist[play_index - 1].thumb;
        } else {
            this.runtime.video.poster = '';
        }
    }
    //获取视频源
    var new_src = this.runtime.playlist[play_index - 1].src;
    if(new_src instanceof Array){
        var index = this.get_video_src_index(new_src);
        var src = new_src[index]['url'];
        this.runtime.play_definition = new_src[index]['index'];
        //重构清晰度选项面板
        this.on_definition_panel_rebuild(new_src);
        //显示清晰度控制按钮
        this.remove_class(this.query_element('definition-bar'),'hidden');        
        //切换播放源
        this.change_src(src,true);
    } else {
        //切换播放源
        this.change_src(new_src,true);
        //隐藏清晰度控制按钮
        this.add_class(this.query_element('definition-bar'),'hidden');   
    }
    this.runtime.play_index -= 1;
}

/**
 * 点击音量按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_volume = function(event) {
    if (this.runtime.video.volume) {
        this.change_volume(0);
        this.query_element("icon-volume-up").className = this._class.ICON_VOLUME_OFF;
    } else {
        this.change_volume(100);
        this.query_element("icon-volume-off").className = this._class.ICON_VOLUME_UP;
    }
}

/**
 * 点击设置按钮回调
 * @param  event 事件对象
 */
Dplayer.prototype.on_control_setting = function(event) {}

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

/**
 * 异步get
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Dplayer.prototype.async_get = function(url, data, callback) {
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
