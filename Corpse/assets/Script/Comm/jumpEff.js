/**
 * 呼吸跳
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    }, 

    onLoad () { 
        wheen(this.node).setFlag("loop")
        .to({y:20},800)
        .to({y:0},400,Wheen.Easing.Elastic.easeOut)
        .wait(2000)
        .loop(-1,"loop")
        .start();
    },
 
    onDestroy(){
        Wheen.stop(this.node);
    },

});
