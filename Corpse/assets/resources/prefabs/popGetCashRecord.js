/**
 * 提现记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView:cc.ScrollView,  
        bg:cc.Node,
    },
 
    onLoad () {
        Utils.http(_G.MESSAGE.GET_MONEY_RECORD);
        this.bg.on(cc.Node.EventType.TOUCH_END,()=>{
            this.closePop();
        },this)
    },

    start () {

    }, 
    updateItem(arr){
        arr = arr || [];   
        let script = this.scrollView.getComponent("ScrollViewHelper");
        script.resetData( arr ,(itemId, item, data)=>{
             let script = item.getComponent("recordItem");
             script.setInfo(item,data,itemId);
        })
        this.scrollView.scrollToOffset(cc.v2(0, 0), 2);
    },

    closePop(){
        PopMgr.closePop("popGetCashRecord");
    },
 
    //退出弹窗doing someing
    exitPop(){
  
    }  
});
