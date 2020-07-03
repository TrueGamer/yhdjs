/**
 * 免费宝箱
 */
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

    onLoad () { 
        this.getBtn.active = false;
        this.scheduleOnce(this.startClock,_G.AppDef.DELAY_BTN_SHOW_TIME); 
        this.templet.active = true;
        this.templet.find2("numLab",cc.Label).string = "x{0}".format(this.params.num);
        if(this.params.title){
            this.titleLab.string = this.params.title ;
        }
        this.templet.scale = 1.5;
        Utils.loadAsset(this.params.icon,cc.SpriteFrame,(err,sp)=>{
            this.templet.find2("zp_ico_sun",cc.Sprite).spriteFrame = sp;
        })  
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
        },_G.AppDef.VIDEO_EVENT_TYPE.BX); 
    },
 
    closePop(){
        PopMgr.closePop("popBox");
    },
 
    //退出弹窗doing someing
    exitPop(){

    } 
});
