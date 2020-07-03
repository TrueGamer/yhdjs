//世界控制器 
cc.Class({
    extends: cc.Component,
    
    properties: {
        gameLayer:cc.Node,
        topLayer:cc.Node,
        posLayer:cc.Node,
        rolePre:cc.Prefab,
        sellCtrl:cc.Node,
        bulletPre:cc.Prefab, 
        monster:cc.Prefab,  
        box:cc.Prefab,
        dizuo:cc.Prefab,  
        yujiazaiPreFab:[cc.Prefab],

       mTime:{
        type:cc.Integer,
        default:0,
        visible:false
       },
       AimPos:{ 
            default:null,
            visible:false
       },
       //子弹对象池
      bulletPool:{
          type:cc.NodePool,
          default:null,
          visible:false
      },
        //子弹对象池
        monsterPool:{
            type:cc.NodePool,
            default:null,
            visible:false
        },  
    },
    onLoad: function () {    
        _G.AudioMgr = cc.find("Canvas").getComponent("AudioMgr");
        _G.AudioMgr.initSet()
        _G.AudioMgr.playBgmLoading("BG"); 
        _G.AppDef.guideStep = _G.IPlayer.getKey("guide");

        this.bulletPool = new cc.NodePool();
        this.monsterPool = new cc.NodePool();
        this.sunPool = new cc.NodePool();
        this.boxPool = new cc.NodePool();

        this.monsterCtrls = [];     //怪物集合  
        this.tipTime = 0;           //静止无操作提示合并计数时间
        this.seq = 0                //用于标记怪物层级计数
        this.tipMaxTime = 10 ;      //10 秒没动静就提示
        this.levelTotalExp = 0 ;    //当前关卡经验值 (用于提升称号)
        this.atuoDtime = 0;
        this.upLevelNode = this.topLayer.find("di-t/top-dik-t2/shegnjiduanwei");
        this.isupLevelLoop = false;
        this.upLevelNode.active = false;
        this.gapSpeed = 5; //出怪间隔

        this.maxPlantLv = 0; //最大植物等级
        //开启碰撞
        var manager = cc.director.getCollisionManager();
        manager.enabled = true; 
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;  
          
        let topLayer = this.topLayer;
        let topDi = this.topLayer.find("di-t")  
        topLayer.scaleX = topLayer.width/topDi.width
        topLayer.scaleY = topLayer.width/topDi.width; 
        this.gameLayer.find("dieWall").active = false;
        this.initGameLayer();
        this.onCreateMergePos();
        this.onShotPos(); 
        this.initMonster();
        this.refenceRedPoint();
        //自动提示
        this.autoTip(); 
        this.updateUI();
        this.isComeInPlayed = true; //开启一波僵尸入场
        this.gameLayer.find("buffLayer").zIndex = 10002;
        //启动秒轮训
        this.schedule(this.loopPoll,1); 
        console.log(_G.AppDef.UID);

    },
 
    start(){  
        
        //新手指引期间不出现  
        _G.AppDef.guideStep = _G.IPlayer.getKey("guide")
        if(_G.AppDef.offLineExp > 0 && _G.AppDef.guideStep >= _G.AppDef.MaxGuideStep){
            PopMgr.createPop("popOfflineExp");
        } 
        //新手指引期间不出现  必须强制引导过后  还要没签到
        let maxRank = _G.IPlayer.getKey("maxRank"); 
        let rank = _G.IPlayer.getKey("rank")
        rank = maxRank > rank ? maxRank : rank;
        if(_G.AppDef.guideStep >= _G.AppDef.MaxGuideStep && rank > 1 && _G.RedDotMgr.checkIsSignIn()){
            PopMgr.createPop("popSignIn");
        }   
        //重新登录发现如果没有指引钻石购买
        Tools.checkShopGuide();

        //新手检查
        Tools.checkGuideRedPack();

        //如果应该是红包指引
        if(_G.IPlayer.getKey("guide") == 10){
            Tools.checkShopGuide();
        } 

        this.updateDuanWei();
    },
     
    //秒轮训
    loopPoll(){ 
        if(_G.AppDef.ADD_SPEED_TIME > 0 ){
            _G.AppDef.ADD_SPEED_TIME -= 1;
            this.setAddSpeedBuff();
        }else{
            this.gameLayer.find("buffLayer/icon_mp").active = false; 
        }  
    },
 
    //设置段位经验值
    setDuanWeiExp(value){ 
        if(!Utils.isValid(value)){
            let levelTotalExp = _G.CfgMgr.getItem(_G.AppDef.UID + "levelTotalExp") || 0;
            this.levelTotalExp = Number(levelTotalExp) || 0; 
        } else{
            this.levelTotalExp += value;
            _G.CfgMgr.setItem( _G.AppDef.UID + "levelTotalExp",this.levelTotalExp);
        }   
        let pro = this.levelTotalExp/this.totalExp; 
        if(pro < 0.1) pro = 0.1;
        if(pro >= 1){
            pro = 1; 
            let rank = _G.IPlayer.getKey("maxRank"); 
            this.upLevelNode.active = true; 
            if(rank <= 1){  
                whevent.event(_G.EVENT.GUIDE_DAN);  
            }
            if( this.isupLevelLoop  == false){  
                this.isupLevelLoop  = true;
                wheen(this.upLevelNode).setFlag("loop").to({scaleX:1,scaleY:1},1000).to({scaleX:0.8,scaleY:0.8},1000).loop(-1,"loop").start();
            }
        }else{ 
            this.upLevelNode.active = false;
        }
        cc.setText(this.topLayer.find("di-t/top-dik-t2/progressBar"),pro);
    }, 

    updateDuanWei(){ 
        let rank = _G.IPlayer.getKey("rank");
        let titleInfo = _G.CfgMgr.getConfig("title",rank);
        this.levelConfig =  _G.CfgMgr.getConfig("level",titleInfo.level)  
        this.totalExp = titleInfo.exp;  
        this.gapSpeed = this.levelConfig.gapSpeed /1000;
        cc.setText(this.topLayer.find("di-t/xuanzhang/lb_title"),titleInfo.name);
        if(this.duanweiRes != titleInfo.path){
            this.duanweiRes =  titleInfo.path ;
            Utils.loadAsset(titleInfo.path,cc.SpriteFrame,(err,sp)=>{
                cc.setText(this.topLayer.find("di-t/xuanzhang/duanwei"),sp);
            })
        } 
        this.setDuanWeiExp();
    },


    //初始化适配怪物层
    initGameLayer(){
        let baseNode = this.node.find("baseNode"); 
        baseNode.height = cc.winSize.height - this.topLayer.height * this.topLayer.scaleY; 
        let di = this.node.find("baseNode/di-b");
        let diY = di.y + di.height/2;
        let gameLayer = this.gameLayer;  
        gameLayer.height = baseNode.height - di.height;
        let gameY = diY + gameLayer.height/2;
        gameLayer.y = gameY ;
        gameLayer.getComponent(cc.Widget).updateAlignment(); 
        let gameLayerH = gameLayer.getContentSize().height; 
        gameLayer.find2("topWall",cc.BoxCollider).size.width = cc.winSize.width; 
        gameLayer.find2("leftWall",cc.BoxCollider).size.height = gameLayerH;
        gameLayer.find2("rightWall",cc.BoxCollider).size.height = gameLayerH; 
        gameLayer.find2("bottomtWall",cc.BoxCollider).size.width = cc.winSize.width;
        gameLayer.find2("dieWall",cc.BoxCollider).size.width = cc.winSize.width;
    },

    //警告危险
    warnWall(tag){ 
        let gameLayer = this.gameLayer; 
        let dieWall = gameLayer.find("dieWall")
        if(tag){  
            if(dieWall.active) return;
            if(dieWall.active == false)dieWall.active = true; 
            Wheen.stop(dieWall); 
            wheen(dieWall).setFlag("StartMc").to({opacity:255},500).wait(300).to({opacity:125},500).loop(-1,"StartMc").start();
        }else{ 
            dieWall.active = false;
        }
    },
 
    initMonster(){
        let gameLayer = this.gameLayer;
        let aimNode = gameLayer.find("Aim"); 
        aimNode.active = false;
        //怪物出生点
        let size = gameLayer.getContentSize() 
        let gridLineNum = 8;
        let gridWidth = cc.instantiate(this.monster).width
        let gridIntervalX = Math.floor((size.width - gridLineNum*gridWidth ) / gridLineNum);
        this.monsterPos = [] ;
        var e = -Math.floor(gridLineNum / 2) * (gridWidth + gridIntervalX);
        for (let index = 0; index < gridLineNum; index++) {
            var a = e + index * (gridIntervalX + gridWidth) + gridWidth;  
            this.monsterPos.push({x:a,y:0}) 
        }
    },
    //根据手指计算炮塔角度
    setAimdegree(touchPos){ 
        let posLayer = this.posLayer 
        let amiPos = Utils.worldConvertLocalPointAR(posLayer,touchPos);
        for (let index = 0; index < 5; index++) {
            const itemCtrl = this.modelCtrls[index];  
            var script = itemCtrl.getComponent("role");
            script.setHeadAngle(amiPos);  
        }
    }, 

     //根据手指计算炮塔角度
     setAimdegreeZero(){   
        for (let index = 0; index < 5; index++) {
            const itemCtrl = this.modelCtrls[index];
            var script = itemCtrl.getComponent("role");
            script.setHeadAngleZero(); 
        }
    },
  
    //创建手指指向弹道方向
    onShotPos(){
        let gameLayer = this.gameLayer;
        let aimNode = gameLayer.find("Aim"); 
        var self = this; 
        gameLayer.on(cc.Node.EventType.TOUCH_START,function(e){ 
            self.tipTime =  0;
            var pos = e.getLocation()  
            pos = Utils.worldConvertLocalPointAR(gameLayer,pos);
            aimNode.x = pos.x; 
            aimNode.y = pos.y;   
            aimNode.active = true; 
            self.setAimdegree(e.getLocation()); 
        });

        gameLayer.on(cc.Node.EventType.TOUCH_MOVE,function(e){ 
            var pos = e.getLocation()  
            pos = Utils.worldConvertLocalPointAR(gameLayer,pos);
            aimNode.x = pos.x; 
            aimNode.y = pos.y;   
            aimNode.active = true; 
            self.setAimdegree(e.getLocation()); 
        });

        gameLayer.on(cc.Node.EventType.TOUCH_END,function(e){  
            self.setAimdegreeZero(); 
            aimNode.active = false; 
        });
  
        gameLayer.on(cc.Node.EventType.TOUCH_CANCEL,function(e){ 
            self.setAimdegreeZero(); 
            aimNode.active = false; 
        });
    },

    //创建合成初始化位置
    onCreateMergePos(){ 

        //默认初始化位置数据  
        this.gridLineNum = 5;
        this.gridRowNum = 3;
        this.gridWidth = 200; 
        let posLayer = this.posLayer; 
        let gameLayer = this.gameLayer;
        let aimNode = gameLayer.find("Aim");
        posLayer.getComponent(cc.Widget).updateAlignment()  
        let size = posLayer.getContentSize()
        this.gridIntervalX = Math.floor((size.width - this.gridLineNum*this.gridWidth) / this.gridLineNum);
        this.gridIntervalY = Math.floor((size.height - this.gridRowNum*this.gridWidth) / this.gridLineNum);
        this.modelCtrls = new Array(15);
        var x = 0,y = 0; 
        var e = -Math.floor(this.gridLineNum / 2) * (this.gridWidth + this.gridIntervalX), 
        t = Math.floor(this.gridRowNum/2)  * (this.gridWidth + this.gridIntervalY);  
        //记录旧位置
        var oldPos = {
            x: 0,
            y: 0
        } 
        let petList = _G.IPlayer.getKey("pet").list;   
        for(var i = 0 ; i < this.modelCtrls.length ; i++)
        {  
            var role = cc.instantiate(this.rolePre); 
            role.parent = posLayer; 
            role.name = "plant"+i;

            
            var dizuo = cc.instantiate(this.dizuo); 
            dizuo.parent = posLayer;
            dizuo.zIndex = -100+i; 
            dizuo.getComponent("SpriteEx").index = i < 5 ? 0 : 1; 

            this.modelCtrls[i] = role ;  
            var a = e + x % 5 * (this.gridIntervalX + this.gridWidth)
            , r = t - y * (this.gridIntervalY + this.gridWidth);
            if(i < 5){
                r = r+15;
            }

            dizuo.x = a;
            dizuo.y = r;
            role.x = a; 
            role.y = r;
            x++;
            if(x%5 == 0) y++;
            let itemCtrl = this.modelCtrls[i];  
            itemCtrl.srcPosition = {
                x: itemCtrl.x,
                y: itemCtrl.y
            }
            itemCtrl.level = petList[i].level;
            let script = itemCtrl.getComponent("role");
            script.init(aimNode,gameLayer);
            script.slot = i;
            itemCtrl.slot = i; 
            script.setModel(itemCtrl.level);
            script.setBox();
            var cloneCtrl = null
            itemCtrl.on(cc.Node.EventType.TOUCH_START,function(e){
                if (itemCtrl.level > 0) {
                    oldPos.x = e.currentTouch._point.x
                    oldPos.y = e.currentTouch._point.y
                    if(cloneCtrl){
                        cloneCtrl.destroy()
                    } 
                    cloneCtrl = cc.instantiate(itemCtrl)
                    cloneCtrl.parent = itemCtrl.parent;
                    cloneCtrl.position = itemCtrl.position
                    cloneCtrl.find("dizuo").active = false
                    itemCtrl.getComponent("role").isDrag = true;
                    //高亮
                    for (var j = 0; j < this.modelCtrls.length; ++j) { 
                        if (this.modelCtrls[j] != itemCtrl && this.modelCtrls[j].level == itemCtrl.level) { 
                            cc.find("donghua", this.modelCtrls[j]).active = true;
                            this.modelCtrls[j].getComponent("role").tipMc(true);
                        }
                    } 
                }
                     
            }.bind(this));

            itemCtrl.on(cc.Node.EventType.TOUCH_MOVE, function(e){
                if (cloneCtrl && itemCtrl.level > 0) {
                    cloneCtrl.x += e.currentTouch._point.x - oldPos.x
                    cloneCtrl.y += e.currentTouch._point.y - oldPos.y
                    oldPos.x = e.currentTouch._point.x
                    oldPos.y = e.currentTouch._point.y
                } 
            }.bind(this))
 
            itemCtrl.on(cc.Node.EventType.TOUCH_END,function(e){
                if (cloneCtrl && itemCtrl.level > 0) { 
                    var target = null
                    for (var j = 0; j < this.modelCtrls.length; ++j) {
                        if (this.modelCtrls[j] != itemCtrl) {
                            var x = this.modelCtrls[j].x - cloneCtrl.x
                            var y = this.modelCtrls[j].y - cloneCtrl.y
                            var dis = Math.sqrt(x * x + y * y)
                            if (dis < 100) {
                                target = this.modelCtrls[j]
                                break
                            }
                        }
                    }
                    //查找是否合并
                    if (target) {
                        if (itemCtrl.level == target.level) {
                            this.drag2Combine(itemCtrl, target)
                        } else {
                            this.drag2Move(itemCtrl, target)
                        }
                    } else {
                        //检查是否是在售卖 
                        var x = this.sellCtrl.parent.x + this.sellCtrl.x - (cloneCtrl.parent.x + cloneCtrl.x);
                        var y = this.sellCtrl.parent.y + this.sellCtrl.y - (cloneCtrl.parent.y + cloneCtrl.y);
                        var dis = Math.sqrt(x * x + y * y)
                        if (dis < 100) {
                            this.drag2Sell(itemCtrl)
                        } else {
                            itemCtrl.x = itemCtrl.srcPosition.x
                            itemCtrl.y = itemCtrl.srcPosition.y
                            itemCtrl.getComponent("role").isDrag = false;
                        }
                       
                    } 
                    cloneCtrl.destroy()
                    cloneCtrl = null;
                    for (var j = 0; j < this.modelCtrls.length; ++j) {
                        cc.find("donghua", this.modelCtrls[j]).active = false
                        this.modelCtrls[j].getComponent("role").tipMc();
                    }
                }
            }.bind(this))

            itemCtrl.on(cc.Node.EventType.TOUCH_CANCEL,function(e){
                if (cloneCtrl && itemCtrl.level > 0) {
                    var target = null
                    for (var j = 0; j < this.modelCtrls.length; ++j) { 
                        if (this.modelCtrls[j] != itemCtrl) {
                            var x = this.modelCtrls[j].x - cloneCtrl.x
                            var y = this.modelCtrls[j].y - cloneCtrl.y
                            var dis = Math.sqrt(x * x + y * y)
                            if (dis < 100) {
                                target = this.modelCtrls[j]
                                break
                            }
                        }
                    }
                    if (target) {
                        if (itemCtrl.level == target.level) {
                            this.drag2Combine(itemCtrl, target) 
                        } else {
                            this.drag2Move(itemCtrl, target)
                        }
                    } else { 
                        var x = this.sellCtrl.parent.x + this.sellCtrl.x - (cloneCtrl.parent.x + cloneCtrl.x);
                        var y = this.sellCtrl.parent.y + this.sellCtrl.y - (cloneCtrl.parent.y + cloneCtrl.y);
                        var dis = Math.sqrt(x * x + y * y)
                        if (dis < 100) {
                            this.drag2Sell(itemCtrl)
                        } else {
                            itemCtrl.x = itemCtrl.srcPosition.x
                            itemCtrl.y = itemCtrl.srcPosition.y
                            itemCtrl.getComponent("role").isDrag = false;
                        } 
                    }
                    cloneCtrl.destroy()
                    cloneCtrl = null;
                  
                    for (var j = 0; j < this.modelCtrls.length; ++j) {
                        cc.find("donghua", this.modelCtrls[j]).active = false;
                        this.modelCtrls[j].getComponent("role").tipMc();
                    }
                
                }
            }.bind(this))
        }  
    }, 

    //合并动画
    onCombineMc(slotB,slotA,isAdUp){

        let levelA = _G.IPlayer.getPetLevel(slotA);
        let itemCtrl =  this.modelCtrls[slotA];
        let script = itemCtrl.getComponent("role");
        script.setModel(levelA);


        let levelB = _G.IPlayer.getPetLevel(slotB);
        let itemCtrlB =  this.modelCtrls[slotB];
        let scriptB = itemCtrlB.getComponent("role");
        if(isAdUp){
            scriptB.setModel(0)
        }else{
            scriptB.onMergeMc(levelB);     
        }
    },

    test(slotB){ 
         let levelB = _G.IPlayer.getPetLevel(slotB);
        let itemCtrlB =  this.modelCtrls[slotB];
        let scriptB = itemCtrlB.getComponent("role");
        scriptB.onMergeMc(levelB); 
    },


    /**
     * 用于恢复拖拽的角色恢复
     */
    setDargItemContrl(itemCtrl){
        this.dragItemCtrl = itemCtrl; 
    },

    resumDargItemContrl(){
        if(this.dragItemCtrl){
            this.dragItemCtrl.getComponent("role").isDrag = false;
            this.dragItemCtrl = null;
        }
    },


    drag2Combine(itemCtrl1, itemCtrl2){
        _G.AudioMgr.playComBine();
        this.setDargItemContrl(itemCtrl1);
        cc.find("donghua", itemCtrl1).active = false;
        cc.find("donghua", itemCtrl2).active = false; 
        Utils.http(_G.MESSAGE.PET_MERGE,{indexs:[itemCtrl2.slot,itemCtrl1.slot]});   
    },

    drag2Move(itemCtrl1, itemCtrl2){
        AppLog.log("移动{0} ：{1}".format(itemCtrl1.slot,itemCtrl2.slot))
        let info = _G.IPlayer.getKey("pet").list[itemCtrl2.slot];
        if(info.type == 2){
            itemCtrl1.y = itemCtrl1.srcPosition.y;
            itemCtrl1.x = itemCtrl1.srcPosition.x;
            itemCtrl1.getComponent("role").isDrag = false;
            Tools.playSound("RELEASE");
            itemCtrl2.getComponent("role").setBox();
            return;
        } 
        AppLog.log("移动{0} {1}".format(itemCtrl1.slot, itemCtrl2.slot)) 
        Utils.http(_G.MESSAGE.PET_SWAP_POS,{indexs:[itemCtrl1.slot,itemCtrl2.slot]});
        Tools.playSound("RELEASE");
    },

    refreshModel: function (slots) {
        if(!slots){slots=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]}
        for (var i in slots) {
            var slot = slots[i]
            var level = _G.IPlayer.getPetLevel(slot);
            AppLog.log("位置{0} 等级{1}".format(slot,level));
            //这个对等级赋值
            var itemCtrl = this.modelCtrls[slot]
            if(itemCtrl== null){
                console.log("slot",slot)
            }
            let script = itemCtrl.getComponent("role");
            itemCtrl.getComponent("role").isDrag = false; 
            itemCtrl.level = level; 
            script.setModel(itemCtrl.level); 
        }
    }, 
    drag2Sell(itemCtrl){ 
        _G.AudioMgr.playSell();
        AppLog.log("删除",itemCtrl.slot) 
        PopMgr.createPop("popSellTip",{level:itemCtrl.level,slot:itemCtrl.slot})
    },
   
    //发射怪物
    onShotMonster(){ 
       let gameLayer = this.gameLayer
       let randomArray = _G.AppDef.randomArray;
       let random = Utils.getRandom(randomArray.length-1,0);
       //获取称号
       let rank = _G.IPlayer.getKey("rank");
       let titleInfo = _G.CfgMgr.getConfig("title",rank)
       let levelInfo = _G.CfgMgr.getConfig("level",titleInfo.level)  
       let posArr = randomArray[random];  
       for (let index = 0; index < posArr.length; index++) {
            let monster = null;
            this.seq += 1;
            if (this.monsterPool.size() > 0) {
                monster = this.monsterPool.get();  
            } else {
                monster = cc.instantiate(this.monster); 
            }  
            monster.name = "monster"+this.seq;
            this.monsterCtrls.push(monster); 
            let monsterId = levelInfo.monster[Utils.getRandom(levelInfo.monster.length-1,0)];
            let pos = this.monsterPos[posArr[index]];  
            monster.x = pos.x + Utils.getRandom(20,0); 
            monster.zIndex = 10000 - this.seq;
            monster.y = pos.y + gameLayer.height/2 + 100;
            monster.parent = gameLayer; 
            monster.getComponent("monster").run(this,levelInfo.hp,monsterId, levelInfo.speed);
       }
    },

    /**
     * 击杀剩下怪物
     */
    killAllMonster(){
        this.seq = 0;
        this.mTime = -5; //停留5秒 在出怪
        //杀死剩下的怪物总数
        let totalMoney = this.monsterCtrls.length * this.levelConfig.coin; 
        for (let index = 0; index < this.monsterCtrls.length; index++) {
            const monster = this.monsterCtrls[index];
            monster.getComponent("monster").dead(true);
        }  
        Utils.http(_G.MESSAGE.UPDATE_BANK,{money:totalMoney}); 
        let targetNode = this.node.find("topLayer/btnLayer/bth_cqg");
        wheen(targetNode).wait(200).setFlag("loop").to({rotation:-10},300).to({rotation:10},300).loop(4,"loop").on("finish",()=>{
            targetNode.rotation = 0;
        }).start();
        this.isComeInPlayed = true; 
    },


    //一波僵尸入场
    playMosterComeIn(){ 
        if(this.isComeInPlayed == false) return;
        this.isComeInPlayed = false; 
        Tools.playSound("COMEIN");
    },
    
    
    sunMc(node){
        let targetNode = this.topLayer.find("di-t/top-dik-t/Sunshine");
        //僵尸世界坐标
        let sun
        if (this.sunPool.size() > 0) {
            sun = this.sunPool.get();  
        } else {
            sun = cc.instantiate(targetNode); 
        }   
        let jsP = Utils.localConvertWorldPointAR(node);
        jsP = Utils.worldConvertLocalPointAR(targetNode.parent,jsP)
        sun.parent = this.topLayer
        sun.x = jsP.x - node.width/2 
        sun.y = jsP.y-200; 
        //掉落的太阳世界坐标
        let sunp = Utils.localConvertWorldPointAR(sun);
        //终点太阳世界坐标
        let targetP = Utils.localConvertWorldPointAR(targetNode);   
        targetP = Utils.worldConvertLocalPointAR(this.topLayer,targetP)  
        wheen(sun)
        .to({x:sun.x, y:sun.y -100},300,Wheen.Easing.Linear)
        .wait(500) 
        .to({x:targetP.x, y:targetP.y},350,Wheen.Easing.Linear)
        .on("finish",()=>{
            this.sunPool.put(sun);
            this.updateMoney();
        })
        .start(); 
    },

    /**
     * 去存钱罐
     * @param {} node 
     */
    gotoRedMc(node){ 
        let targetNode = this.node.find("topLayer/btnLayer/bth_cqg");
        //僵尸世界坐标
        let sun = null;
        if (this.sunPool.size() > 0) {
            sun = this.sunPool.get();  
        } else {
            sun = cc.instantiate( this.topLayer.find("di-t/top-dik-t/Sunshine") ); 
        }   
        let jsP = Utils.localConvertWorldPointAR(node);
        jsP = Utils.worldConvertLocalPointAR(this.topLayer,jsP)
        let parentNode = this.node.find("baseNode");
        sun.parent = this.topLayer
        sun.x = jsP.x;
        sun.y = jsP.y;
        //掉落的太阳世界坐标
        let sunp = Utils.localConvertWorldPointAR(sun);
        //终点太阳世界坐标
        let targetP = Utils.localConvertWorldPointAR(targetNode);  
        targetP = Utils.worldConvertLocalPointAR(this.topLayer,targetP)  
        wheen(sun)
        .to({x:sun.x, y:sun.y},300,Wheen.Easing.Linear)
        .wait(500) 
        .to({x:targetP.x, y:targetP.y},200,Wheen.Easing.Linear)
        .on("finish",()=>{
            this.sunPool.put(sun);
            this.updateMoney();
        })
        .start(); 
    },
    
    /**
     * 出售植物后表现动画
     */
    sellMc(){ 
        let node = this.node.find("baseNode/menuLayer/btnSell");
        let targetNode = this.topLayer.find("di-t/top-dik-t/Sunshine");
        for (let index = 0; index < 6; index++) {
            let sun
            if (this.sunPool.size() > 0) {
                sun = this.sunPool.get();  
            } else {
                sun = cc.instantiate(targetNode); 
            }
            let jsP = Utils.localConvertWorldPointAR(node);
            jsP = Utils.worldConvertLocalPointAR(this.topLayer,jsP)
            sun.parent = this.topLayer
            sun.x = jsP.x + 20 ;
            sun.y = jsP.y; 
            //掉落的太阳世界坐标
            let sunp = Utils.localConvertWorldPointAR(sun);
            //终点太阳世界坐标
            let targetP = Utils.localConvertWorldPointAR(targetNode);  
            let finalPos = Utils.worldConvertLocalPointAR(this.topLayer,targetP)
            let sunX = sun.x + Utils.getRandom(15,-15)
            wheen(sun).wait(index*20)
            .to({x:sunX , y:sun.y},300,Wheen.Easing.Linear)
            .wait(index*50) 
            .to({x:finalPos.x, y:finalPos.y},200,Wheen.Easing.Linear)
            .on("finish",()=>{
                this.sunPool.put(sun);
                this.updateMoney();
            }).start(); 
        } 
    },

    //回收子弹
    collectBullet(bullet) { 
        this.bulletPool.put(bullet);
    },
 
     /**
      * 回收怪物
      * @param {*} monster 
      * @param {是否越过自杀线} isAutokill 
      */
     collectMonster(monster,isAutokill){ 

        //非自杀的怪物才能加经验 
        if(!isAutokill){
            _G.AppDef.KILL_MONSTER_TOTAL_NUM += 1;
            this.checkMonsterDieByBox();
            this.setDuanWeiExp(this.levelConfig.coin); 
            _G.IPlayer.addMoney(this.levelConfig.coin); 
            this.sunMc(monster);
        } else{
            this.gotoRedMc(monster);
        }

        let length = this.monsterCtrls.length;
        for (let index = 0; index < length; index++) {
            if(this.monsterCtrls[index] == monster){ 
                this.monsterCtrls.splice(index,1);
            }
        }
        this.monsterPool.put(monster);
    },

    //刷新UI
    updateUI(){
        this.updateMoney();
        this.setQuickUi(); 
    },

    updateMoney(){
        cc.setText( this.topLayer.find2("di-t/top-dik-t/lb_coin"), Tools.getCompany(_G.IPlayer.getKey("money") || 0, 2));
        cc.setText( this.node.find2("topLayer/diamond_bg/lb_diamond"),_G.IPlayer.getKey("diamond"));
    },

     
    // called every frame
    update: function (dt) { 

        //暂停
        if(_G.AppDef.PAUSE_GAME) return;
        //新手指引不发射
        if(_G.IPlayer.getKey("guide") < 6) return;

        this.tipTime +=dt; 
        this.mTime += dt;
        this.atuoDtime += dt;
          
       
        if(this.mTime > this.gapSpeed  ){
            this.mTime = 0; 
            this.playMosterComeIn();
            this.onShotMonster();
        }
         

        //自动合并 
        if(_G.AppDef.AUTO_MERGE_TIME > 0 ){
            _G.AppDef.AUTO_MERGE_TIME -= dt;
        } 
        if(this.atuoDtime > 0.2){
            this.atuoDtime = 0
            if(_G.AppDef.AUTO_MERGE_TIME > 0 ){
                let pop = PopMgr.getPopSize() 
                if(pop) return;  
                this.setAutoMgrgeBuff();
                this.autoMerge();
            }else{
                this.gameLayer.find("buffLayer/icon_merge").active = false; 
            }  
        }

        //自动提示
        // if(this.tipTime > this.tipMaxTime){
        //     this.tipTime = 0;
        //     this.autoTip(); 
        // }

        Tools.autoSyncMoney();
        
        this.checkMonsterWarn(); 
    }, 
    
    //检查警告线
    checkMonsterWarn(){ 
        let monster = this.monsterCtrls[0];
        if(!monster) return this.warnWall(false);
        let gameLayer = this.gameLayer 
        let gapY = -gameLayer.height >> 1
        let dieWall = gameLayer.find("dieWall");
        if((dieWall.y - monster.y ) > gapY  && dieWall.active == false){
            this.warnWall(true);   
        }
    }, 

    onAddBuyPet(petLv,index){ 
        var itemCtrl = this.modelCtrls[index]; 
        Tools.playSound("ADDPLANT");
        //通知过来直接添加 无需表现
        if(itemCtrl == null){  return; console.log("出错了"+index)} 
        let script = itemCtrl.getComponent("role"); 
        script.onAddMc(petLv);
    },

    /**
     * 自动提示
     */
    autoTip(){
        let mergeArr = this.getCanMerge();
        if(!mergeArr) return; 
        for (let index = 0; index < 2; index++) {
            const itemCtrl = mergeArr[index]; 
            itemCtrl.getComponent("role").tipMc(true);
        }
    },
 
     /**
      *   自动合并 
      *   查找最小等级 依次往上合并
      * 
      * */
    autoMerge(){
        let mergeArr = this.getCanMerge();
        if(!mergeArr) return;  
        if(this.autoMergeing) return;
        this.autoMergeing = true;
        let itemCtrl1 = mergeArr[0];
        let itemCtrl2 = mergeArr[1]; 
        cc.find("paota", itemCtrl1).active = false;
        let autoCloneCtrl = cc.instantiate(cc.find("paota", itemCtrl1)) 
        autoCloneCtrl.scale = 0.7;  
        autoCloneCtrl.active = true;
        autoCloneCtrl.parent =  itemCtrl1.parent;
        autoCloneCtrl.x = itemCtrl1.position.x;
        autoCloneCtrl.y = itemCtrl1.position.y + cc.find("paota", itemCtrl1).y;  
        let slef = this;
        wheen( autoCloneCtrl)
        .to({x:itemCtrl2.x,y: itemCtrl2.y + cc.find("paota", itemCtrl2).y },200,Wheen.Easing.Linear)
        .on("finish",()=>{
            autoCloneCtrl.destroy();
            slef.drag2Combine(itemCtrl1, itemCtrl2);  
        }).start(); 
    },
     
    //查找可以合成的
    getCanMerge(){
        //直接统计
        let dict = {}; 
        let maxMargeLevel = _G.CfgMgr.getSysConfig("13");
        //排除前排5个
        for (let index = 5; index < 15; index++) {
            const itemCtrl = this.modelCtrls[index];
            let level = _G.IPlayer.getPetLevel(itemCtrl.slot)
            if(level <= 0) continue;
            if(level >= maxMargeLevel) continue;
            if(!dict[level]){
                dict[level] = []
            }
            dict[level].push(itemCtrl); 
        }
        //从最小的自动开始合并
        let mergeArr = null;
        let sort = Object.keys(dict);
        for (let i = 0; i < sort.length; i++) {
            const element = dict[sort[i]];
            if(element && element.length >= 2) {
                mergeArr = element; 
                break;
            } 
        }
        return mergeArr;
    },

    //设置推荐等级和价格
    setQuickUi(){
        //自己等级
        var pet = _G.IPlayer.getKey("pet");
        var quickInfo = pet.qk;
        if(!quickInfo)return; 
        cc.setText(this.node.find("baseNode/menuLayer/mn_anniu12/lb_useMoney"),Tools.getCompany(quickInfo.money,2));
        let spNode = this.node.find("baseNode/menuLayer/mn_anniu12/icon-di1") 
     
        let config =  _G.CfgMgr.getConfig("plant",quickInfo.level)
        let url = "prefabs/plant/{0}".format(config.model);  
        cc.createPrefab(url,(error, node)=>{
            if(error)return;  
            if(spNode.sp){
                spNode.sp.destroy();
                spNode.sp = null;
            }
            node.parent = spNode;  
            spNode.sp = node;
            node.scale = 0.7;
            cc.setText(node.find("biaoq-di/label"),quickInfo.level)
            let spine = node.find2("sp",sp.Skeleton)  
            spine.setAnimation(0, 'idle',true); 
        })  
    },

    playOffLineMc(){
        let targetNode = this.topLayer.find("di-t/top-dik-t/Sunshine") ;
        for (let index = 0; index < 10; index++) { 
            let sun = null;
            if (this.sunPool.size() > 0) {
                sun = this.sunPool.get();  
            } else {
                sun = cc.instantiate( targetNode ); 
            }    
            sun.parent = this.topLayer
            sun.x = 0;
            sun.y = -cc.winSize.height/2;
            let targetP = Utils.localConvertWorldPointAR(targetNode);   
            targetP = Utils.worldConvertLocalPointAR(this.topLayer,targetP) 
            let y  = 50
            let x  = 20
            let x_top = sun.x + (index%2 == 0 ? -x : x)
            let y_top = sun.y + y 
            let x_end  = x_top * 2;
            let y_end  = sun.y
            sun.opacity = 0;
            wheen(sun)
            .wait(index* 100)
            .to({opacity:255},0)
            .to({x:x_top,y:y_top},500,Wheen.Easing.Quint.easeOut)
            .to({x:x_end,y:y_end},500,Wheen.Easing.Quint.easeOut)
            .wait(300) 
            .to({x:targetP.x,y:targetP.y},300,Wheen.Easing.Linear)
            .on("finish",()=>{
                this.sunPool.put(sun);
                this.updateMoney();
            })
            .start();  
        } 
    } , 

    //刷新主界面菜单红点
    refenceRedPoint(){ 
        this.topLayer.find("btnLayer/bth_cqg/dot-hong").active = _G.RedDotMgr.checkBank();
        this.topLayer.find("btnLayer/bth_qd/dot-hong").active = _G.RedDotMgr.checkIsSignIn();
        this.topLayer.find("btnLayer/bth_turn/dot-hong").active = _G.RedDotMgr.checkTurn();
        this.topLayer.find("btnLayer/bth_task/dot-hong").active = _G.RedDotMgr.checkTask(); 
        this.topLayer.find("btnLayer/bth_free/dot-hong").active = _G.RedDotMgr.checkFreeZuanShi();
        this.topLayer.find("btnLayer2/bth_work/dot-hong").active = _G.RedDotMgr.checkWork();
        this.topLayer.find("btnLayer3/bth_wallet/dot-hong").active = _G.RedDotMgr.checkRedPack();

    }, 
    
    /**
     * 控制打怪获得 击杀多少怪物
     * 可检查是否获得宝箱
     */
    checkMonsterDieByBox(){
        if(this.maxPlantLv != _G.IPlayer.getKey("pet").maxLevel ){
            this.maxPlantLv = _G.IPlayer.getKey("pet").maxLevel;
            this.random = Tools.getRandomBox();
        }
        if(_G.AppDef.KILL_MONSTER_TOTAL_NUM >= this.random){
            Utils.http(_G.MESSAGE.GET_BOX); 
        }  
    },

    dropBoxByRole(site,boxId){ 
       let boxInfo = _G.CfgMgr.getConfig("box",boxId);
       let box = null;
        if (this.boxPool.size() > 0) {
            box = this.boxPool.get();  
        } else {
            box = cc.instantiate(this.box); 
        } 
        let posList =  _G.IPlayer.getKey("pet").list;
        let info = posList[site];
        let targetNode =  this.modelCtrls[site];
        box.getComponent("SpriteEx").index =  info.id - 1;
        box.parent = this.posLayer;  
        box.y  = cc.winSize.height
        box.x  = targetNode.x 
        wheen(box).to({x:targetNode.x,y:targetNode.y},1000).on("finish",()=>{
            this.boxPool.put(box); 
            let script = targetNode.getComponent("role");
            script.setBox();
        }).start(); 
    },


    /**
     * 设置buff
     */
    setAddSpeedBuff(){
        let buffLayer = this.gameLayer.find("buffLayer/icon_mp"); 
        if(_G.AppDef.ADD_SPEED_TIME > 0){
            buffLayer.active = true;
            cc.setText(buffLayer.find("djsLab"),Tools.addPreZeroEx(_G.AppDef.ADD_SPEED_TIME))
        }
    },

    /**
     * 设置合并buff
     */
    setAutoMgrgeBuff(){
        let buffLayer = this.gameLayer.find("buffLayer/icon_merge"); 
        if(_G.AppDef.AUTO_MERGE_TIME > 0){
            buffLayer.active = true;
            cc.setText(buffLayer.find("djsLab"),Tools.addPreZeroEx(_G.AppDef.AUTO_MERGE_TIME))
        }
    }, 

});