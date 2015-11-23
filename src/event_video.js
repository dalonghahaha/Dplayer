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
    this.ad_idle_close();
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
    this.ad_idle_show();
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
 * 正在寻求进度加载中
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_seeking = function(event) {
    this.debug('视频正在寻求进度');
    this.show_down_message('正在切换......');
}

/**
 * 正在寻求进度加载完毕
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_seeked = function(event) {
    this.debug('视频正在寻求进度加载完毕');
    this.close_down_message();
}

/**
 * 视频事件调试函数
 * @param  event 事件对象
 */
Dplayer.prototype.on_video_event_debug = function(event){
    this.debug(event.type);
}