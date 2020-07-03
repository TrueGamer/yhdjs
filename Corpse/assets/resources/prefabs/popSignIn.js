/**
 * 签到
 */
cc.Class({
    extends: cc.Component,

    properties: {
         DouleBtn:cc.Node,
         signInBtn:cc.Node,
         templetNode:cc.Node,
         content:cc.Node,
         desLab:cc.Node,
    },
 
    onLoad () { 
        this.desLab.active = false;
        this.selectIndex = 0;
        this.signInBtn.active = false;
        this.DouleBtn.active = false; 
    },

    start () { 
        this.setInfo();
    },

    setInfo(){
        this.unschedule(this.startClock);
        var signIn = _G.IPlayer.getKey("signIn"); 
        var siginDay = signIn.timer == 0? 0 : signIn.timer % 7;
        var config = _G.CfgMgr.getConfigs("checkIn"); 
        var reset = _G.CfgMgr.getSysConfig(1); 
        var isKuaDay =  Utils.checkOtherDay(signIn.lastTime, Tools.getTime() ,reset ) 
        this.content.removeAllChildren();
        for (var index = 1; index <= 7; index++) {
            var cf = config[index]
            if(!cf) continue;
            var box = cc.instantiate(this.templetNode);
            if(index <= 6){
                box = cc.instantiate(this.templetNode);
                box.parent =  this.content;
                box.active = true
            }else{
                box = this.node.find("kuang/serverDay");
            }
            box.find("today").active = false;
            cc.setText(box.find("dayLab"),index);  
            //道具图标
            let itemSp = box.find2("taiyang",cc.Sprite)
            Utils.loadAsset(cf.icon,cc.SpriteFrame,(err, spriteFrame)=>{
                if(err)return;
                itemSp.spriteFrame = spriteFrame;
            });
            cc.setText(box.find("numLab"),cf.count);
            
            if(siginDay > (index-1)){
                box.find("zhezhao").active = true;  
                continue;
            } 
            if(isKuaDay && (siginDay+1) == index){ 
                this.selectIndex = index; 
                box.find("today").active = true;
            }
        }  
         
        if(isKuaDay == false){
            this.DouleBtn.active = false;  
            this.desLab.active = true;
            this.signInBtn.active = false;
        }else{
            this.DouleBtn.active = true;
            this.scheduleOnce(this.startClock ,_G.AppDef.DELAY_BTN_SHOW_TIME)
        }  
    },

    startClock(){
        this.signInBtn.active = true;
    },

    onUpdateUI(){ 
        this.setInfo();
    },


    onGet(){
        Utils.http(_G.MESSAGE.SIGNIN,{multi:1}); 
        //this.closePop();
    },
    
    onMultipleGet(){
        //TODO 视频二倍  
        SDKMgr.showRewardVideoAd(function(){
            Utils.http(_G.MESSAGE.SIGNIN,{multi:2,syncAD:1}); 
        },_G.AppDef.VIDEO_EVENT_TYPE.QD);
    },


    closePop(){
        PopMgr.closePop("popSignIn");
    },
 
    //退出弹窗doing someing
    exitPop(){ 
        whevent.event(_G.EVENT.CHECK_RED_DOT);
    }  

    // update (dt) {},
});
