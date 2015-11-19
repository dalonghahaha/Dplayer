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

        //表单初始化
        //this.init();
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