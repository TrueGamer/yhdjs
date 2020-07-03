/**
 * 获得红包显示  或者双倍
 */
cc.Class({
    extends: cc.Component,

    properties: {
        currentMoney:cc.Label,
        yueMoneyLab:cc.Label,
        titleLab:cc.Label,
        btnVideo:cc.Node,
        closeBtn:cc.Node,
    }, 

    onLoad () {
        this.isTag = false;
        this.closeBtn.active = false; 
        SDKMgr.loadExpressAd(); 
        this.setInfo();
        this.scheduleOnce(this.startClock,_G.AppDef.DELAY_RED_BTN_SHOW_TIME);
    },

    startClock(){
//        this.closeBtn.active = false;
    },
 
    
    setParams(params){
        this.params = params;
        this.redPackType = params.redPackType  || 2;
        this.title = params.title || "恭喜您获得";
        this.cCall = params.call;  //关闭回调
        this.dbCall = params.dbCall;  //双倍视频回调'
        this.wallet = params.curMoney; //获得金币
        this.umType = params.umType; 
    }, 

    setInfo(){   
        let self = this;
        switch (this.redPackType) {
            case  _G.AppDef.RED_PACK_TYPE.NEW_USER_HB:
                this.btnVideo.active = false;
                this.closeBtn.active = true;
                this.umType = _G.AppDef.VIDEO_EVENT_TYPE.XSHB;
                this.cCall = function(){
                    whevent.event(_G.EVENT.GUIDE_CONTINUE);
                }
                break; 
            case _G.AppDef.RED_PACK_TYPE.OFF_HB: 
                this.dbCall = function(){
                    //双倍离线红包
                    console.log("双倍离线红包")
                    _G.AppDef.offLineIsDouble = true;
                    self.isTag =  true;
                    self.closeBtn.active = true;
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:2,handler: _G.AppDef.RED_PACK_TYPE.OFF_HB ,syncAD:2 } );
                }

                this.cCall = function(){
                    console.log("单倍离线红包")
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:1,handler: _G.AppDef.RED_PACK_TYPE.OFF_HB ,syncAD:1 } );
                } 
                this.umType = _G.AppDef.VIDEO_EVENT_TYPE.HBFB;

                break;
            //升级植物
            case _G.AppDef.RED_PACK_TYPE.UP_LEVEL:
                this.dbCall = function(){ 
                    self.isTag =  true;
                    self.closeBtn.active = true;
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:2,handler: _G.AppDef.RED_PACK_TYPE.UP_LEVEL ,syncAD:2 } );
                }
                this.cCall = function(){ 
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:1,handler: _G.AppDef.RED_PACK_TYPE.UP_LEVEL ,syncAD:1 } );
                } 
                this.umType = _G.AppDef.VIDEO_EVENT_TYPE.HBFB;
                break;

            //任务红包双倍
            case _G.AppDef.RED_PACK_TYPE.TAKS_HB:
                let dbCall = this.dbCall;
                this.dbCall = function(){ 
                    self.isTag =  true;
                    self.closeBtn.active = true;
                    dbCall && dbCall();
                }
                break; 
            
            case _G.AppDef.RED_PACK_TYPE.AD_BOX:
                this.dbCall = function(){ 
                    self.isTag =  true;
                    self.closeBtn.active = true;
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:1,handler: _G.AppDef.RED_PACK_TYPE.AD_BOX ,syncAD:1 } );
                }
                this.umType = _G.AppDef.VIDEO_EVENT_TYPE.HBFB;
                break; 
            
            case _G.AppDef.RED_PACK_TYPE.UNLOCK_PET:
                this.dbCall = function(){ 
                    self.isTag =  true;
                    self.closeBtn.active = true;
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:2,handler: _G.AppDef.RED_PACK_TYPE.UNLOCK_PET ,syncAD:1 } );
                }

                this.cCall = function(){ 
                    Utils.http(_G.MESSAGE.GET_DOUBLE_REDPACK ,{ multi:1,handler: _G.AppDef.RED_PACK_TYPE.UNLOCK_PET } );
                }

                this.umType = _G.AppDef.VIDEO_EVENT_TYPE.HBFB;
                break;

            default:
                break;
        }

        let hongbao = _G.IPlayer.getKey("hongbao"); 
        let pro = _G.CfgMgr.getSysConfig(19);
        let totalMoney = (hongbao.balance + (hongbao.val-this.wallet)/pro) ;
        this.currentMoney.string = "{0}红包".format(this.wallet);
        this.yueMoneyLab.string = "{0}元".format(Tools.getCompany(totalMoney,2));
        if(this.redPackType == _G.AppDef.RED_PACK_TYPE.NEW_USER_HB){
            this.currentMoney.string = "{0}元".format(Tools.getCompany(this.wallet,2)); 
        }
    },

    onBtnVideo(){
        this.closeBtn.active = true;
        SDKMgr.showRewardVideoAd(this.dbCall ,this.umType);
    },
 
    hideDBbtn(){
        if(!this.isTag)return;
        if(!this.node.isValid) return;
        this.btnVideo.active = false;
        let moneyTxt = this.wallet*2 ; 
        if(!this.currentMoney.isValid) return 
        wheen(this.currentMoney).to({string:moneyTxt},500, null,{
            set: v => parseInt(v)+"红包",
            get:v => parseInt(v)
         }).start();

    },
    
    closePop(){
        if(this.currentMoney.isValid){
            Wheen.stop(this.currentMoney);
        } 
        console.log("this.isTag:" + this.isTag);
        if(!this.isTag){
            this.cCall && this.cCall(); 
        }
        PopMgr.closePop("popRedPackRet"); 
    },
    
    //退出弹窗doing someing
    exitPop(){
        SDKMgr.closeExpressAd();  
    }   
});
