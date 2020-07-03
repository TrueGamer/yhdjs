/**
 * 协议
 */
cc.Class({
    extends: cc.Component,
 
    properties: {
         
    },

    setParams(params){
        this.params = params;
    },
 
    onFWXY(){
        cc.sys.openURL('https://game.kakayunnews.com/html/xieyi.html'); 
    },

    
    onYSZC(){
        cc.sys.openURL('https://game.kakayunnews.com/html/yinsi.html'); 
    },
 
    onZBSY(){
        cc.game.end();
    },

    onAgree(){ 
        _G.CfgMgr.setItem("isProto",true);
        if(this.params && this.params.call){
            PopMgr.closePop("popProto");
            this.params.call();
        }
    } 
});
