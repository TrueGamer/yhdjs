cc.Class({
    extends: cc.Component,
    //背景图 脚本 全部图片全部显示出来
    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.reSize();
    },


    reSize: function () {
        var windowSize = cc.winSize;
        var scaleX = windowSize.width/this.node.width;
        var scaleY = windowSize.height/this.node.height;
        var scale = scaleX < scaleY ? scaleX : scaleY;

        this.node.scale = scale;
    },

    onEnable: function () {
        cc.view.on('resize', this.reSize,this);
    },
    
    onDisable: function () {
        cc.view.off('resize', this.reSize,this);
    },

});
