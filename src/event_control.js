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
    if(this.config.ad){
        if(!this.runtime.ad_played){
           this.ad_open_play();
        } else{
            if (this.runtime.playing) {
                this.pause();
            } else {
                this.play();
            }
        }
    } else {
        if (this.runtime.playing) {
            this.pause();
        } else {
            this.play();
        }
    }
}

Dplayer.prototype.on_control_forward = function(event){
    if(this.config.ad && !this.runtime.ad_played){
        return false;
    }
    var play_index = this.runtime.play_index;
    if(!this.runtime.playlist[play_index + 1]){
        this.error('不存在下一节');
        return false;
    }
    this.ad_idle_close();
    this.runtime.ad_played = false;
    this.change_play(play_index + 1);
    this.runtime.play_index += 1;
}

Dplayer.prototype.on_control_backward = function(event){
    if(this.config.ad && !this.runtime.ad_played){
        return false;
    }
    var play_index = this.runtime.play_index;
    if(!this.runtime.playlist[play_index - 1]){
        this.error('不存在上一节');
        return false;
    }
    this.ad_idle_close();
    this.runtime.ad_played = false;
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
    this.show_down_message('你他妈的坑爹呢！');
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
    if(this.config.ad && !this.runtime.ad_played){
        return false;
    }
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
    this.debug(this.runtime.ad_played);
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
