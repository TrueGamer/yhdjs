/**
 * 记录item
 */
cc.Class({
    extends: cc.Component,

    properties: {
         dateLab:cc.Label,
         moneyLab:cc.Label,
    },
 
    onLoad () {
        this.dateLab.string = "";
        this.moneyLab.string = "";
    },
 
    setInfo(item,data,itemId){ 
        data  = JSON.parse(data)
        this.dateLab.string = new Date(data.time*1000).format("yyyy-MM-dd  hh:mm:ss");
        this.moneyLab.string = "{0}元".format(data.amount/100);
    }
  
    // update (dt) {},
});
