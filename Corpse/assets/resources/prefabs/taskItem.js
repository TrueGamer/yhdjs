/**
 * 任务组件
 */
cc.Class({
    extends: cc.Component,

    properties: {
        nameLab:cc.Label, 
        pro:cc.ProgressBar,
        proText:cc.Label,
        reward:cc.Node,
        btn:cc.Node,
        itemNode:cc.Sprite,
        btnIndex:{
            default:0, 
            type:cc.Integer,
            notify(){
               this.setBtn();
            }
        }
    },
    
    onLoad(){},
    
    setInfo(data,index){ 
        this.id = data.id;
        this.btn.find("bth_zi_d").active = false;
        let dailyTask = _G.IPlayer.getKey("dailyTask");
        let dailyTaskRecord = _G.IPlayer.getKey("dailyTaskRecord"); 
        var info = dailyTaskRecord[data.id];
        let pro = dailyTask[data.typ] || 0;  
        if(typeof(pro) == "object"){
            if(data.typ == 6){
               pro =  pro[data.param.level] || 0;
            }
        } 
        if(info.state == 3){
            pro = data.limit; 
            this.btnIndex = 2;
            this.btn.getComponent(cc.Button).interactable = false;
        }else if(info.state == 2){
            pro = data.limit; 
            this.btnIndex = 0; 
            this.btn.find("bth_zi_d").active = true;
            this.btn.getComponent(cc.Button).interactable = true;
        }else{ 
            this.btn.getComponent(cc.Button).interactable = false;
            this.btnIndex = 1;
        }

        this.nameLab.string = data.name; 
        this.pro.progress = pro / data.limit;
        this.proText.string = "{0}/{1}".format(pro,data.limit);
        

        //TODO 奖励
        let itemId,num;
        for (const key in data.reward) { 
            num = data.reward[key];
            itemId = key; 
            break;
        }  
        let itemInfo = _G.CfgMgr.getConfig("item",itemId); 
        this.itemId = itemId;
        Utils.loadAsset(itemInfo.icon,cc.SpriteFrame,(err,sp)=>{
            this.reward.getComponent(cc.Sprite).spriteFrame = sp;
        }) 
        
        Utils.loadAsset(itemInfo.icon,cc.SpriteFrame,(err,spriteFrame)=>{ 
            this.itemNode.spriteFrame = spriteFrame;
        });
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
        this.url = itemInfo.icon;
        this.numEx = num;
        this.num = Tools.getCompany(num,2);
        cc.setText(this.reward.find("lab_num"),Tools.getCompany(num,2));  
    },

    setBtn(){    
        this.btn.getComponent("SpriteEx").index = this.btnIndex;
    }, 
 
    onBtn(){  
        let self = this;
        //道具类型为红包的需要单独处理成功红包弹窗
        if(this.itemId == _G.AppDef.RED_PACK_ID){  
            let dbCall = ()=>{
                Utils.http(_G.MESSAGE.DAILYTASK,{id:self.id,multi:2,syncAD:1});
            } 
            let call = ()=>{
                Utils.http(_G.MESSAGE.DAILYTASK,{id:self.id,multi:1}); 
            } 
            PopMgr.createPop("popRedPackRet",{
                curMoney: Tools.getCompany(this.numEx ,0),
                title:"恭喜获得",
                umType : _G.AppDef.VIDEO_EVENT_TYPE.MRRW,
                redPackType:_G.AppDef.RED_PACK_TYPE.TAKS_HB,
                dbCall:dbCall,
                call:call
            });
        }else{
            PopMgr.createPop("popMultipleReward",{
                callDouble:function(){
                    Utils.http(_G.MESSAGE.DAILYTASK,{id:self.id,multi:2,syncAD:1});
                },
                call:function(){
                    Utils.http(_G.MESSAGE.DAILYTASK,{id:self.id,multi:1});
                },
                icon:self.url,
                num: self.num,
                videoType:_G.AppDef.VIDEO_EVENT_TYPE.MRRW
            }) 
        } 
    },
  
});
