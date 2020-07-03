/**
 * 加速动画
 */
cc.Class({
    extends: cc.Component,

    properties: {
        bg:cc.Node,
        spped:cc.Node,
    },
    
    setParams(params){
        this.call = params.call;

    },

    onLoad () {
        this.bg.opacity = 0;
        this.spped.x = -cc.winSize.width;
        _G.AudioMgr.playBgmLoading("BG2");
    },
    start () {
        wheen(this.bg).to({opacity:200},300).wait(800).to({opacity:0},300).start();
        wheen(this.spped).to({x:0},300).wait(800).to({x:cc.winSize.width},300).on("finish",()=>{
            this.closePop(); 
            this.call && this.call(); 
        }).start();
    },

    closePop(){
        PopMgr.closePop("popSpeedMc"); 
    },
 
    //退出弹窗doing someing
    exitPop(){  
        
    }   

    // update (dt) {},
});
