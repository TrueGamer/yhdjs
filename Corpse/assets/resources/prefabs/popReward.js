/**
 * 单个奖励弹窗
 */
cc.Class({
    extends: cc.Component,

    properties: {
       numLab:cc.Label,
       itemNode:cc.Sprite,
       titleLab:cc.Label,
       templet:cc.Node,
    }, 

    setParams(params){
        this.params =  params;
    },
    
    start () { 
        switch (this.params.style || 0) {
            //转盘奖励
            case 1:
                this.templet.active = true;
                this.numLab.string = "x{0}".format(Tools.getCompany(this.params.num,2));
                this.titleLab.string = this.params.title;
                Utils.loadAsset(this.params.icon,cc.SpriteFrame,(err,sp)=>{
                    this.itemNode.spriteFrame = sp;
                })
                break; 
            //转盘奖励下次多少倍
            case 2:
                    this.templet.active = true;
                    this.numLab.string = this.params.num;
                    this.titleLab.string = this.params.title;
                    Utils.loadAsset(this.params.icon,cc.SpriteFrame,(err,sp)=>{
                        this.itemNode.spriteFrame = sp;
                    })
                    break; 
            //攻击速度200%
            case 3:
                this.templet.active = true;
                this.numLab.string = this.params.num;
                this.titleLab.string = this.params.title;
                Utils.loadAsset(this.params.icon,cc.SpriteFrame,(err,sp)=>{
                    this.itemNode.spriteFrame = sp;
                })
                break; 
            default: 
                this.rewardList  = this.params.rewardList;
                this.setInfo(); 
                break;
        }  
    },

    setInfo(){ 
        //最多支持3个显示
        this.titleLab.string = this.params.title;
        let dict = Tools.unPack(this.rewardList);  
        let content = this.node.find("kuang")
        let length = Object.keys(dict).length;
        if(dict && length > 0){  
            let gridWidth = this.templet.width;
            let gridLineNum = length;
            let gridIntervalX = Math.floor((content.width - gridLineNum*gridWidth ) / gridLineNum);  
            var e = -Math.floor(gridLineNum / 2) * (gridWidth + gridIntervalX);
            let index = 0;  
            for (const key in dict) { 
                let num = dict[key];
                let itemCofig = _G.CfgMgr.getConfig("item",key)
                let node = cc.instantiate(this.templet);
                node.scale = 1.5;
                node.active= true;
                if(itemCofig.typ == 1){
                    num = Tools.getCompany(num,2)
                }
                cc.setText(node.find("numLab"),"x{0}".format(num)); 
                let itemSp = node.find2("zp_ico_sun",cc.Sprite) 
                Utils.loadAsset(itemCofig.icon,cc.SpriteFrame,(err, spriteFrame)=>{
                    if(err)return;
                    itemSp.spriteFrame = spriteFrame;
                });
                node.parent = content;
                node.x  = e  + index * (gridIntervalX + gridWidth) + (length%2 == 0 ? gridWidth - 50 : 0 );  
                node.y = this.templet.y;
                index += 1;
            } 
        }
    },
 
    onBtn(){
        this.closePop();  
    },

    closePop(){
        PopMgr.closePop("popReward");
        if(this.params && this.params.call){
            this.params.call();
        }
    },
  
    exitPop(){ 
        if(this.isTask3) return; 
        this.isTask3 = true;
        Tools.checkShopGuide();
        
    }  
});
