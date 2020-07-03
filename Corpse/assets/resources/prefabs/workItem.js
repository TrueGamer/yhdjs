/**
 * 任务组件
 */
cc.Class({
    extends: cc.Component,

    properties: {
        nameLab:cc.Label,   
        descLab:cc.Label,
        timeLab:cc.Label,
        btnSucc:cc.Node,
        btnGoto:cc.Node,
        btnWait:cc.Node,
        itemNode:cc.Sprite, 
    },
    
    onLoad(){
        whevent.on(_G.EVENT.UPDATE_WORK_STATE,this.onUpdateItem,this); 
        this.btnSucc.active = false;
        this.btnGoto.active = false;
        this.btnWait.active = false;

    },


    onUpdateItem(){ 
        this.setInfo(this.data,this.id) 
    },
    
    setInfo(data,index){  
        if(!data) return;
        this.id = data.id; 
        this.data = data;
        let work = _G.IPlayer.getKey("work");  
        if(work.id  == this.id){
            let endTime = work.startTime + data.time;
            let curtime = Tools.getTime();
            let lastTime = (endTime - curtime ) > 0  ? endTime - curtime : 0 ;
            if(lastTime <= 0){
                this.btnGoto.active = false;
                this.btnSucc.active = true;
            }else{
                this.btnWait.active = true; 
            } 
        }else{
            this.btnGoto.active = true;
            this.btnSucc.active = false;
        }
        this.nameLab.string = data.name; 
 
        this.timeLab.string = _G.LangMgr.getText(1013).format(Math.floor(data.time/60%60));
        Utils.loadAsset(data.icon,cc.SpriteFrame,(err,spriteFrame)=>{ 
            this.itemNode.spriteFrame = spriteFrame;
        });  
        let itemId,num;
        for (const key in data.reward) { 
            num = data.reward[key];
            itemId = key; 
            break;
        }  
        let itemInfo = _G.CfgMgr.getConfig("item",itemId); 
        if(data.rewardTyp == 1){
            var pet = _G.IPlayer.getKey("pet");
            var configs = _G.CfgMgr.getConfigs("petMoneyShop")
            var maxCombineLv = pet.maxLevel;
            let lv = 1;
            if(maxCombineLv > _G.AppDef.BUY_LIMIT_PET){
                lv = maxCombineLv - _G.AppDef.BUY_LIMIT_PET ;  
            } 
            let config = configs[lv];
            let buyNum = _G.IPlayer.getMoneyBuyRecord(lv)
            let salePrice  = 0
            if(buyNum <= 1){
                salePrice = Math.round(config.a); 
            }else{
                salePrice = Math.round( config.a * Math.pow(config.b,buyNum) )
            } 
            num = salePrice*num; 
        }  
        let totalNum = num;
        if(data.rewardTyp == 1){
            totalNum = Tools.getCompany(num,2)
        }
        this.num = totalNum;
        this.url = itemInfo.icon;
        this.descLab.string =  data.desc.format(totalNum,itemInfo.name) 
    },

    onBtnSucc(){
      //获取奖励 
      let self = this;
      PopMgr.createPop("popMultipleReward",{
          callDouble:function(){
              Utils.http(_G.MESSAGE.GET_WORK_REWARD,{multi:2,syncAD:1});
          },
          call:function(){
             Utils.http(_G.MESSAGE.GET_WORK_REWARD,{multi:1});
          },
          icon:self.url,
          num: self.num,
          videoType:_G.AppDef.VIDEO_EVENT_TYPE.GZ
      })

    }, 
 
    onGotoBtn(){
        //开始工作
        Utils.http(_G.MESSAGE.START_WORK,{id:this.id});
    },

    onDestroy(){ 
        whevent.off(_G.EVENT.UPDATE_WORK_STATE,this.onUpdateItem,this); 
    }
  
});
