/**
 * 商店商品
 */
cc.Class({
    extends: cc.Component,

    properties: {
        moneyBtn:cc.Node,
        diamondBtn:cc.Node,
        freeBtn:cc.Node,
        kuanNode:cc.Node,
        hp_bar:cc.ProgressBar,
        mp_bar:cc.ProgressBar,
        consumeNode:cc.Node,
        botany:cc.Prefab, //植物
        btnIndex:{
            default:0,
            type:cc.Integer,
            notify(){
                this.setBtn();
            } 
        },//按钮下标
    },
 
    onLoad () { 
        whevent.on(_G.MESSAGE.BUY_PET_MONEY,this.onUpdateUI,this); 
        whevent.on(_G.MESSAGE.BUY_PET_GLOD,this.onUpdateUI,this); 

    },

    onUpdateUI(){
        if(this.node.isValid){
            this.setInfo(null,this.data,this.index);
        }
    }, 

    setBtn(){
        this.node.find("lab_tip").active = false;
        this.moneyBtn.active = false;
        this.diamondBtn.active = false;
        this.freeBtn.active= false;
        this.consumeNode.active = false;
        switch (this.btnIndex) {
            //免费看视频
            case 1: 
                this.freeBtn.active= true; 
                break;
            //钻石购买
            case 2: 
                this.consumeNode.active = true
                this.diamondBtn.active= true; 
                break; 
            //阳光购买
            case 3: 
                this.moneyBtn.active = true; 
                break; 
            default:
                //没解锁 
                this.node.find("lab_tip").active = true;
                break;
        } 
    },

    start () {
       
    }, 

    setInfo(cell,data,index){ 
 
        if(!data){
            return;
        }  
        this.index = index;
        this.data = data; 
        let petLv = data.id;
        this.petLv = petLv;
        this.node.name = "shopItem"+petLv;
        let buyNum = _G.IPlayer.getMoneyBuyRecord(petLv)
        let salePrice  = 0
        if(buyNum <= 1){
           salePrice = Math.round(data.a); 
        }else{
           salePrice = Math.round( data.a * Math.pow(data.b,buyNum) )
        }
        //解锁价格
        cc.setText(this.moneyBtn.find("Label"),Tools.getCompany(salePrice,2)) 
        var pet = _G.IPlayer.getKey("pet");
        var maxCombineLv = pet.maxLevel;
         
        //植物形象
        let sp = this.kuanNode.find2("plant",cc.Sprite);
        let config = _G.CfgMgr.getConfig("plant",petLv);
        let url = "plant/{0}".format(config.unlock);
        cc.setText(this.kuanNode.find("biaoq-di/label"),petLv)
        Utils.loadAsset(url,cc.SpriteFrame,(err,spriteFrame)=>{
            sp.spriteFrame = spriteFrame; 
            var scaleX = sp.node.width /sp.node.parent.width
            var scaleY = sp.node.height/sp.node.parent.height
            var scale = scaleX < scaleY ? scaleX : scaleY;
            sp.node.scale = scale
            sp.node.scale = scale
        })

        //解锁等级
        var moneyBuyLe = maxCombineLv - _G.AppDef.BUY_LIMIT_PET ;  
        var buyLimitLv = maxCombineLv - _G.AppDef.BUY_DIAMOND_LIMIT;
     
        //钻石解锁开放 n+2 ,n > 4 
        if(petLv >= _G.AppDef.BUY_LIMIT_PET && buyLimitLv >= petLv  &&  petLv + 2 > buyLimitLv){  
            this.btnIndex = 2;
            this.setGoldText(petLv);
            //金币解锁开放的 n+4  n > 1   
        }else if(moneyBuyLe >= petLv || petLv <= 1){
            //花费金币按钮  
            this.btnIndex = 3; 
        }else{
            //没开放
            this.btnIndex = 0;
        } 
    }, 
    setGoldText(petLv){
        var buyNum = _G.IPlayer.getGoldBuyRecord(petLv)
        var config = _G.CfgMgr.getConfig("petRmbShop",petLv)  
        if(!config) return;
        var saleGold = Utils.toFixed(config.a + (buyNum -1) * config.b,0) 
        //花费钻石数 
        cc.setText( this.consumeNode.find("lab_num"),saleGold);
    },


    //金币购买
    onMoneyBtn(){
        this._index = this.index;
        //添加宠物
        Utils.http(_G.MESSAGE.BUY_PET_MONEY,{level:this.petLv});
    },

    //钻石购买
    onDiamondBtn(){
        this._index = this.index;
        //添加宠物
        Utils.http(_G.MESSAGE.BUY_PET_GLOD,{level:this.petLv}); 
    },

    //免费获得
    onFreeBtn(){
        
    },

    onDestroy(){
        whevent.off(_G.MESSAGE.BUY_PET_MONEY,this.onUpdateUI,this); 
        whevent.off(_G.MESSAGE.BUY_PET_GLOD,this.onUpdateUI,this);  
    } 

    // update (dt) {},
});
