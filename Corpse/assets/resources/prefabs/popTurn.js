/**
 * 轉盤
 */
cc.Class({
    extends: cc.Component,

    properties: {
        trunNode:cc.Node,
        numLab:cc.Label,
        templetNode:cc.Node,
        freeBtn:cc.Node,
        videBtn:cc.Node, 
    },
  
    onLoad () {
        //是否正在转动
        this.isPlayed = false
        this.addSpeed = 0;//记录时间加倍
    },

    start () {
        this.initUI();
        this.updateUI(); 
    },
    
    onBtn(){
        if(this.isPlayed){
            return;
        } 
        var roll = _G.IPlayer.getKey("roll")
        if(roll.ticket <= 0){
            PopMgr.createTip("次数不足")
            return;
        } 
        this.isPlayed = true;  
        Utils.http(_G.MESSAGE.ROLL); 
        return; 

    },

    //看视频抽奖
    onVideoBtn(){
  
        let self = this;
        if(self.isPlayed){
            return;
        } 
        var roll = _G.IPlayer.getKey("roll")
        if(roll.ticket <= 0){
            PopMgr.createTip("次数不足")
            return;
        }  
        SDKMgr.showRewardVideoAd(function(){
            self.isPlayed = false;  
            Utils.http(_G.MESSAGE.ROLL,{syncAD:1}); 
        },_G.AppDef.VIDEO_EVENT_TYPE.XYZP);  
    },

     /**
     * 转盘结果返回
     */
    onRespReward(resp){ 
        var id = Number(resp.trigger);  
        AppLog.log("resp.trigger"+resp.trigger)
        this.id = id;  
        this.rate = resp.rate || 1;
        this.reward = resp.rewardList 
        //扣次数  
        this.numLab.text = _G.IPlayer.getKey("roll","ticket")
        var rotationss = -(360/6)*(id-1); 
        var box = this.trunNode;
        box.rotation = box.rotation%360;
        wheen(box).to({rotation:3600},2000).to({rotation: 3600 + rotationss},1000).on("finish",
        ()=>{this.showReward()}).start(); 
    },

    showReward(){ 
        let config = _G.CfgMgr.getConfigs("roll");
        let info = config[this.id];  
        let dict = Tools.unPack(this.reward)
        let num = 0;
        let id = 0
        for (const key in dict) { 
            id = key;
            num = dict[key]; 
        } 
        let itemCofig = _G.CfgMgr.getConfig("item",id);
        let icon = info.icon
        if(itemCofig){
            icon = itemCofig.icon;
        }
        this.isPlayed = false;
        switch (info.type) {
                //钻石阳光奖励
            case 1:
            case 2: 
                PopMgr.createPop("popMultipleReward",{
                    callDouble:function(){
                        Utils.http(_G.MESSAGE.ROLL_DOUBLE,{multi:1,syncAD:1});
                    },
                    call:function(){
                       
                    },
                    icon:icon,
                    num:Tools.getCompany(num,2),
                    videoType:_G.AppDef.VIDEO_EVENT_TYPE.XYZP
                });


                break;
                //转盘加倍
            case 3:
                _G.AppDef.ADDSPEED_COUNT = 1;
                PopMgr.createPop("popReward",{num:_G.LangMgr.getText(1012).format(info.name),title:info.title,icon:icon,style:2}) 
                break;
                //子弹加速
            case 4:
                this.addSpeed += 1 * this.rate;
                PopMgr.createPop("popReward",{num:info.title,title:info.title,icon:icon,style:3}) 
                break;
            default:
                break;
        }  
        this.updateUI();
    },
    

    //多倍奖励的表现
    doubleReward(resp){
        let trigger = Number(resp.trigger);    
        let config = _G.CfgMgr.getConfigs("roll");
        let info = config[trigger];  
        let dict = Tools.unPack(resp.rewardList)
        let num = 0;
        let id = 0
        for (const key in dict) { 
            id = key;
            num = dict[key]; 
        } 
        let itemCofig = _G.CfgMgr.getConfig("item",id);
        let icon = info.icon
        if(itemCofig){
            icon = itemCofig.icon;
        }
        switch (info.type) {
                //钻石阳光奖励
            case 1:
            case 2:
                PopMgr.createPop("popReward",{num:num,title:info.title,icon:icon,style:1});
                break;
        }
    },
 

    initUI(){
        var config = _G.CfgMgr.getConfigs("roll");;
        var maxNum = 6;
        let pos =  {
            1:{x:0,y:264},
            2:{x:231,y:121,},
            3:{x:231,y:-141,},
            4:{x:0,y:-261,},
            5:{x:-231,y:-121,},
            6:{x:-231,y:141,}, 
        }
        for (var index = 1; index <= maxNum; index++) {
            var info = config[index];
            if(!info)continue;
            let node = cc.instantiate(this.templetNode);
            node.active = true;
            node.parent = this.trunNode
            node.x = pos[index].x;
            node.y = pos[index].y;
            node.rotation = (360/maxNum)*(index - 1);  
            cc.setText(node.find("tipLab"),info.name)
            let iconSp = node.find("icon",cc.Sprite)
            Utils.loadAsset(info.icon,cc.SpriteFrame,(err,sp)=>{
                cc.setText(node.find("icon"),sp);
            });
            node.id = index;
        }
    },

    updateUI(){ 
        if(!this.node  || !this.node.isValid) return;
        var roll = _G.IPlayer.getKey("roll");
        var maxRollCount = _G.CfgMgr.getSysConfig(17);
        this.numLab.string = _G.LangMgr.getText(1011).format(roll.ticket,maxRollCount);


        let constMaxCount = _G.CfgMgr.getSysConfig(17);
        let config = _G.CfgMgr.getConfig("rollCount",(constMaxCount - roll.ticket)  + 1)
        if(!config){
            config = _G.CfgMgr.getConfig("rollCount",constMaxCount)
        } 
        if(config.type == 1){
            this.freeBtn.active = true;
            this.videBtn.active = false;
        }else{
            this.freeBtn.active = false;
            this.videBtn.active = true;
        }  
    },
 
    closePop(){

        if(this.isPlayed){
            PopMgr.createTip(1021);
            return;
        }
        this.isPlayed = false;
        PopMgr.closePop("popTurn");
        whevent.event(_G.EVENT.CHECK_RED_DOT);
        //如果转到了加速
        if(this.addSpeed > 0){
            PopMgr.createPop("popSpeedMc",{call:()=>{ 
                _G.AppDef.ADD_SPEED_TIME = _G.CfgMgr.getSysConfig(18) * this.addSpeed; //秒 
            }});
        } 
    },
 
    //退出弹窗doing someing
    exitPop(){
      
    }  

    // update (dt) {},
});
