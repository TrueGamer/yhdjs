/**
 * 晋升新段位
 */
cc.Class({
    extends: cc.Component,

    properties: {
        oldDuanSp:cc.Sprite,
        oldName:cc.Label,
        currDuanSp:cc.Sprite,
        currentName:cc.Label,
        content:cc.Node,
        btn:cc.Node,
        itemNode:cc.Node,
    },
    
    setParams(params){
        this.rewardList = params.rewardList;
    },

    onLoad () {
        this.btn.active = false;
        let rank = _G.IPlayer.getKey("rank")
        let lastConfig = _G.CfgMgr.getConfig("title",rank-1)
        let config = _G.CfgMgr.getConfig("title",rank)
        this.oldName.string = lastConfig.name;
        this.currentName.string = config.name; 
        Utils.loadAsset(lastConfig.path,cc.SpriteFrame,(err, spriteFrame)=>{
            if(err)return;
            this.oldDuanSp.spriteFrame = spriteFrame;
        });  
        Utils.loadAsset(config.path,cc.SpriteFrame,(err, spriteFrame)=>{
            if(err)return;
            this.currDuanSp.spriteFrame = spriteFrame;
        });

        this.scheduleOnce(this.startClock ,_G.AppDef.DELAY_BTN_SHOW_TIME)

        let dict = this.rewardList;  
        let length = Object.keys(dict).length;
        if(dict && length > 0){  
            let gridWidth = this.itemNode.width;
            let gridLineNum = length;
            let gridIntervalX = Math.floor((this.content.width - gridLineNum*gridWidth ) / gridLineNum);  
            var e = -Math.floor(gridLineNum / 2) * (gridWidth + gridIntervalX);
            let index = 0;  
            for (const key in dict) { 
                const info = dict[key];
                let itemCofig = _G.CfgMgr.getConfig("item",info.itemID)
                if(!itemCofig){
                    console.log("not find itemCofig" + info.itemID)
                    return;
                }
                let node = cc.instantiate(this.itemNode);
                node.active = true;
                cc.setText(node.find("labNum"),"x{0}".format(info.num)); 
                let itemSp = node.find2("tanc_icon_d",cc.Sprite)
                Utils.loadAsset(itemCofig.icon,cc.SpriteFrame,(err, spriteFrame)=>{
                    if(err)return;
                    itemSp.spriteFrame = spriteFrame;
                });
                node.parent = this.content;
                node.x  = e  + index * (gridIntervalX + gridWidth) +  (length%2 == 0 ? gridWidth : 0 );  
                node.y = 0
                index +=1; 
            }
        }    
    },
 
    startClock(){
        this.btn.active = true;
    },
 
    onBtn(){
        this.closePop();
    },
 
    onMultipleGet(){ 
        //多倍
        SDKMgr.showRewardVideoAd(function(){
            Utils.http(_G.MESSAGE.GET_MULTI_UPDUAN,{multi:2})
        },_G.AppDef.VIDEO_EVENT_TYPE.DWSJ);
    },
 
    closePop(){
        this.unschedule(this.startClock);
        PopMgr.closePop("popUpDan");  
    },
 
    //退出弹窗doing someing
    exitPop(){
 
    }  

    // update (dt) {},
});
