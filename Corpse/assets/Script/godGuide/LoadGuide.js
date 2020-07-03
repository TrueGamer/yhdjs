/**
 * 多任务加载器
 */
let async = require('async');
cc.Class({
    extends: cc.Component,

    properties: {
        PREFAB: cc.Prefab, //预制件
        parent: cc.Node,   //预制件实例化后所在的父节点
        zIndex: 0,
        tasks: [cc.String],
    },
  
    onLoad () {
        if (!CC_EDITOR) {
            this.loadPrefab();
        }
    },

    loadPrefab() {
        try {
            let node = cc.instantiate(this.PREFAB);
            node.zIndex = this.zIndex;
            node.position = cc.v2(0, 0);
            //不持久化到编辑器
            node._objFlags = cc.Object.Flags.DontSave;
            node.parent = this.parent || this.node;
            this._godGuide = node.getComponent('GodGuide');
        }
        catch (error) {
            cc.error(this.PREFAB);
            cc.error(error);
        }
    },

    start () {  
       
    },
 
    runTask() {   
        async.eachSeries(this.tasks, (taskFile, cb) => { 
            let task = require(taskFile);
            let guideId = _G.IPlayer.getKey("guide"); 
            //主线强制引导需要修正步数，防止没引导完
            if(task.type == "mainGuide"){ 
                if(task){
                    task.steps = task.steps.slice(guideId ,task.steps.length); 
                }
                //历史原因没有7
                if(guideId == 6){
                    guideId = 8;
                    Utils.http(_G.MESSAGE.GUIDE,{guide:guideId});
                } 
            }  
            
            //判断是否还需要过滤升级段位指引
            if(task.type == "danUp"){ 
                if(guideId >= 9){
                    task.steps =[]
                }

                if(_G.IPlayer.getKey("rank") >= 2){
                    //修正指引 
                    if(guideId == 9){
                        guideId = 10;
                        Utils.http(_G.MESSAGE.GUIDE,{guide:10});
                    } 
                } 
            }

            //钻石购买
            if(task.type == "diamondBuy"){ 
                if(guideId >= 12){
                    task.steps =[]
                }
            } 
            this._godGuide.setTask(task);   
            this._godGuide.run(cb); 
        }, () => {
            cc.log('任务全部完成');
        });
    }
 
});
