let async = require('async');
let GodGuide = cc.Class({
    extends: cc.Component,

    properties: {
        FINGER_PREFAB: cc.Prefab,   //手指提示
        TEXT_PREFAB: cc.Prefab,     //文本提示
    },

    statics: {
        find(path, cb) {
            let root = cc.find('Canvas');
            locator.locateNode(root, path, cb);
        },
    },

    onLoad () {
        this.init();
    },

    start () {
       
    },


    init() {
        this.node.setContentSize(cc.winSize);
        //创建手指提示
        this._targetNode = null;
        if (this.FINGER_PREFAB) {
            this._finger = cc.instantiate(this.FINGER_PREFAB);
            this._finger.parent = this.node;
            this._finger.active = false;
        }

        //创建文本提示
        if (this.TEXT_PREFAB) {
            this._text = cc.instantiate(this.TEXT_PREFAB);
            this._text.parent = this.node;
            this._text.active = false;
        }
 
        //获取遮罩组件 
        this._mask = this.node.getComponentInChildren(cc.Mask);
        this._mask.inverted = true;
        this._mask.node.active = false;

        //监听事件
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => { 
            //特殊不需要拦截
            if(this.moveTarget){   
                if (this.tempRect.contains(event.getLocation())) {
                    this.node._touchListener.setSwallowTouches(false);
                    //cc.log('命中目标节点，放行');
                } else { 
                    let pop = PopMgr.getPop("popUnLock")
                    if(pop){
                        PopMgr.closePop("popUnLock",true);
                    }
                    this.node._touchListener.setSwallowTouches(true);
                    //cc.log('未命中目标节点，拦截');
                }
                return;
            }  
             //放行
             if (!this._mask.node.active) {
                this.node._touchListener.setSwallowTouches(false);
                return;
            }

            //目标节点不存在，拦截
            if (!this._targetNode) {
                this.node._touchListener.setSwallowTouches(true);
                return;
            }

            //防止指引商店有红包弹窗
            if(_G.IPlayer.getKey("guide")  == 10){
                PopMgr.closePop("popRedPackRet"); 
                PopMgr.closePop("popRedPack"); 
            } 

             //目标区域存在，击中放行
             let rect = this._targetNode.getBoundingBoxToWorld();
             if (rect.contains(event.getLocation())) {
                 this.node._touchListener.setSwallowTouches(false);
                 //cc.log('命中目标节点，放行');
             } else {
                 this.node._touchListener.setSwallowTouches(true);
                // cc.log('未命中目标节点，拦截');
             }  
        });
    },


    setTask(task) {
        if (this._task) {
            cc.warn('当前任务还未处理完毕！');
            return;
        } 
        this._task = task;
    },

    getTask() {
        return this._task;
    },

    run(callback) {
        if (!this._task) {
            return;
        } 
        async.eachSeries(this._task.steps, (step, cb) => {
            this._processStep(step, cb);
        }, () => {
            this._task = null;
            this._mask.node.active = false;
            if (this._finger) {
                this._finger.active = false;    
            } 
            if (callback) {
                callback();
            }
        });
    },

    _processStep(step, callback) {
        async.series({
            //任务开始
            stepStart(cb) {
                if (step.onStart) {
                    step.onStart(() => { cb() });
                } else {
                    cb();
                }
            },

            //任务指令
            stepCommand: (cb) =>  {
                this._mask.node.active = this._task.mask || true;
                this.scheduleOnce(() => {
                    this._processStepCommand(step, () => {
                        cb();
                    });
                }, step.delayTime || 0);  
            },

            //任务结束
            taskEnd: (cb) => {
                this._mask._graphics.clear();
                this._finger.active = false;
                this._text.active = false;
                let task = this.getTask() 
                if(task){
                    Utils.http(_G.MESSAGE.GUIDE,{guide:step.id});
                }
                if(task && step.id >= task.steps.length && task.type == "mainGuide"){
                    SDKMgr.guideEndEvent();
                }
                if (step.onEnd) {
                    step.onEnd(() => { cb() });
                } else {
                    cb();
                }   
              
            },
        }, (error) => { 
            AppLog.log(`步骤【${step.desc}】结束！`);
            callback();
        })
    },

      /**
     * 处理步骤指令
     * @param {*} step 
     * @param {*} cb 
     */
    _processStepCommand(step, cb) { 
        let root = cc.find('Canvas'); 
        let args = step.command.args;
        let rect2,rect,plant0,plant1,p2,p,arrNode,node
        Wheen.stop(this._finger)

        //设置指引文字
        if(step.desc){
            cc.setText(this._text.find("lb_txt"),step.desc);
            this._text.active = true;
            if( step.txtStyle){
                this._text.y =   step.txtStyle.y || 0
                this._text.x =   step.txtStyle.x || -125
            }else{
                this._text.y =  0;
                this._text.x = -125;
            } 
        }

        this.tempRect = null;
        switch (step.command.cmd){ 
            //移动手指去合成
            case "movefinger": 
                arrNode = args.split(","); 
                plant0 = root.find(arrNode[0])
                plant1 = root.find(arrNode[1])  
                rect = plant0.getBoundingBoxToWorld(); 
                let posLayer =root.find("baseNode/posLayer") 
                this.tempRect =  posLayer.getBoundingBoxToWorld();
                p = this.node.convertToNodeSpaceAR(rect.origin);   
                rect.x = p.x;
                rect.y = p.y; 
                rect2 = plant0.getBoundingBoxToWorld();
                p2 = this.node.convertToNodeSpaceAR(rect2.origin);   
                rect2.x = p2.x;
                rect2.y = p2.y;    
                this._mask._graphics.clear(); 
                this._mask._graphics.fillRect(rect.x, rect.y, rect.width*2, rect.height); 
                this._targetNode = null;
                this.moveTarget = true; 
                this.fingerScrollToNode(plant0,plant1); 
                whevent.onOnce(_G.MESSAGE.PET_MERGE,()=>{ 
                    this.moveTarget = false;
                    cb();
                },this);
                break;
            case "moveTurret":
                node = root.find(args);
                if(!node){
                    return cb();
                } 
                this._targetNode = node; 
                this._focusToNode(node);
                this.tempRect = node.getBoundingBoxToWorld();
                this.moveTarget = true;

                //查找下面6个位置有东西的
                let list = _G.IPlayer.getKey("pet").list;
                let _seq = 5;
                for (let index = 5; index < list.length; index++) {
                    let pet = list[index];
                    if(pet.level <= 0) continue ; 
                    _seq = index;
                    break;
                }
                plant0 = root.find("baseNode/posLayer/plant{0}".format(_seq))
                plant1 = root.find("baseNode/posLayer/plant2")  
                this.fingerScrollToNode(plant0,plant1);  
                whevent.onOnce(_G.EVENT.GUIDE_PLANT_MOVE,()=>{
                    this._targetNode = null;
                    cb();
                },this);
                break;

                
            case "buyfinger": 
                //需要动态去找钻石节点
                //单个按钮指定去点击就算完成 
                let maxLevel = _G.IPlayer.getKey("pet").maxLevel;  
                let zslevel = maxLevel - _G.AppDef.BUY_DIAMOND_LIMIT;;
                args =  args.format(zslevel) 
                node = root.find(args);
                if(!node){ 
                    return cb();
                } 
                this._targetNode = node;
                this._focusToNode(node);
                this.moveTarget = null;
                this.fingerToNode(node,step)
                node.once(cc.Node.EventType.TOUCH_END, () => {
                   // cc.log('节点被点击');
                    this._targetNode = null;
                    cb();
                });  
                break;
                
            default:
                //单个按钮指定去点击就算完成
                node = root.find(args);
                if(!node){ 
                    return cb();
                } 
                this._targetNode = node;
                this._focusToNode(node);
                this.moveTarget = null;
                this.fingerToNode(node,step)
                node.once(cc.Node.EventType.TOUCH_END, () => {
                    cc.log('节点被点击');
                    this._targetNode = null;
                    cb();
                });  
                break;
        } 
    },
     /**
     * 手指动画 点击
     */
    fingerToNode(node,step) {  
        this._finger.active = true; 
        if(step && step.rotaton){
            this._finger.rotation = step.rotaton;
        }else{
            this._finger.rotation = 0;
        }

        if(step && step.scaleX){
            this._finger.scaleX = step.scaleX;
        }else{
            this._finger.scaleX = 1;
        }
 
        let p = this.node.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position)); 
        let duration = p.sub(this._finger.position).mag() / cc.winSize.height;
        this._finger.opacity = 0;
        Wheen.stop(this._finger)
        wheen(this._finger).to({x:p.x,y:p.y},duration).invoke(()=>{
            this._finger.opacity = 255;
        }).setFlag("loop").to({y:p.y+10},300).to({y:p.y-10},300).loop(-1,"loop").start();
    },

    /**
     * 手指滑动动画 滑动
     */
    fingerScrollToNode(node,node2 ) {  
        this._finger.active = true; 
        let p = this.node.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position)); 
        let p2 = this.node.convertToNodeSpaceAR(node2.parent.convertToWorldSpaceAR(node2.position)); 
        let duration = p.sub(this._finger.position).mag() / cc.winSize.height; 
        this._finger.opacity = 0;
        Wheen.stop(this._finger) 
        wheen(this._finger).to({x:p.x,y:p.y },duration).invoke(()=>{
            this._finger.opacity = 255;
        }).setFlag("loop").wait(300).to({x:p.x,y:p.y },700).to({x:p2.x,y:p2.y },700).loop(-1,"loop").wait(100).start();
    },

    //画出高亮
    _focusToNode(node) {
        this._mask._graphics.clear();
        let rect = node.getBoundingBoxToWorld();
        let p = this.node.convertToNodeSpaceAR(rect.origin);   
        rect.x = p.x;
        rect.y = p.y; 
        this._mask._graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        return rect;
    },

    /**
     * 
     * @param {钱包} node 
     */
    guideRedPack(node){ 
        if( this._redFinger) return
        this._redFinger = cc.instantiate(this.FINGER_PREFAB);
        this._redFinger.parent = node;
        this._redFinger.active = true; 
        let p = this._redFinger.position;  
        Wheen.stop(this._redFinger)
        wheen(this._redFinger).to({x:p.x,y:p.y},0.2).invoke(()=>{
            this._redFinger.opacity = 255;
        }).setFlag("loop").to({y:p.y+10},300).to({y:p.y-10},300).loop(-1,"loop").start();
        this._redFinger.once(cc.Node.EventType.TOUCH_END, () => { 
            this._redFinger.parent = null;
            whevent.event(_G.EVENT.OPEN_REDPACK);
        });  
    },
    

    guideDan(node){ 
        if(this._danFinger) return;
        this._danFinger = cc.instantiate(this.FINGER_PREFAB);
        this._danFinger.parent = node;
        this._danFinger.active = true; 
        this._danFinger.rotation = 90;
        let p = this._danFinger.position;  
        Wheen.stop(this._danFinger)
        wheen(this._danFinger).to({x:p.x,y:p.y},0.2).invoke(()=>{
            this._danFinger.opacity = 255;
        }).setFlag("loop").to({y:p.y+10},300).to({y:p.y-10},300).loop(-1,"loop").start();
        this._danFinger.once(cc.Node.EventType.TOUCH_END, () => {
            this._danFinger.parent = null;
            Wheen.stop(this._danFinger)
            whevent.event(_G.EVENT.OPEN_DAN);
        });
    },  

    onDestroy(){


    }

});

module.exports = GodGuide;