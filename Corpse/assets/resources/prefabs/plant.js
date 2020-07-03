/**
 * 展示用的spine
 */
cc.Class({
    extends: cc.Component,

    properties: {
         sp:cc.Node,
         dizuo:cc.Node,
         levelNode:cc.Node,
         level:{
            default:0,
            type:cc.Integer,
            notify(){
                this.setSpine();
            } 
         }
    },

    setSpine(){
 
        let config  = _G.CfgMgr.getConfig("plant",this.level); 
        this.destroySpine();
        
        cc.setText(this.levelNode.find("label"),this.level);
        let dizuoSP = this.dizuo.getComponent(cc.Sprite);
        Utils.loadAsset(config.base,cc.SpriteFrame,(err, spriteFrame)=>{
            if(err)return;
            dizuoSP.spriteFrame = spriteFrame;  
        }); 
        let spine = this.sp.addComponent(sp.Skeleton);
        let url = "turrets/{0}".format(config.model);
        Utils.loadAsset(url,sp.SkeletonData,(err, skeletonData)=>{
            if(err)return;
            spine.skeletonData = skeletonData;  
            spine.setAnimation(0, 'idle',true);
        });
    }, 

     destroySpine(){
        let spine = this.sp.getComponent(sp.Skeleton);;
        if(spine){ 
            spine.destroy();
            spine = null;
        }  
     }

});
