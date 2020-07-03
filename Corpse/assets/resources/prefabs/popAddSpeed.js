/**
 * 加速
 */
cc.Class({
    extends: cc.Component,

    properties: {
        timeLab:cc.Label,
        pro:cc.ProgressBar,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //單機加速 
        this.pro.progress = 0; 
    },


    onBtn(){ 
        if(_G.AppDef.ADD_SPEED_TIME > 0){
            PopMgr.createTip(1019);
            return
        }
        //自动合并 //TODO 限制次数
        SDKMgr.showRewardVideoAd(function(){
            //要打开广告
            PopMgr.closePop("popAddSpeed");
            _G.AppDef.ADDSPEED_COUNT += 1;
            _G.AppDef.VIDEO_COUNT += 1;
            PopMgr.createPop("popSpeedMc",{call:()=>{ 
                _G.AppDef.ADD_SPEED_TIME = _G.CfgMgr.getSysConfig(18); //秒 
            }});
        },_G.AppDef.VIDEO_EVENT_TYPE.JS);
    },

    closePop(){
        PopMgr.closePop("popAddSpeed");
    },
 
    //退出弹窗doing someing
    exitPop(){

 
    },

    update (dt) { 
        if(_G.AppDef.ADD_SPEED_TIME > 0){
            this.timeLab.string ="剩余时间: {0}".format(Tools.addPreZero(_G.AppDef.ADD_SPEED_TIME))
        }else{
            this.timeLab.string ="剩余时间: {0}".format("00:00")
        }

        if(_G.AppDef.ADD_SPEED_TIME > 0){
            this.pro.progress = _G.AppDef.ADD_SPEED_TIME / _G.CfgMgr.getSysConfig(18)
        }else{
            this.pro.progress = 0;
        }  
    },
});
