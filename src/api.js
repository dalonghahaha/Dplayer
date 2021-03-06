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