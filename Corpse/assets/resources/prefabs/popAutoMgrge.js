 /**
  * 自动合并提示
  */
cc.Class({
    extends: cc.Component,

    properties: {
       tipLab:cc.Label
    },
  
    onLoad () {
        let num = _G.CfgMgr.getSysConfig(21);
        this.tipLab.string = _G.LangMgr.getText(1009).format(num); 
    },

    start () {

    },

    onBtn(){  
        //自动合并 //TODO 限制次数
        SDKMgr.showRewardVideoAd(function(){
            //要打开广告 
            whevent.event(_G.EVENT.AUTO_MERGE);
            PopMgr.closePop("popAutoMerge");
            _G.AppDef.VIDEO_COUNT += 1;
        },_G.AppDef.VIDEO_EVENT_TYPE.ZDHC);    

    },

    
    closePop(){
        PopMgr.closePop("popAutoMerge");
    },
 
    //退出弹窗doing someing
    exitPop(){

    }  


});
