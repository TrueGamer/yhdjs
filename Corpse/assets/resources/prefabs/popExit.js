/**
 * 离开提示框
 */
cc.Class({
    extends: cc.Component,

    properties: {
         
    },

    setParams(params){
        this.isSetPop = params.isSetPop; 
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () { 
        if(this.isSetPop){ 
            PopMgr.closePop("popSet",true);
            cc.setText(this.node.find("kuang/contentLab"),"确定退出登录？"); 
        }
    },
 

    onBtn(){ 
        whevent.event(_G.EVENT.REMOVELISTENER);
        if(this.isSetPop){ 
            _G.AppDef.IS_EXIT_LOGIN = true;
            PopMgr.closePop("popExit",true);
            cc.director.loadScene("loading"); 
        }else{
            PopMgr.closePop("popExit");
            cc.game.end();
        }
    },

    closePop(){
        PopMgr.closePop("popExit");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

    // update (dt) {},
});
