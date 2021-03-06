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
    //成功获取资源长度
    this.runtime.video.addEventListener('loadedmetadata', this.on_video_event_debug.bind(this));
    //提示当前帧的数据是可用的
    this.runtime.video.addEventListener('loadeddata', this.on_video_event_debug.bind(this));
    //寻找中
    this.runtime.video.addEventListener('seeking', this.on_video_seeking.bind(this));
    //寻找完毕
    this.runtime.video.addEventListener('seeked', this.on_video_seeked.bind(this));
    //播放速率改变
    this.runtime.video.addEventListener("ratechange", this.on_video_event_debug.bind(this));
    //资源长度改变
    this.runtime.video.addEventListener("durationchange", this.on_video_event_debug.bind(this));
    //音量改变
    this.runtime.video.addEventListener("volumechange", this.on_video_event_debug.bind(this));
}

/**
 * 绑定遮罩层事件
 */
Dplayer.prototype.delegate_mask_event = function(){
    this.delegate(this._class.VIDEO_MASK, 'contextmenu', this.on_mask_contextmenu.bind(this));
    this.delegate(this._class.VIDEO_MASK_ABOUT, 'mouseup', this.on_mask_about_click.bind(this));
    this.delegate(this._class.AD_IDLE, 'mouseup', this.on_ad_idle_click.bind(this));
}

/**
 * 绑定按钮区事件
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
    document.addEventListener('keyup',function(event){
        if(event.which == 32){
            this.on_control_play();
        }
    }.bind(this));
}