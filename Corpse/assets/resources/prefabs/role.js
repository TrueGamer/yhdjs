//预制体  炮台
// 子弹属于 炮塔
//子弹有自己的属性  速度
var Vector2d = require( "vector2d" )
cc.Class({
    extends: cc.Component,

    properties: {
        paota:cc.Node, 
        bulletPre:cc.Prefab,
        //发射间隔 
        interval:{
            type:cc.Integer,
            default:2,
            visible:false
        }, 
        level:{
            default:0,
            type:cc.Integer,
            // notify(){
            //     this.setModel();
            // }
        },
        //位置 处于格子里面
        slot:{
            default:99,
            type:cc.Integer,
            visible:false
        }, 
        isDrag:{
            default:false, 
            notify(){
               this.active2();
            }
        }, 

        djsTime:5, //宝箱倒计时

        box:cc.Node
    }, 
    onLoad(){ 
        this.game = cc.find("Canvas").getComponent("world");
        //底座
        //this.dizuo = this.node.find2("dizuo","SpriteEx"); 
        this.cTime = 0;
        this.bulletNum = 1;
        this.bulletDir = 1; 
    },

    init(aimNode,gameLayer){
        this.aimNode = aimNode;
        this.gameLayer = gameLayer;
        //合并特效
        let cbSK = this.node.find2("cb",sp.Skeleton);
        cbSK.node.active = false;
        cbSK.setCompleteListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            if(animationName == "cb"){  
                cbSK.node.active = false;
            }
        });
    },

    //拖拽植物隐藏部分节点
    active2(){ 
        this.paota.active = !this.isDrag; 
    },
 

    //提示合成
    tipMc(tag){
        let mc = this.node.find("donghua"); 
        if(tag){ 
            mc.active = true;
            Wheen.stop(mc); 
            wheen(mc).setFlag("StartMc").to({opacity:255},1000).to({opacity:0},1000).loop(-1,"StartMc").start();
        }else{ 
            mc.active = false;
            Wheen.stop(mc);
        }
    },
 
    //发射子弹
    onShotPoll(){  
        if(!this.spine){ return }  

        if(_G.AppDef.ADD_SPEED_TIME > 0){
           this.spine.timeScale = this.config.rate;
        }else{
            this.spine.timeScale = 1;
        } 

        if(this.game.monsterCtrls.length <= 0 ) {
            if(this.aimNode.active == false){
                this.setHeadAngleZero();
            } 
            this.spine.setAnimation(1,"idle",true);
            return; 
        }  
        if(this.isCanShotBullet() == false){
            if(this.aimNode.active == false){
                this.setHeadAngleZero();
            } 
            this.spine.setAnimation(1,"idle",true);
            return; 
        } 

        if(_G.AppDef.PAUSE_GAME) { 
            this.spine.setAnimation(1,"idle",true);
            return;
        }

        let trackEntry  = this.spine.getCurrent(0) 
        if(!trackEntry) return;
        var animationName = trackEntry.animation ? trackEntry.animation.name : ""; 
        if(animationName == "idle"){ 
           // this.spine.clearTrack(0); 
            this.spine.setAnimation(1,"attack",false); 
        }else{
            this.spine.addAnimation(1,"attack",false); 
        }
    },
    
    //检查是否可以射击
    isCanShotBullet(){ 
        let topWall = this.gameLayer.find("topWall")
        let mosnters =  this.game.monsterCtrls;
        for (let index = 0; index < 6; index++) {
            const mosnter = mosnters[index];
            if(!mosnter)continue;
            if(mosnter.y < topWall.y){
                return true
            } 
        } 
        return false;
     },

    //子弹发射类型
    onShotPollDir(){
        if(this.game.monsterCtrls.length <= 0 ) return;
        let dir = this.config.styleId; 
        let arr = this.config.styleId.split("_");
        this.bulletNum = arr[1];
        this.bulletDir = arr[0]; 
        let bullet = null;
        let model = this.paota.model.find("sp")
        let worldP = Utils.localConvertWorldPointAR(model)
        let local = Utils.worldConvertLocalPointAR(this.gameLayer,worldP)
        if(this.aimNode.active == false){ 
            //寻找敌人角度
            let random = 0
            if(this.game.monsterCtrls.length > 4){
                random = Utils.getRandom(4,0)
            }
            let monster = this.game.monsterCtrls[random];
            let rotation = Utils.getRotation(cc.v2(local.x,local.y),monster);  
            model.rotation = (-rotation + 90) ; // 炮塔方向 
        } 
        let angle = model.rotation; // 炮塔方向
        var sx = Math.sin(angle / 180 * Math.PI);
        var sy = Math.cos(angle / 180 * Math.PI);
        let direVec = new Vector2d( sx, sy );
        direVec = direVec.normalize();  
        switch (dir) {
            case "1_1":
            case "1_2": 
            case "1_3": 
            case "2_1": 
            case "3_1":  
                if (this.game.bulletPool.size() > 0) {
                    bullet = this.game.bulletPool.get(); 
                } else {
                    bullet = cc.instantiate(this.bulletPre); 
                }
                // 计算方向向量
                bullet.angle = angle; // 炮塔方向
                bullet.direVec = direVec;
                bullet.parent = this.gameLayer;
                bullet.itemCtrl = this.node;  
                let pointNode = this.paota.model.find("sp/point{0}_{1}".format(1,1)) 
                let fixX = 0;
                let fixY = 0;
                if(pointNode){
                    let node = Utils.localConvertWorldPointAR(pointNode)
                    let nodeCenter = Utils.localConvertWorldPointAR( this.paota.model.find("sp/point{0}_{1}".format(1,3)) )  
                    fixX = node.x - nodeCenter.x;
                    fixX = node.y - nodeCenter.y;
                }  
                bullet.x = local.x + fixX;
                bullet.y = local.y + fixY;
                bullet.power = this.config.power; 
                let script = bullet.getComponent("bullet") 
                script.index = this.config.bullet - 1 ;
                script.shot(this.game,this.config.speed,this.config.isRotate); 
                break;  
            case "2_2":  
            case "2_3":
                    for (let index = 1; index <= this.bulletNum; index++) {
                        this.scheduleOnce(()=>{ 
                            if (this.game.bulletPool.size() > 0) {
                                bullet = this.game.bulletPool.get(); 
                            } else {
                                bullet = cc.instantiate(this.bulletPre); 
                            }
                            // 计算方向向量
                            bullet.angle = angle; // 炮塔方向
                            bullet.direVec = direVec;
                            bullet.parent = this.gameLayer;
                            bullet.itemCtrl = this.node;   
                            let pointNode = this.paota.model.find("sp/point{0}_{1}".format(this.bulletDir,index)) 
                            let node = Utils.localConvertWorldPointAR(pointNode)
                            let nodeCenter = Utils.localConvertWorldPointAR( this.paota.model.find("sp/point{0}_{1}".format(this.bulletDir,3)) )  
                            bullet.x = local.x  + node.x - nodeCenter.x 
                            bullet.y = local.y  +  node.y- nodeCenter.y 
                            bullet.power = this.config.power;  
                            let script = bullet.getComponent("bullet") 
                            script.index = this.config.bullet - 1 ;
                            script.shot(this.game,this.config.speed,this.config.isRotate);  
                        },0)
                    }  
            break;
            case "3_2":  
            case "3_3": 
                for (let index = 1; index <= this.bulletNum; index++) {
                    this.scheduleOnce(()=>{ 
                        if (this.game.bulletPool.size() > 0) {
                            bullet = this.game.bulletPool.get(); 
                        } else {
                            bullet = cc.instantiate(this.bulletPre); 
                        }
                        // 计算方向向量
                        bullet.angle = angle; // 炮塔方向
                        bullet.direVec = direVec;
                        bullet.parent = this.gameLayer;
                        bullet.itemCtrl = this.node;    
                        bullet.x = local.x; 
                        bullet.y = local.y;
                        bullet.power = this.config.power;  
                        let script = bullet.getComponent("bullet") 
                        script.index = this.config.bullet - 1 ;
                        script.shot(this.game,this.config.speed,this.config.isRotate);  
                    },index * 0.1)
                }   
            break;
 
            default:
                break;
        }  
    },

    initMonitor(spine){
        if(!spine)return;
        spine.setEventListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";  
            if(event.data.name == "attack"){ 
                Tools.playSound( this.config.sound );
                this.onShotPollDir();
            } 
        });
   },

   setHeadAngleZero(){
        if(!this.paota.model) return;
        var model = this.paota.model.find("sp")
        model.rotation = 0;  
   },


   setHeadAngle(amiPos){  
        if(!this.paota.model) return;
        var model = this.paota.model.find("sp") 
        var itemPos = cc.v2(this.node.x + model.x,this.node.y + model.y) 
        var rotation = Utils.getRotation(itemPos,amiPos);  
        model.rotation = -rotation + 90;  
   }, 

   //设置箱子
   setBox(){
        let self = this;
        let slot = this.node.slot;
        let posList =  _G.IPlayer.getKey("pet").list;
        let info = posList[slot];
        let config = _G.CfgMgr.getConfig("box",info.id);
        if(info.type == 2){
            //开始倒计时
            self.djsTime = _G.CfgMgr.getSysConfig(26);
            self.box.active = true; 
            self.box.getComponent("SpriteEx").index =  info.id - 1;
            if(config.type == 2){return};
            this.unschedule(self.boxDjs);
            self.scheduleOnce(self.boxDjs,self.djsTime);
        }else{
            self.box.active = false; 
        }
   }, 

   //宝箱倒计时
   boxDjs(){
        let self = this;
        let posList =  _G.IPlayer.getKey("pet").list;
        let info = posList[self.node.slot];
        let config = _G.CfgMgr.getConfig("box",info.id);
        if(config.type == 2){return}; 
        Utils.http(_G.MESSAGE.OPEN_BOX,{site:self.node.slot});
        //self.box.active = false;  
   },
 
   //打开箱子
   onOpenBox(){  
        let self = this;
        this.unschedule(self.boxDjs);
        let posList =  _G.IPlayer.getKey("pet").list;
        let info = posList[self.node.slot];
        let config = _G.CfgMgr.getConfig("box",info.id);
        if(config.type == 2){   
            let maxCount = _G.CfgMgr.getSysConfig(30);
            let hongbao =_G.IPlayer.getKey("hongbao");
            let count =  maxCount - hongbao.adBoxHbTime;   
            if(count > 0){
                PopMgr.createPop("popRedPack",{ openCall:function(){
                    Utils.http(_G.MESSAGE.OPEN_BOX,{site:self.node.slot,syncAD:1});
                    //self.box.active = false;
                },call:()=>{
                    Utils.http(_G.MESSAGE.OPEN_BOX,{site:self.node.slot});
                    //self.box.active = false; 
                }, title:"宝箱红包",redPackType:_G.AppDef.RED_PACK_TYPE.AD_BOX}); 

            }else{ 
                PopMgr.createPop("popBox",{
                    callDouble:function(){
                        Utils.http(_G.MESSAGE.OPEN_BOX,{site:self.node.slot,syncAD:1});
                        //self.box.active = false;
                    },
                    call:function(){
                        Utils.http(_G.MESSAGE.OPEN_BOX,{site:self.node.slot});
                        //self.box.active = false;  
                    },
                    num:config.rule, 
                    title:"{0}x{1}".format(config.name,config.rule),
                    icon:config.icon,
                });  
            }

        }else{
            Utils.http(_G.MESSAGE.OPEN_BOX,{site:this.node.slot}); 
        }
   },
 
    //设置炮塔贴图
    setModel(level,mc) {
        let self = this;  
        //底座切换
        if(this.node.slot < 5){ 
            this.paota.scale = 1; 
        }else{ 
            this.paota.scale = 0.7; 
        }

        if(Utils.isValid(level)){  
            this.level = level; 
        }

        this.level = _G.IPlayer.getPetLevel(this.node.slot)
        this.node.level = this.level ;
        if(this.level <= 0) { 
            if(this.paota.model){
                this.paota.model.destroy();
                this.paota.model = null
            } 
            return;
        }

        this.config = _G.CfgMgr.getConfig("plant",this.level); 
        this.interval = this.config.launchSpeed /1000; 
        let url = "prefabs/plant/{0}".format(this.config.model); 
        //判断如果当前和之前是一样的
        if(this.paota.model){
            this.paota.model.destroy();
            this.paota.model = null
        }

        cc.createPrefab(url,(error, node)=>{
            if(error)return;
            let oldscleX = self.paota.scaleX; 
            node.y = this.node.slot < 5 ? 50 : 0;
            node.parent = self.paota; 
            //预防重叠
            if(self.paota.model){
                self.paota.model.destroy();
                self.paota.model = null
            }
            self.node.find("paota").model = node;
            cc.setText(node.find("biaoq-di/label"),this.level)
            let spine = node.find2("sp",sp.Skeleton)
            self.spine = spine;
            self.initMonitor(spine);   
            spine.setAnimation(0, 'idle',true); 
            if(mc){ 
                self.paota.scale = 0.1;
                wheen(self.paota).to({scaleX:oldscleX,scaleY:oldscleX},300,Wheen.Easing.Elastic.easeOut).start();  
            } 
        }) 
    },

    //购买添加动画
    onAddMc(lv){ 
        if(this.node.slot < 5){ 
            this.paota.scale = 1; 
        }else{ 
            this.paota.scale = 0.7; 
        }
        let paota = this.paota;
        this.paota.active = true;
        let oldscleX = paota.scaleX;  
        this.setModel(lv,true);
    },

    //合成动画
    onMergeMc(level){ 
        this.node.level = level;
        let model = this.paota; 
        let self = this;
        let mcA = cc.instantiate(model);
        mcA.x = -50 ; 
        mcA.rotation = 0;
        mcA.parent = model.parent
        let mcB= cc.instantiate(model);
        mcB.x = 50 ;
        mcB.parent = model.parent;
        mcB.rotation = 0;
        model.active = false;
        wheen(mcA).to({ x: 0 },300,Wheen.Easing.Linear).on("finish",()=>{
            mcA.destroy();
        }).start(); 

        wheen(mcB).to({ x: 0 },300,Wheen.Easing.Linear).on("finish",()=>{
            model.active = true;
            mcB.destroy();
            let cbSK = self.node.find2("cb",sp.Skeleton) 
            cbSK.node.active = true;
            cbSK.setAnimation(0,"cb");
            self.setModel(level);
        }).start(); 
    },

    update(dt){  
        let speed = 1
        if(_G.AppDef.ADD_SPEED_TIME > 0){
            speed = 2
        } 
        this.cTime += dt * speed;
        if(this.slot >= 5) return;
        if(this.level <= 0) return;
        if(this.isDrag) return;  
        if(this.cTime >= this.interval ){
            this.cTime = 0;
            this.onShotPoll();
        } 
    },

    setPauseSpine(){ 
       if(this.spine){
           this.spine.timeScale = 0;
       } 
    },
    setResumeSpine(){ 
        if(this.spine){
            this.spine.timeScale = 1; 
        }
        
     }


});
