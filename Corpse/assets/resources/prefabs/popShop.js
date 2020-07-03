/**
 * 商店
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView:cc.ScrollView, 
        btns:[cc.Node], 
    },
 
    onLoad () {  
        this.btns[1].active = false; 
    },

    start () {
        var config = _G.CfgMgr.getConfigs("petMoneyShop")
        var arr = []
        var GUN_MAX_ID = Number( _G.CfgMgr.getSysConfig(13))
        var pet = _G.IPlayer.getKey("pet");
        var maxCombineLv = pet.maxLevel + 2; 
        for (var key in config) { 
           if(key <= maxCombineLv){
                var element = Utils.copy(config[key])
                element.id = Number(key); 
                arr.push(element)  
          } 
        }
        this.arr = arr; 
        this.updateItem(); 
    },
    
    updateItem(){
        let script = this.scrollView.getComponent("ScrollViewHelper");
        script.resetData(this.arr ,(itemId, item, data)=>{
             let script = item.getComponent("shopItem");
             script.setInfo(item,data,itemId);
        })
        
        //自己计算定位
        let dingweiY = (script.itemHeight + script.spacing) * (this.arr.length - 5);
        script.scrollView.content.y = dingweiY
        script._updateContentView();

        
    },

    closePop(){
        PopMgr.closePop("popShop");
    },
 
    //退出弹窗doing someing
    exitPop(){
  
    } 

    // update (dt) {},
});
