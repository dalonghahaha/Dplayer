/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Dplayer.prototype.create_element = function(class_name, inner_text, animated) {
    var element = document.createElement('div');
    if(class_name instanceof Array){
        element.className = class_name.join(' ');
    } else {
        element.className = class_name;
    }
    if (inner_text) {
        element.innerText = inner_text;
    }
    if(animated) {
        element.className = element.className + ' ' + this._animate.BASE;
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
 */
Dplayer.prototype.build_video_mask = function() {
    var video_mask = this.create_element(this._class.VIDEO_MASK);
    if(this.config.ad && this.config.ad.open){
        //片头广告
        video_mask.appendChild(this.build_video_ad_openning());
    }
     if(this.config.ad && this.config.ad.idle){
        //片头广告
        video_mask.appendChild(this.build_video_ad_idle());
    }
    //右键菜单
    video_mask.appendChild(this.build_mask_context_menu());
    //底部消息
    video_mask.appendChild(this.build_mask_down_message());
    return video_mask; 
}

/**
 * 构造片头广告
 */
Dplayer.prototype.build_video_ad_openning = function(){
    var ad_openning = this.create_element([this._class.AD_OPERNING,this._class.HIDDEN]);
    //var ad_openning = this.create_element([this._class.AD_OPERNING]);
    var ad_countdown = this.create_element(this._class.AD_COUNTDOWN);

    ad_countdown.appendChild(this.create_element(this._class.AD_COUNTDOWN_TEXT,'广告剩余：'));
    ad_countdown.appendChild(this.create_element(this._class.AD_COUNTDOWN_WARN,this.config.ad.open.time));
    ad_countdown.appendChild(this.create_element(this._class.AD_COUNTDOWN_TEXT,'秒'));

    ad_openning.appendChild(ad_countdown);

    if(this.config.ad.open.type == 'video'){
        this.runtime.ad_openning = document.createElement("video");
        this.runtime.ad_openning.width = this.config.width;
        this.runtime.ad_openning.height = this.config.height;
        this.runtime.ad_openning.src = this.config.ad.open.url;
        ad_openning.appendChild(this.runtime.ad_openning);
    }
    return ad_openning;
}

/**
 * 构造空闲广告
 */
Dplayer.prototype.build_video_ad_idle = function(){
    var ad_idle = this.create_element([this._class.AD_IDLE,this._class.HIDDEN],null,true);
    ad_idle.style.width = this.config.ad.idle.width + 'px';
    ad_idle.style.height = this.config.ad.idle.height + 'px';
    ad_idle.style.left = (this.config.width - this.config.ad.idle.width) / 2 + 'px';
    ad_idle.style.top = (this.config.height - this.config.ad.idle.height) / 2 + 'px';
    return ad_idle;
}

/**
 * 构造右键菜单
 * @return {[type]} [description]
 */
Dplayer.prototype.build_mask_context_menu = function(){
    var mask_context_menu = this.create_element([this._class.VIDEO_MASK_ABOUT,this._class.HIDDEN]);

    var about_name = this.create_element(this._class.VIDEO_MASK_TEXT,'名称:Dplayer');
    about_name.setAttribute('action','http://www.Dplayer.com');
    mask_context_menu.appendChild(about_name);

    var about_version = this.create_element(this._class.VIDEO_MASK_TEXT,'版本:1.0.0');
    about_version.setAttribute('action','http://www.Dplayer.com');
    mask_context_menu.appendChild(about_version);

    var about_author = this.create_element(this._class.VIDEO_MASK_TEXT,'作者:龙翔云际');
    about_author.setAttribute('action','http://dalong.me');
    mask_context_menu.appendChild(about_author);

    if(this.config.about && this.config.about.length){
        for(var i=0;i<this.config.about.length;i++){
            var about = this.create_element(this._class.VIDEO_MASK_TEXT,this.config.about[i].text);
            about.setAttribute('action',this.config.about[i].link);
            mask_context_menu.appendChild(about);
        }
    }

    return mask_context_menu;
}

Dplayer.prototype.build_mask_down_message = function(){
    var mask_down_message = this.create_element([this._class.DOWN_MESSAGE,this._class.HIDDEN]);

    mask_down_message.appendChild(this.create_element([this._class.ICON_BASE,this._class.DOWN_MESSAGE_ICON_BASE]));

    mask_down_message.appendChild(this.create_element(this._class.DOWN_MESSAGE_TEXT));

    return mask_down_message;
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
        this.on_control_play();
    }
}