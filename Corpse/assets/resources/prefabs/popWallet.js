/**
 * 钱包
 */
 
cc.Class({
    extends: cc.Component,

    properties: {
        redPackLab:cc.Label,
        yueLab:cc.Label,
        btn:cc.Node,
    },

    setParams(params){
        this.call = params.call;
    },

    
    start () {
        if(  this.call ) {this.call();}
        this.updateInfo();
        ;let hongbao = _G.IPlayer.getKey("hongbao");
        if(hongbao.val > 0){
            _G.CfgMgr.setItem(_G.AppDef.UID+"isRedGuide",1);
        }
    },

    updateInfo(){
        let hongbao = _G.IPlayer.getKey("hongbao");
        this.redPackLab.string = hongbao.val
        this.yueLab.string ="{0}元".format( hongbao.balance );
    },


    onBtn(){
        PopMgr.createPop("popGetCash");
    },

 
    closePop(){
        PopMgr.closePop("popWallet");
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  
});
