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