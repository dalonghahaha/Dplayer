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