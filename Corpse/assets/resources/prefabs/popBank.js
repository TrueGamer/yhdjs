/**
 * 存钱罐
 */
cc.Class({
    extends: cc.Component,

    properties: {
       moneyLab:cc.Label,
       pro:cc.ProgressBar,
       lightNode:cc.Node, 
       multipleBtn:cc.Node,
       getBtn:cc.Node,
       numLab:cc.Label,
       isTurn:{
           default:false,
           visible:false,
       }
    },
 
    onLoad () {
        this.isTurn = false;
    },

    start () {
       this.updateUI();
    },

    update (dt) {
        if(this.isTurn){
            this.lightNode.rotation += dt;
        }  
    },

    /**
     * 刷新界面
     */
    updateUI(){
        let exp =_G.IPlayer.getKey("moneyBox"); ;
        this.moneyLab.string = Tools.getCompany(exp,2);  //_G.IPlayer.getKey("")
        let rankID = _G.IPlayer.getKey("rank");
        let titleInfo = _G.CfgMgr.getConfig("title",rankID);  
        let pro = exp / titleInfo.bankExp;
        this.numLab.string = titleInfo.bankUse;

        this.pro.progress = pro > 1 ? 1 : pro;
        if(exp > titleInfo.bankExp){
            this.isTurn = true;
        }  
        if(exp == 0 ){
            this.multipleBtn.active = false;
            this.getBtn.active = false;
            return;
        } 
    }, 

    /**
     * 多倍领取
     */
    onMultipleGet(){
        //TODO 暫未開通
        SDKMgr.showRewardVideoAd(function(){
            //要打开广告
            Utils.http(_G.MESSAGE.GET_BANK,{rate:3,syncAD:1});
            whevent.event(_G.EVENT.CHECK_RED_DOT);
        },_G.AppDef.VIDEO_EVENT_TYPE.CQG);   
    },
    
    /**
     * 领取
     */
    onGet(){
        let rate = 1;
        Utils.http(_G.MESSAGE.GET_BANK,{rate:rate});
        whevent.event(_G.EVENT.CHECK_RED_DOT);
    },

    closePop(){
        PopMgr.closePop("popBank");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  



});
