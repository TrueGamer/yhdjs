cc.Class({
    extends: cc.Component,
    //背景图 脚本 全部图片全部显示出来
    properties: {
        widthDesign:{ 
            type:cc.Integer,
            default:0,
       },

       winSizeWidth:{ 
        type:cc.Integer,
        default:1126,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.reSize();
    },


    reSize: function () {
        var windowSize = cc.winSize;
        var scaleX = (windowSize.width* (this.widthDesign /this.winSizeWidth) )/this.node.width;
        this.node.scale = scaleX;
    },

    onEnable: function () {
        cc.view.on('resize', this.reSize,this);
    },
    
    onDisable: function () {
        cc.view.off('resize', this.reSize,this);
    },

});
