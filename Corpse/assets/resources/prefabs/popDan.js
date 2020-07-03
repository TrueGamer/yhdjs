/**
 * 段位弹窗
 */
cc.Class({
    extends: cc.Component,

    properties: {
         powerText:cc.Label,
         recommendLab:cc.Label,
         upBtn:cc.Node,
         downBtn:cc.Node,
    }, 

    setParams(params){
        this.call = params.call;
    },

 
    onLoad () { 
        //如果可以提升 
        let levelTotalExp = _G.CfgMgr.getItem(_G.AppDef.UID + "levelTotalExp") || 0; 
        let rank = _G.IPlayer.getKey("rank");
        let titleInfo = _G.CfgMgr.getConfig("title",rank);
        this.recommendLab.string = Tools.getCompany(titleInfo.power,2);  
        this.powerText.string =Tools.getCompany(  Tools.getPetPower() ,2); 
        if(levelTotalExp <= titleInfo.exp){
             this.upBtn.active = false;
             this.downBtn.position = this.downBtn.position;
        }else{
            let rank = _G.IPlayer.getKey("rank");
            let nextTitle = _G.CfgMgr.getConfig("title",rank+1) 
            if(!nextTitle) {
                this.upBtn.active = false;  
            }else{
                this.upBtn.active = true; 
            } ; 
        }  
    },

    start () {
       if(this.call){
           this.scheduleOnce(this.call,0.2) 
       }
    },

    // update (dt) {},

    onBtnUp(){ 

        let rank = _G.IPlayer.getKey("rank");
        let nextTitle = _G.CfgMgr.getConfig("title",rank+1) 
        if(!nextTitle) return ;
        Utils.http(_G.MESSAGE.SET_DUANWEI,{rank:rank + 1 }); 
    },
    onBtnDown(){ 
        let rank = _G.IPlayer.getKey("rank");
        let nextTitle = _G.CfgMgr.getConfig("title",rank-1) 
        if(!nextTitle) return PopMgr.createTip("当前段位为最低段位") ;
        //TODO 接入sdk
        SDKMgr.showRewardVideoAd(function(){
            Utils.http(_G.MESSAGE.SET_DUANWEI,{rank:rank - 1 });  
        },_G.AppDef.VIDEO_EVENT_TYPE.DWJJ) 
    },
    
    closePop(){
        PopMgr.closePop("popDan");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

});
