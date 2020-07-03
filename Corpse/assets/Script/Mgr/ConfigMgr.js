/**
  * 配置管理器
  * 
  */  
var ConfigMgr = cc.Class({  
    ctor(){ 
        this.allCofnig = null;
        this.newDropConfig = null;
        this.isComplete = null; 
    }, 

    init(config){
        this.allCofnig = config;
        this.isComplete = true; 
        this.initDropGroup();
    },
    getConfigs(name){
        if(this.isComplete == false){
            cc.error("ConfigMgr  is not init ")
            return;
        }
        if(this.allCofnig  && name && this.allCofnig[name]){
            return this.allCofnig[ name ] || null;
        } 
    }, 

    getConfig(name,id){ 
        let config = this.getConfigs(name);
        if(config && config[id]){
            return config[id];
        }
        return null;
    },
  
    /**
     * 获取系统宏定义
     * @param {*} id 
     */
    getSysConfig(id){ 
        const config = this.getConfigs("defingcfg");
        if(config[id]){
            return config[id].value;
        }
        return null;
    },
 
     // 取得配置路由地址
    getUrl( key ) {
        var config = this.getConfig("urls",key);
        if(!config) return null;
        return config.url;
    },

     //获取宏定义
    getGlobal(key){
        var config = this.getConfig("global",key);
        if(!config) return null;
        return config.value;
        
    }, 


    getDropGroup(groudId){
        if(!this.newDropConfig){
            this.initDropGroup();
        }
        return this.newDropConfig[groudId];
    },
    
    initDropGroup(){ 
        const dropConfig = this.getConfigs("drop");
        this.newDropConfig = {};
        for ( var k in dropConfig ) {
            var config = dropConfig[k];
            var group = this.newDropConfig[ config.group ];
            if ( !group ) {
                group = {};
                group.randomTyp = config.randomTyp;        // 随机方式
                group.maxPro = 0;                           // 概率总和
                group.items = new Array();                  // 奖励列表
            }
            var item = {};
            item.dropID = k;                                // 掉落ID
            item.dropTyp = config.dropTyp;                 // 掉落类型
            item.itemID = config.itemID;                    // 物品ID
            item.count = config.count;                      // 数量
            item.pro = config.pro;                          // 概率
            group.items.push( item );
            group.maxPro += config.pro;
            this.newDropConfig[ config.group ] = group;
        } 
    },

 
    setItem(key,val){ 
        cc.sys.localStorage.setItem(key, val)
    },
    getItem(key){
        return cc.sys.localStorage.getItem(key)
    },
    // 删除临时数据
    removeItem: function (key) {
        cc.sys.localStorage.removeItem(key)
    }, 

    getGuideStep(){
        return this.getItem(_G.AppDef.UID + "guideStep") || 0; 
    },

    setGuideStep(step){
        return this.setItem(_G.AppDef.UID + "guideStep",step);
    }
    
    

  
}); 
if (typeof module !== 'undefined') {
	module.exports = ConfigMgr;
}