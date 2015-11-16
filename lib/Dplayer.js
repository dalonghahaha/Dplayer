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

Dplayer.prototype._event = [
    'ready',
    'resize',
    'play',
    'pause',
    'switch',
    'complete'
];

Dplayer.prototype._class ={
	BASE:'Dplayer',
    VIDEO:'video',
    CONTROL_BAR:'control-bar',
    PROGRESS_BAR:'progress-bar',
    TIME_BAR:'time-bar',
    BUFFER_BAR:'buffer-bar',
    BUTTON_BAR:'button-bar',
    KNOB_BAR:'knob-bar',
    LEFT_GROUP:'left-group',
    RIGHT_GROUP:'right-group',
    ICON_PLAY:'icon icon-play left-20',
    ICON_PAUSE:'icon icon-pause left-20',
    ICON_FORWARD:'icon icon-step-forward left-20',
    ICON_BACKWARD:'icon icon-step-backward left-20',
    ICON_FULLSCREEN:'icon icon-fullscreen right-20',
    ICON_VOLUME_OFF:'icon icon-volume-off right-20',
    ICON_VOLUME_UP:'icon icon-volume-up right-20',
    ICON_SETTING:'icon icon-cog right-20',
    LABEL_POSITION:'label-text left-20',
    LABEL_SPLITE:'label-text',
    LABEL_DURATION:'label-text label-show',
}

Dplayer.prototype.indexOf = function(array, find) {
    var finder = array.join();
    return finder.indexOf(find) >= 0;
}

Dplayer.prototype.format_time =function(second) {
    var time = [parseInt(second / 60 / 60), parseInt(second / 60 % 60), second % 60].join(":");
    return time.replace(/\b(\d)\b/g, "0$1");
}

Dplayer.prototype.format_percent =function(count,total) {
    if(total <=0){
        return 0;
    } else {
        return (Math.round(count / total * 10000) / 100.00);
    }
}

Dplayer.prototype.get_offset_x =function(event) {
    var target = event.currentTarget;
    var offset = event.clientX - target.getBoundingClientRect().left;
    return parseInt(offset);
}

Dplayer.prototype.get_offset_y =function(event) {
    var target = event.currentTarget;
    var offset = event.clientY - target.getBoundingClientRect().top;
    return parseInt(offset);
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
        width:0,
        //高度
        height:0,
        //播放器ID
        id: null,
        //播放器ID
        autoplay: false,
        //是否多个视频
        multiple: false,
        //视频源
        src:null,
        //封面图
        thumb:null
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
        //video对象
        video:null,
        //控制条
        control:null,
        //正在播放
        playing:false,
        //播放按钮
        icon_play:null,
        //下一节
        icon_forward:null,
        //上一节
        icon_backward:null,
        //音量
        icon_volume:null,
        //设置
        icon_setting:null,
        //全屏
        icon_fullscreen:null,
        //当前时间
        label_position:null,
        //总时长
        label_duration:null
    };

    return runtime;
}

/**
 * 调试函数
 * @param  info [调试信息]
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
 * @param info [错误信息]
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
 * 输出警告信息
 * @param  info [警告信息]
 */
Dplayer.prototype.alert = function(info) {
    if (info instanceof Object) {
        console.warn("Dplayer【%s】:%o", this.config.id, info);
    } else {
        console.warn("Dplayer【%s】:%s", this.config.id, info);
    }
    if (this.config.on_alert && this.config.on_alert instanceof Function) {
        this.config.on_alert(info);
    } else {
        alert(info);
    }
}

/**
 * 事件注册器
 * @return {[type]} [description]
 */
Dplayer.prototype.on = function(evnet_name,fun) {

    if(this.indexOf(this._event,evnet_name)){
        if (fun && fun instanceof Function) {
            this['on_player_'+ evnet_name] = fun;
        } else {
            this.error("注册函数参数错误");
        }
    } else {
        this.error("事件不支持");
    }
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
    if(this.config.theme){
    	var css = this.css_link(this.config.theme);
    	this.css_ready(css,this.on_player_css.bind(this));
    } else {
    	this.build_player();
    }
}

Dplayer.prototype.build_player = function(){
    //初始化容器
    var container = document.getElementById(this.config.container);
    var frame = document.createElement("DIV"); 
    frame.className = this._class.BASE;
    frame.style.width = this.config.width + 'px';
    //初始化video
    var video = this.build_video();
    //初始化控制条
    var control = this.build_control();
    //渲染DOM
    frame.appendChild(video);
    frame.appendChild(control);
    container.appendChild(frame);
    //延迟100毫秒执行on_player_build，确保事件成功注册
    setTimeout(this.on_player_build.bind(this),100);
}

Dplayer.prototype.build_video = function(){
    var video_container = document.createElement("div");
    video_container.className = this._class.VIDEO;
    video_container.style.width = this.config.width + 'px';
    video_container.style.height = this.config.height + 'px';  
    
    this.runtime.video = document.createElement("video");
    this.runtime.video.width = this.config.width;
    this.runtime.video.height = this.config.height;
    if(!this.config.multiple){
        this.runtime.video.src = this.config.src;
        if(this.config.thumb){
            this.runtime.video.poster = this.config.thumb;
        }
    }
    video_container.appendChild(this.runtime.video);
    return video_container;
}

Dplayer.prototype.build_control = function(){
    var control = document.createElement("div");
    control.className=this._class.CONTROL_BAR;  

    var progress_bar = this.build_progress_bar();

    var button_bar = this.build_button_bar();

    control.appendChild(progress_bar);
    control.appendChild(button_bar);
    return control;
}

Dplayer.prototype.build_progress_bar = function(){
    var progress_bar = document.createElement("div");
    progress_bar.className=this._class.PROGRESS_BAR; 

    //缓冲进度条
    var buffer_bar = document.createElement("div");
    buffer_bar.className=this._class.BUFFER_BAR;

    //播放进度条
    var time_bar = document.createElement("div");
    time_bar.className=this._class.TIME_BAR;

    //缓冲进度条
    var knob_bar = document.createElement("div");
    knob_bar.className=this._class.KNOB_BAR;
    
    progress_bar.appendChild(buffer_bar);
    progress_bar.appendChild(time_bar);
    progress_bar.appendChild(knob_bar);

    return progress_bar;
}

Dplayer.prototype.build_button_bar = function(){
    var button_bar = document.createElement("div");
    button_bar.className=this._class.BUTTON_BAR; 

    var button_left_group = document.createElement("div");
    button_left_group.className=this._class.LEFT_GROUP; 

    //播放按钮
    this.runtime.icon_play = document.createElement("i");
    this.runtime.icon_play.className=this._class.ICON_PLAY; 

    //播放上一节
    this.runtime.icon_backward = document.createElement("i");
    this.runtime.icon_backward.className=this._class.ICON_BACKWARD; 

    //播放下一节
    this.runtime.icon_forward = document.createElement("i");
    this.runtime.icon_forward.className=this._class.ICON_FORWARD; 

    //当前时间
    this.runtime.label_position = document.createElement("span");
    this.runtime.label_position.className=this._class.LABEL_POSITION; 
    this.runtime.label_position.innerText='00:00:00'; 
    //当前时间
    this.runtime.label_split = document.createElement("span");
    this.runtime.label_split.className=this._class.LABEL_SPLITE; 
    this.runtime.label_split.innerText='/'; 
    //总时长
    this.runtime.label_duration = document.createElement("span");
    this.runtime.label_duration.className=this._class.LABEL_DURATION; 
    this.runtime.label_duration.innerText='00:00:00'; 

    button_left_group.appendChild(this.runtime.icon_play);
    button_left_group.appendChild(this.runtime.icon_backward);
    button_left_group.appendChild(this.runtime.icon_forward);
    button_left_group.appendChild(this.runtime.label_position);
    button_left_group.appendChild(this.runtime.label_split);
    button_left_group.appendChild(this.runtime.label_duration);

    var button_right_group = document.createElement("div");
    button_right_group.className=this._class.RIGHT_GROUP; 

    //音量
    this.runtime.icon_volume = document.createElement("i");
    this.runtime.icon_volume.className=this._class.ICON_VOLUME_UP; 

    //设置
    this.runtime.icon_setting = document.createElement("i");
    this.runtime.icon_setting.className=this._class.ICON_SETTING; 

    //全屏
    this.runtime.icon_fullscreen = document.createElement("i");
    this.runtime.icon_fullscreen.className=this._class.ICON_FULLSCREEN; 

    button_right_group.appendChild(this.runtime.icon_volume);
    button_right_group.appendChild(this.runtime.icon_setting);
    button_right_group.appendChild(this.runtime.icon_fullscreen);

    button_bar.appendChild(button_left_group);
    button_bar.appendChild(button_right_group);

    return button_bar;
}

Dplayer.prototype.rigester_video_event = function(){
    this.runtime.video.addEventListener('play',this.on_video_play.bind(this));
    this.runtime.video.addEventListener('pause',this.on_video_pause.bind(this));
    this.runtime.video.addEventListener('timeupdate',this.on_video_playing.bind(this));
}

Dplayer.prototype.rigester_control_event = function(){

    this.runtime.icon_play.addEventListener('click',this.on_control_play.bind(this));
}

Dplayer.prototype.play = function(){
    this.runtime.video.play();
    this.debug('播放器播放');
    if(this.on_player_play && this.on_player_play instanceof Function){
        this.on_player_play();
    }
}

Dplayer.prototype.pause = function(){
    this.runtime.video.pause();
    this.debug('播放器暂停');
    if(this.on_player_pause && this.on_player_pause instanceof Function){
        this.on_player_pause();
    }
}

/**
 * 皮肤加载完毕回调
 */
Dplayer.prototype.on_player_css =function(){
    this.debug('播放器皮肤加载完毕');
    this.build_player();
}

/**
 * 播放器DOM创建完毕回调
 */
Dplayer.prototype.on_player_build = function(){
    this.debug('播放器初始化完毕');
    //注册video事件
    this.rigester_video_event()
    //注册control事件
    this.rigester_control_event();
    //执行ready回调
    if(this.on_player_ready && this.on_player_ready instanceof Function){
        this.on_player_ready();
    }
    if(this.config.autoplay){
        this.play();
    }
}

Dplayer.prototype.on_control_play = function(event){
    if(this.runtime.playing){
        this.pause();
    } else {
        this.play();
    }
}

Dplayer.prototype.on_video_play = function(event){
    this.runtime.playing = true;
    this.runtime.icon_play.className = this._class.ICON_PAUSE;
}

Dplayer.prototype.on_video_pause = function(event){
    this.runtime.playing = false;
    this.runtime.icon_play.className = this._class.ICON_PLAY;
}

Dplayer.prototype.on_video_playing = function(event){
    var position = parseInt(this.runtime.video.currentTime);
    var duration = parseInt(this.runtime.video.duration);
    this.runtime.label_position.innerText = this.format_time(position);
    this.runtime.label_duration.innerText = this.format_time(duration);
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
	linkTag.setAttribute('rel','stylesheet');
	linkTag.setAttribute('type','text/css');
	linkTag.href = url; 
    head.appendChild(linkTag); 
    return linkTag;
}

/**
 * css加载判断
 * @param  link     [css链接]
 * @param  callback [回调函数]
 */
Dplayer.prototype.css_ready = function(link,callback) {
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
