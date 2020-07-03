/**
 * 确认售卖
 */
cc.Class({
    extends: cc.Component,

    properties: {
        priceLab:cc.Label,
        spNode:cc.Node,
    },
  

    setParams(params){  
        this.level = params.level;
        this.slot = params.slot;
    }, 

    start () {
        let self = this;        
        this.config = _G.CfgMgr.getConfig("plant",this.level); 
        let url = "prefabs/plant/{0}".format(this.config.model); 
        cc.createPrefab(url,(error, node)=>{
            node.parent = self.spNode;  
            cc.setText(node.find("biaoq-di/label"),this.level)
            let spine = node.find2("sp",sp.Skeleton) 
            spine.setAnimation(0, 'idle',true);   
        }) 
        var config = _G.CfgMgr.getConfig("petSell",this.level);
        this.priceLab.string = "x{0}".format(Tools.getCompany(config.price,2)) ;
    },
    
    closePop(){
        PopMgr.closePop("popSellTip");
    },
 
    onBtn(){
        Utils.http(_G.MESSAGE.SELL_PET,{site:this.slot});
        Tools.playSound("SELL");
    },

    /**
     * 取消
     */
    cancelBtn(){
        whevent.event(_G.EVENT.UPDATE_PLANT,this.slot);
        this.closePop();
    }, 
 
    //退出弹窗doing someing
    exitPop(){
 
    }  
    // update (dt) {},
});
