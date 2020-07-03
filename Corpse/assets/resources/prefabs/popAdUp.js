/**
 * 广告升级植物
 */
cc.Class({
    extends: cc.Component,

    properties: {
       skNode1:cc.Node, 
       skNode2:cc.Node, 
       btn:cc.Node,
    },
    
    setParams(params){
        this.params = params;
    },

    onLoad(){ 
        let self = this;
        this.btn.active = false;
        let posLevel = this.params.posLevel;
        let lv = posLevel + Number(this.params.upLevel)
        let config = _G.CfgMgr.getConfig("plant",posLevel); 
        let url = "prefabs/plant/{0}".format(config.model); 
        cc.createPrefab(url,(error, node)=>{
            node.parent = self.skNode1;  
            cc.setText(node.find("biaoq-di/label"),posLevel)
            let spine = node.find2("sp",sp.Skeleton) 
            spine.setAnimation(0, 'idle',true);   
        }) 
 
        let config2 = _G.CfgMgr.getConfig("plant",lv); 
        let url2 = "prefabs/plant/{0}".format(config2.model); 
        cc.createPrefab(url2,(error, node)=>{
            node.parent = self.skNode2;  
            cc.setText(node.find("biaoq-di/label"),lv)
            let spine = node.find2("sp",sp.Skeleton) 
            spine.setAnimation(0, 'idle',true);   
        })  
        this.unschedule(this.startClock);
        this.scheduleOnce(this.startClock ,_G.AppDef.DELAY_BTN_SHOW_TIME);
    },

    startClock(){
        this.btn.active = true;
    },

    onAdBtn(){  
         let self = this;
         SDKMgr.showRewardVideoAd(function(){
            Utils.http(_G.MESSAGE.UP_AD_REWARD,{syncAD:1});
            PopMgr.closePop("popAdUp"); 
        },_G.AppDef.VIDEO_EVENT_TYPE.SJZW); 
    },

    closePop(){
        this.params.call && this.params.call();
        PopMgr.closePop("popAdUp");
    },
 
    //退出弹窗doing someing
    exitPop(){

    } 
});
