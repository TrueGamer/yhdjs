/**
 * Tip 提示
 */ 
 
cc.Class({
    extends: cc.Component,

    properties: {
        lb_txt:cc.Label
    },
    init(txt){ 
        this.lb_txt.string = txt;
        wheen(this.node).to({y:this.node.y + 300},1000).on("finish",()=>{
            if(this.node.isValid){
                PopMgr.closeTip(this.node);
            }
        }).start(); 
    }
});
