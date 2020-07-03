/**
 * 数据操作
 */
let IPlayer = cc.Class({
    ctor(){
        this.data = {}; 
    },

    init(Iplaye){
        this.data = Iplaye; 
    },
    getKey(moduleName,key){
        if (Utils.isNull(moduleName)) return null;
        var moduleData = this.data[moduleName];
        if (Utils.isNull(moduleData)) return null;

        if(key){
            return moduleData[key];
        }
        
        return moduleData;
    },
    setKey(moduleName,value){ 
        this.data[moduleName] = value; 
    },
    synchronPlayerData(data){
        for (var key in data) {
            this.swithInfo(key,data[key])
        } 
    },
    swithInfo(name,data){
        switch (name) { 
            case "hongbao":
                let val= Utils.getValid(data["val"]); 
                let isGuide = _G.CfgMgr.getItem(this.data.uid+"isRedGuide")
                if(val  && val > 0 && !isGuide){
                    _G.AppDef.isGuideRed = true;
                    whevent.event(_G.EVENT.GUIDE_REDPACK);
                }
                this.defaultSynchronInfo(name,data); 
                break;  
            default:
                this.defaultSynchronInfo(name,data)
                break;
        } 
    },
     /**
     * 共用的同步  没有特殊的结构就用这一套
     */
     defaultSynchronInfo(name,info){ 
        var base = Utils.getValid(this.data[name], {});
        if(typeof base == "object" && typeof info == "object"){
            for (var k in info) { 
                base[k] = info[k];
            }
        }else{
            this.data[name] = info;
        } 
    },
 
    getPetLevel(slot){
        let list = this.getKey("pet").list 
        return list[slot].level || 0;
        
    },

    //增加金币(打怪专用增加接口)
    addMoney(num){
        _G.AppDef.KILL_MONSTER_MONEY += num;
        let moeny = this.getKey("money");
        moeny += num;
        this.setKey("money",moeny);
    },

     /**
     * 清除数据
     */
    clearData() {
        this.data = {};
    },
  
    getData(){
        return this.data;
    },
    
    /**
    * 获取铜钱宠物购买记录
    */
    getMoneyBuyRecord(id){ 
        var pet = this.getKey("pet")
        var buyRecord = pet.moneyBuyRecord;
        if(!buyRecord) buyRecord = [];
        return buyRecord[id] || 1 ; 
   } ,

    /**
    * 获取RMB宠物购买记录
    */
    getGoldBuyRecord(id){ 
        var pet = this.getKey("pet")
        var buyRecord = pet.diamondBuyRecord;
        if(!buyRecord) buyRecord = [];
        return buyRecord[id] || 1 ; 
    } 

});


if (typeof module !== 'undefined') {
	module.exports = IPlayer;
}