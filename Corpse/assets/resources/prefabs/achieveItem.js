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
        btnIndex:{
            default:0, 
            type:cc.Integer,
            notify(){
               this.setBtn();
            }
        }
    },
    
    onLoad(){

    },
    
    setInfo(data,index){ 
        this.id = data.id;
        this.btn.find("bth_zi_d").active = false;
        let achievement = _G.IPlayer.getKey("achievement");
        let achievementRecord = _G.IPlayer.getKey("achievementRecord"); 
        let pro  = achievement[data.typ] || 0;
        let info = achievementRecord[data.typ];
        if(typeof(pro) == "object"){ 
            if(data.typ == 6){
                pro = pro[data.param.level] || 0;
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
        Utils.loadAsset(itemInfo.icon,cc.SpriteFrame,(err,sp)=>{
            this.reward.getComponent(cc.Sprite).spriteFrame = sp;
        }) 

        this.itemId = itemId;
        this.url = itemInfo.icon;
        this.num = num;
        this.numEx = num;
        cc.setText(this.reward.find("lab_num"),num);  
    },

    setBtn(){    
        this.btn.getComponent("SpriteEx").index = this.btnIndex;
    }, 
 
    onBtn(){
        let self = this;
        if(this.itemId == _G.AppDef.RED_PACK_ID){  
            let dbCall = ()=>{
                Utils.http(_G.MESSAGE.ACHIEVENMENT,{id:self.id,multi:2,syncAD:1});
            } 
            let call = ()=>{
                Utils.http(_G.MESSAGE.ACHIEVENMENT,{id:self.id,multi:1}); 
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
                    Utils.http(_G.MESSAGE.ACHIEVENMENT,{id:self.id,multi:2,syncAD:1});
                },
                call:function(){
                    Utils.http(_G.MESSAGE.ACHIEVENMENT,{id:self.id,multi:1});
                },
                icon:self.url,
                num: self.num,
                videoType:_G.AppDef.VIDEO_EVENT_TYPE.CJRW
            }); 
        }
       
    },
  
});
