/**
 * 获得免费阳光
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

        let freeZS = _G.CfgMgr.getConfigs("freeSun");
        let maxLen = Object.keys(freeZS).length; 
        let count = _G.IPlayer.getKey("freeMoneyNum") || 0;
  
        let config = _G.CfgMgr.getConfig("freeSun",count+1)
        this.id = count+1;
        if(!config){ 
            config = _G.CfgMgr.getConfig("freeSun",count)
            this.id = count
        }

        let num = 0;
        for (const key in config.reward) {
             num = config.reward[key];   
        }

        let level = 1
        let pet = _G.IPlayer.getKey("pet");
        if(pet.maxLevel >  _G.AppDef.BUY_LIMIT_PET ){
            level = pet.maxLevel - _G.AppDef.BUY_LIMIT_PET; 
        } 
 
        var petConfig = _G.CfgMgr.getConfigs("petMoneyShop")
        let data = petConfig[level];
        let buyNum = _G.IPlayer.getMoneyBuyRecord(level)
        let salePrice  = 0
        if(buyNum <= 1){
           salePrice = Math.round(data.a); 
        }else{
           salePrice = Math.round( data.a * Math.pow(data.b,buyNum) )
        }
        this.lb_num.string = "{0}".format(Tools.getCompany(num * salePrice,2));
    }, 
 
    onBtn(){ 
        let call = function(id){
            Utils.http(_G.MESSAGE.FREE_MONEY,{syncAD:1});   
            PopMgr.closePop("popFreeSun"); 
        }.bind(this,this.id);

        SDKMgr.showRewardVideoAd(call,_G.AppDef.VIDEO_EVENT_TYPE.MFYG);   
    },

   
    closePop(){
        PopMgr.closePop("popFreeSun");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

});
