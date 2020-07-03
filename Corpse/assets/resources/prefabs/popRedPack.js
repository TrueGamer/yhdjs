/**
 * 红包w·allet
 * 
 * 
 * RedPackType:{
 * 1:新手红包
 * 2:普通一般红包
 * }
 * 
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {
        rickTxt:cc.RichText,
        titleLab:cc.Label,
        txt:cc.Node,
        closeBtn:cc.Node
         
    }, 


    setParams(params){
        this.params = params;
        this.redPackType = params.redPackType  || 2;
        this.title = params.title || "过关红包";
        this.call = params.call;
        this.openCall = params.openCall;
        this.redPackNum = params.num || 0;
    },

    startClock(){
        if(this.redPackType == _G.AppDef.RED_PACK_TYPE.AD_BOX ){
            this.closeBtn.active = false;
        }
        else if(this.redPackType == _G.AppDef.RED_PACK_TYPE.UNLOCK_PET ){
            this.closeBtn.active = false;
        }
        else if (this.redPackType == _G.AppDef.RED_PACK_TYPE.UP_LEVEL){
            this.closeBtn.active = false;
        }
        else{
            this.closeBtn.active = true;
        }
    },
    
    onLoad () {
        this.closeBtn.active = false;
        this.scheduleOnce(this.startClock,_G.AppDef.DELAY_RED_BTN_SHOW_TIME);
        let count  = 0;
        this.titleLab.string = this.title; 
        switch (this.redPackType) {
            case _G.AppDef.RED_PACK_TYPE.UNLOCK_PET:
                this.closeBtn.active = false;
                this.closeBtn.active = false;
                this.rickTxt.string = " ";
                break;
            case  _G.AppDef.RED_PACK_TYPE.NEW_USER_HB :
                this.rickTxt.string = " "; 
                this.txt.active = false;
                this.closeBtn.active = false;
                this.unschedule(this.startClock);
                break;
            case _G.AppDef.RED_PACK_TYPE.OFF_HB:

                break;
            case _G.AppDef.RED_PACK_TYPE.AD_BOX:
                this.closeBtn.active = false;
                let hongbao = _G.IPlayer.getKey("hongbao");
                count =  _G.CfgMgr.getSysConfig(30) - hongbao.adBoxHbTime;   
                this.rickTxt.string = "<color=#742020 ><b>今日剩余</b></color><color=#F6EE96> {0} </color><color=#742020>次广告</color>".format(count); 
                break;
            case _G.AppDef.RED_PACK_TYPE.UP_LEVEL:
                this.closeBtn.active = false;
                let hongbao2 =_G.IPlayer.getKey("hongbao");
                count = _G.CfgMgr.getSysConfig(29) - hongbao2.upLevelHbTime;   
                this.rickTxt.string = "<color=#742020 ><b>今日剩余</b></color><color=#F6EE96> {0} </color><color=#742020>次广告</color>".format(count); 
                break;
            default:
                count = 0;
                this.rickTxt.string = "<color=#742020 ><b>今日剩余</b></color><color=#F6EE96> {0} </color><color=#742020>次广告</color>".format(count);
                break;
        }

        
    },
 
    onBtnVideo(){  
        let self = this;
        switch (this.redPackType) {
            case _G.AppDef.RED_PACK_TYPE.NEW_USER_HB:
                Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:1,handler: _G.AppDef.RED_PACK_TYPE.NEW_USER_HB } );
                break;
            case _G.AppDef.RED_PACK_TYPE.OFF_HB:
                SDKMgr.showRewardVideoAd(()=>{
                    PopMgr.closePop("popRedPack");
                    let num = _G.AppDef.offLineHb; 
                    PopMgr.createPop("popRedPackRet",{curMoney:num,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.OFF_HB});
                    _G.AppDef.offLineHb = 0;
                },_G.AppDef.VIDEO_EVENT_TYPE.LXJL); 
                break;
            case _G.AppDef.RED_PACK_TYPE.UNLOCK_PET:
                SDKMgr.showRewardVideoAd(()=>{
                    PopMgr.closePop("popRedPack");
                    PopMgr.createPop("popRedPackRet",{curMoney:self.redPackNum,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.UNLOCK_PET});  
                },_G.AppDef.VIDEO_EVENT_TYPE.JSZW);
                break;
            case _G.AppDef.RED_PACK_TYPE.AD_BOX:
                SDKMgr.showRewardVideoAd(()=>{
                    PopMgr.closePop("popRedPack");
                    self.openCall && self.openCall();
                },_G.AppDef.VIDEO_EVENT_TYPE.BX);
                break;  
            case _G.AppDef.RED_PACK_TYPE.UP_LEVEL:
                SDKMgr.showRewardVideoAd(()=>{ 
                    PopMgr.closePop("popRedPack");
                    let hongbao= _G.IPlayer.getKey("hongbao");
                    PopMgr.createPop("popRedPackRet",{curMoney:hongbao.upLevelHb,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.UP_LEVEL}); 
                },_G.AppDef.VIDEO_EVENT_TYPE.SJZW); 
                break;
            default:
                break;
        }
 

    },
    
    closePop(){
        PopMgr.closePop("popRedPack");
        this.unschedule(this.startClock);
        //如果是新手红包类型
        if( _G.AppDef.RED_PACK_TYPE.NEW_USER_HB  == this.redPackType){
            whevent.event(_G.EVENT.GUIDE_CONTINUE);
        }
        
        if(this.call){
            this.call();
        }
    },
    
    //退出弹窗doing someing
    exitPop(){

    }  


});
