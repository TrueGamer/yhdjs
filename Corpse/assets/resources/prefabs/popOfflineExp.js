/**
 * 离线经验
 */
cc.Class({
    extends: cc.Component,

    properties: {
       sunNode:cc.Node,
       labNum:cc.Label,
       multipleBtn:cc.Node,
       btn:cc.Node, 
    },
  
    onLoad () {
        this.btn.active = false; 
        this.labNum.string = "x{0}".format( Tools.getCompany( _G.AppDef.offLineExp ));
        this.scheduleOnce(this.showBtn,_G.AppDef.DELAY_BTN_SHOW_TIME);
        _G.AppDef.offLineExp  = 0;
    },

    showBtn(){
        this.btn.active = true;
    },
 
    onMultipleBtn(){ 
         //TODO 视频三倍  附加的2倍  login同步了一倍
         let self = this;
         SDKMgr.showRewardVideoAd(function(){
            Utils.http(_G.MESSAGE.GET_OFFLINE_MULT,{multi:2,syncAD:1}); 
            self.closePop();
        },_G.AppDef.VIDEO_EVENT_TYPE.LXJL);  
    },

    onGet(){  
        this.closePop(); 
    },

    closePop(){
        PopMgr.closePop("popOfflineExp");
        whevent.event(_G.EVENT.PLAY_OFFLINE_MC);
    },
 
    //退出弹窗doing someing
    exitPop(){
        //红包的
        if(_G.AppDef.offLineHb > 0 ){ 
            PopMgr.createPop("popRedPack",{title:"离线红包",redPackType:_G.AppDef.RED_PACK_TYPE.OFF_HB}); 
        } 
    }  


    // update (dt) {},
});
