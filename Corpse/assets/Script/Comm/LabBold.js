/**
 * 字体加粗
 */
cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: true
    },
    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.getComponent(cc.Label)._isBold = true;
    },

    start () {
     
    }, 
});
