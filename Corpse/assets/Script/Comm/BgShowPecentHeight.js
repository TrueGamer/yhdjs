cc.Class({
    extends: cc.Component,
    //背景图 脚本 全部图片全部显示出来
    properties: {
        heightDesign:{ 
            type:cc.Integer,
            default:0,
       },

       winSizeHeight:{ 
        type:cc.Integer,
        default:2436,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.reSize();
    },


    reSize: function () {
        var windowSize = cc.winSize;
        var scaleY = (windowSize.height* (this.heightDesign /this.winSizeHeight) )/this.node.height;

        this.node.scale = scaleY;
    },

    onEnable: function () {
        cc.view.on('resize', this.reSize,this);
    },
    
    onDisable: function () {
        cc.view.off('resize', this.reSize,this);
    },

});
