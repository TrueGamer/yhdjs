//返回监听
cc.Class({
    extends: cc.Component,

    properties: {
        // label: {
        //     default: null,
        //     type: cc.Label
        // },
        // text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () { 
        this.registerEvent();
    },

    registerEvent() {
        //android 返回键
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown(event) { 
        console.log("event.keyCode:"+event.keyCode)
        switch (event.keyCode) {   
            case cc.macro.KEY.back: 
                this.exit();
                break;
        }
    },
 
    exit(){
        PopMgr.createPop("popExit");
    },
 
    offEvent() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
 
    update: function (dt) {

    },

    onDestroy() {
        this.offEvent();
    }
});
