/**
 * 获得免费钻石
 */
cc.Class({
    extends: cc.Component,

    properties: {
        lb_num:cc.Label,
        videoBtn:cc.Node,
    },
 
    onLoad () {
        this.onUpdateInfo();  
    },

    onUpdateInfo(){

        let freeZS = _G.CfgMgr.getConfigs("freeZS");
        let maxLen = Object.keys(freeZS).length; 
        let count = _G.IPlayer.getKey("freeDiamondNum");
        this.isCan == maxLen == count;
        let config = _G.CfgMgr.getConfig("freeZS",count+1)
        this.id = count+1;
        if(!config){ 
            config = _G.CfgMgr.getConfig("freeZS",count)
            this.id = count
        }

        let num = 0;
        for (const key in config.reward) {
             num = config.reward[key];   
        }
        this.lb_num.string = num
    }, 
 
    onBtn(){ 
        if(this.isCan){
            PopMgr.createTip(1015);
            return;
        }   

        let freeZS = _G.CfgMgr.getConfigs("freeZS");
        let maxLen = Object.keys(freeZS).length; 
        let count = _G.IPlayer.getKey("freeDiamondNum");

        if(count >= maxLen  ){
            PopMgr.createTip(1018);
            return;
        }

        let call = function(id){
            Utils.http(_G.MESSAGE.FREE_VIDEO_ZUANSHI,{syncAD:1,id:id,syncAD:1});  
            PopMgr.closePop("popFreeZuanShi");  
        }.bind(this,this.id);

        SDKMgr.showRewardVideoAd(call,_G.AppDef.VIDEO_EVENT_TYPE.MFZS);   
    },

   
    closePop(){
        PopMgr.closePop("popFreeZuanShi"); 
    },
 
    //退出弹窗doing someing
    exitPop(){
        whevent.event(_G.EVENT.CHECK_RED_DOT);
    }  

});
