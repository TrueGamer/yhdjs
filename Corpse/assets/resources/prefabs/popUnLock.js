/**
 * 解锁新植物
 * 解锁奖励规则  客户端展示了界面  看广告给双倍  不看给1倍
 */
cc.Class({
    extends: cc.Component,

    properties: {
         lvLab:cc.Label,
         nameLab:cc.Label,
         lightNode:cc.Node,
         plantImg:cc.Sprite,
         hpPro:cc.ProgressBar,
         ackPro:cc.ProgressBar,
         zuanshiLab:cc.Label,
         videoBtn:cc.Node,
         btn:cc.Node
    },
    
   
    onLoad () {
        this.level = _G.IPlayer.getKey("pet").maxLevel;
        this.isTurn = true;
        this.btn.active = false;
        this.videoBtn.active = true; 
        let config  = _G.CfgMgr.getConfig("plant",this.level); 
        this.lvLab.string = "Lv.{0}".format(this.level);
        this.nameLab.string = config.name;
        let planUrl = "plant/{0}".format(config.unlock);
        Utils.loadAsset(planUrl,cc.SpriteFrame,(err, spriteFrame)=>{
            if(err)return;
            this.plantImg.spriteFrame = spriteFrame;   
        });
        //新手指引期间 不展示
        if(_G.IPlayer.getKey("guide") >= 6){ 
            this.scheduleOnce(()=>{ 
                this.btn.active = true;
            },3)
        }else{
            this.btn.active = true;
            this.videoBtn.active = false; 
        }
        //设置奖励
        let info = _G.CfgMgr.getConfig("petCombineReward",this.level)
        this.zuanshiLab.string = "+{0}".format(info.rmb); 
    },

    start () {
       
    },

    update (dt) {
        if(this.isTurn){
            let rotation= this.lightNode.rotation
            rotation += dt*100;
            if( rotation > 360){
                rotation = 0
            }
            this.lightNode.rotation = rotation;
        } 
    },


    onBtn(){
        this.closePop(); 
    },

    onVideo(){ 
        //TODO 视频 观看奖励  
        SDKMgr.showRewardVideoAd(function(){
            //要打开广告 
            Utils.http(_G.MESSAGE.PET_COMBINE ,{multi:1,syncAD:1});
        },_G.AppDef.VIDEO_EVENT_TYPE.JSZW);   
       
    },
  
    closePop(){ 
        PopMgr.closePop("popUnLock"); 

        //新手直接舍去解锁红包处理
        if(_G.IPlayer.getKey("guide") >= 6){
            let pet = _G.IPlayer.getKey("pet");
            let maxLevel = pet.maxLevel; 
            let config = _G.CfgMgr.getConfig("petCombineReward",maxLevel);   
            PopMgr.createPop("popRedPack",{num:config.hb,title:"解锁红包",redPackType:_G.AppDef.RED_PACK_TYPE.UNLOCK_PET});    
        }
    },
 
    //退出弹窗doing someing
    exitPop(){
 
    }  

});
