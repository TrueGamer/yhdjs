/**
 * 打工
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView:cc.ScrollView,  
        djsLab:cc.Label,
        tipNameLab:cc.Label,
        proBar:cc.ProgressBar,  
        kongxianNode:cc.Node,
        proNode:cc.Node
    }, 
    onLoad () {
        let workingCfg = _G.CfgMgr.getConfigs("working");  
        this.workingArr = [];
        for (const key in workingCfg) { 
            const info = workingCfg[key];
            info.id = key;
            this.workingArr.push(info)
        }  
        this.updateInfo();
       
    },
  
    updateInfo(){ 
        //开始工作 
        let work = _G.IPlayer.getKey("work");  
        //暂时没有开始工作
        if(!work || work.id == 0 ){
            this.proNode.active = false;
            this.kongxianNode.active = true;
            return;
        }

        this.proNode.active = true;
        this.kongxianNode.active = false;

        this.info = _G.CfgMgr.getConfig("working",work.id); 
        this.tipNameLab.string = this.info.name; 
        let endTime = work.startTime + this.info.time;
        let curtime = Tools.getTime();
        this.djsTime = (endTime - curtime ) > 0  ? endTime - curtime : 0 ;
        this.proBar.progress = this.djsTime / this.info.time;
        if(this.djsTime <= 0){
            //应该领奖了  通知item刷新
            this.djsLab.string = Tools.addPreZero(0);
            this.proBar.progress  = 1;
        }else{  
            this.djsLab.string = Tools.addPreZero(this.djsTime);
            this.unschedule(this.djsTime,this);
            this.schedule(this.djsTimeCall,1); 
        }  
    },

    onUpdateInfo(){ 
        this.updateInfo();
    },


    djsTimeCall(){ 
        this.djsTime -= 1; 
        this.djsLab.string = Tools.addPreZero(this.djsTime);
        if(this.djsTime <= 0 ){
            this.unschedule(this.djsTimeCall,this);
            this.updateInfo();
        }
        this.proBar.progress = this.djsTime / this.info.time;
    },
 

    start () {  
        this.updateScroller();
    },


    updateScroller(){ 
        let script = this.scrollView.getComponent("ScrollViewHelper");
        script.resetData( this.workingArr ,(itemId, item, data)=>{
             let script = item.getComponent("workItem");
             script.setInfo(data,itemId);
        })
        this.scrollView.scrollToOffset(cc.v2(0, 0), 2);
    },

    closePop(){
        PopMgr.closePop("popWorking");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

});
