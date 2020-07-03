/**
 * 任务
 */

let TASK_CATEGORY = cc.Enum({
    TASK:1,
    ACHIEVEMENT:2
})


cc.Class({
    extends: cc.Component,

    properties: {
        cjChar:cc.Node,
        rwChat:cc.Node,
        cjBtn:cc.Node,
        rwBtn:cc.Node,
        taskScroller:cc.ScrollView,
        achieveScrollView:cc.ScrollView,
    },
 
    onLoad(){
        this.selectType = TASK_CATEGORY.TASK; 
        this.taskConfig = _G.CfgMgr.getConfigs("task")
        this.achieveConfig = _G.CfgMgr.getConfigs("achieve") 
    },

    start () {
        this.onSelectTab(null,1);
    },

    onSelectTab(e,type){  
        this.type  = type;
        switch (Number(type)) {
            case TASK_CATEGORY.TASK:
                this.cjBtn.getComponent("SpriteEx").index = 1;
                this.rwBtn.getComponent("SpriteEx").index = 0; 
                this.cjChar.getComponent("SpriteEx").index = 0; 
                this.rwChat.getComponent("SpriteEx").index = 1; 
                this.taskScroller.node.active = true; 
                this.achieveScrollView.node.active = false; 
                this.setTask();
                this.taskScroller.scrollToTop(0.1);
                break;
            case TASK_CATEGORY.ACHIEVEMENT: 
                this.cjBtn.getComponent("SpriteEx").index = 0;
                this.rwBtn.getComponent("SpriteEx").index = 1; 
                this.cjChar.getComponent("SpriteEx").index = 1; 
                this.rwChat.getComponent("SpriteEx").index = 0;
                this.taskScroller.node.active = false; 
                this.achieveScrollView.node.active = true; 
                this.setAchieve();  
                this.achieveScrollView.scrollToTop(0.1);
                break; 
            default:
                break;
        }  
        
    },

   switchType(){  
        var arrayList = []; 
        if(this.type == TASK_CATEGORY.TASK ){
            var dailyTaskRecord = _G.IPlayer.getKey("dailyTaskRecord"); 
            var dailyTask = _G.IPlayer.getKey("dailyTask");
            var data  = this.taskConfig;
            for (var key in data) { 
                var element = data[key];
                var item = Utils.copy(element)
                item.id = key;
                item.sort = dailyTaskRecord[key].state
                item.sort = item.sort == 2 ? 0: item.sort;
                arrayList.push(item);
            }   
            arrayList =  arrayList.sort(function(a,b){
                return a.sort - b.sort;
            })
        }else{ 
            var achievementRecord = _G.IPlayer.getKey("achievementRecord"); 
            for (var key in achievementRecord) { 
                var info = achievementRecord[key];
                if(info.state == 3) continue;
                var element = this.achieveConfig[info.id];
                var item = Utils.copy(element)
                item.id = info.id; 
                item.state = info.state;
                arrayList.push(item) 
            } 
            arrayList =  arrayList.sort(function(a,b){
                return b.state - a.state;
            })
        }  
        return arrayList;
    }, 

    setTask(){
        let script = this.taskScroller.getComponent("ScrollViewHelper");
        this.taskArr = this.switchType();
        script.resetData(this.taskArr ,(itemId, item, data)=>{
            let script = item.getComponent("taskItem");
            script.setInfo(data,itemId);
        })   
    },
    /**
     * 设置成就
     */
    setAchieve(){
        let script = this.achieveScrollView.getComponent("ScrollViewHelper");
        this.achieveArr = this.switchType();
        script.resetData(this.achieveArr ,(itemId, item, data)=>{
             let script = item.getComponent("achieveItem");
             script.setInfo(data,itemId);
        })
    },
    
    closePop(){
        PopMgr.closePop("popTask");
        whevent.event(_G.EVENT.CHECK_RED_DOT);
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

});
