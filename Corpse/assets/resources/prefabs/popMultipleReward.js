 
cc.Class({
    extends: cc.Component,

    properties: {
       titleLab:cc.Label,
       doubleBtn:cc.Node,
       getBtn:cc.Node,
       templet:cc.Node,
    },
    

    setParams(params){
        this.params = params;
    },

    onLoad() {  
        this.getBtn.active = false;
        this.scheduleOnce(this.startClock,_G.AppDef.DELAY_BTN_SHOW_TIME); 
        this.templet.active = true;
        this.templet.find2("numLab",cc.Label).string = "x{0}".format(this.params.num);
        if(this.params.title){
            this.titleLab.string = this.params.title;
        } 
        Utils.loadAsset(this.params.icon,cc.SpriteFrame,(err,sp)=>{
            this.templet.find2("zp_ico_sun",cc.Sprite).spriteFrame = sp;
        });
        SDKMgr.loadExpressAd();
    }, 

    start () {

    },

    startClock(){
        this.getBtn.active = true;
    },
 
    onGetBtn(){
        this.params.callDouble && this.params.call();
        this.closePop();
    },

    onDoubleBtn(){
        let self = this;
        SDKMgr.showRewardVideoAd(function(){
            self.params.callDouble && self.params.callDouble();
            self.closePop();
        },self.params.videoType); 
    },
 
    closePop(){
        PopMgr.closePop("popMultipleReward");
    }, 
    //退出弹窗doing someing
    exitPop(){
        SDKMgr.closeExpressAd();
    }

});
