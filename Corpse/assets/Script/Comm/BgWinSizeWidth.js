cc.Class({
    extends: cc.Component,
    //背景图 脚本 直接设置尺寸
    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.reSize();
    },

    reSize: function () {
    
        var windowSize = cc.winSize;
        this.node.width = windowSize.width/this.node.parent.scaleX;
    },

    onEnable: function () {
        cc.view.on('resize', this.reSize,this);
    },
    
    onDisable: function () {
        cc.view.off('resize', this.reSize,this);
    },
});
