/**
 * 按钮呼吸
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    }, 

    onLoad () { 
        wheen(this.node).to({scaleX:0.9,scaleY:0.9},1000).setFlag("loop").to({scaleX:1,scaleY:1},1000).to({scaleX:0.9,scaleY:0.9},1000).loop(-1,"loop").start();
    },
 
    onDestroy(){
        Wheen.stop(this.node);
    },

});
