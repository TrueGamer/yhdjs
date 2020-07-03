/**
 * 提现
 */

let HB_STATE = cc.Enum({ 
    WAIT:1,
    ACTIVATE:2,
    INVALID:3,
    SUCCESS:4, 
})


cc.Class({
    extends: cc.Component,

    properties: {
        ey:cc.Label,
        tixianRecordBtn:cc.Node,
        bindTipLab:cc.Label,
        gotoBindBtn:cc.Node,
        roleImg:cc.Sprite,
        niceNameLab:cc.Label,
        hbLab:cc.Label, 
        dangweiTemplet:cc.Node,
        titleLab:cc.Node,
    },

    onLoad(){
        Utils.http(_G.MESSAGE.GET_RED_PACK);
    },
     
    start () { 
        this.updateBingInfo();
    },

    updateBingInfo(){
        if(_G.SDKMgr.UserInfo && _G.SDKMgr.UserInfo.openid){ 
            this.gotoBindBtn.active = false;
            this.roleImg.node.active = true;
            this.niceNameLab.node.active = true;
            this.bindTipLab.string = _G.LangMgr.getText(1016);
            this.niceNameLab.string =  Tools.setPlayerName(_G.SDKMgr.UserInfo.nickname);
            cc.loader.load(_G.SDKMgr.UserInfo.headimgurl+"?aaa=aa.jpg",(err, texture)=>{ 
                  if(err){ 
                        console.log("图片下载失败", _G.SDKMgr.UserInfo.headimgurl, JSON.stringify(err)); 
                        return; 
                  } 
                  let frame = new cc.SpriteFrame(texture); 
                  if (this.roleImg.node.isValid){this.roleImg.spriteFrame = frame;} 
            }); 
        }else{
            this.gotoBindBtn.active = true; 
            this.bindTipLab.string = "";
            this.niceNameLab.node.active = false;
            this.roleImg.node.active = false;
        }   
        let hongbao = _G.IPlayer.getKey("hongbao"); 
        this.ey.string = "{0}元".format( hongbao.balance );
    },


    setHongBaoInfo(info, rewardList){
        this.hongBaoInfo = info;
        this.rewardList = rewardList
    },

    updateInfo(){

        cc.setText(this.titleLab,_G.LangMgr.getText(1023).format(this.hongBaoInfo.data.version))
        let hongbao = _G.IPlayer.getKey("hongbao"); 
        let activedLayout = this.node.find("kuang/activedLayout");
        let unActivedLayout = this.node.find("kuang/unActivedLayout"); 
        if(this.hongBaoInfo  && this.hongBaoInfo.isOpen == false){ 
            this.hbLab.string = "0";
            activedLayout.getComponent(cc.Layout).node.removeAllChildren();
            unActivedLayout.getComponent(cc.Layout).node.removeAllChildren(); 
            return;
        }  
        this.hbLab.string =this.hongBaoInfo.data.curRmb / 100 ;
        activedLayout.getComponent(cc.Layout).node.removeAllChildren();
        unActivedLayout.getComponent(cc.Layout).node.removeAllChildren(); 
     
        let hbRecords = hongbao.record; 
        let succesList = [];
        let activeList = [];
        let unActiveList = [];
        let validList = [];

        for (const key in hbRecords) {
            console.log("ZTZT key" +  key)
            let rd = hbRecords[key];
            console.log("ZTZT state" +  rd.state)
            rd.id = key;
            rd.state = HB_STATE.WAIT
            if(rd.state == HB_STATE.WAIT ){ 
                unActiveList.push(rd)
            }else if(rd.state == HB_STATE.SUCCESS ){ 
                succesList.push(rd);
            }else if(rd.state == HB_STATE.ACTIVATE) {
                activeList.push(rd)
            }else{ 
                //validList.push(rd);
            }
        }
        
        this.activeList = activeList;
        //如果激活列表不够4个 那就补一句领取过的 如果加上领取的还不够4个那就加失效的 反正就是要显示4个 如果都没有那就显示激活的
        if(activeList.length < 4){
            let len = 4 - activeList.length;
            if(succesList.length > 0 ){
                for (let index = len - 1 ; index > 0; index--) {
                    activeList.push(succesList[index])
                }
            }
            if(activeList.length < 4){
                let len = 4 - activeList.length;
                if(validList.length > 0 ){
                    for (let index = len - 1 ; index > 0; index--) {
                        activeList.push(validList[index])
                    }
                } 
            }
        }

        //未激活的
        for (let index = 0; index < 4; index++) {
            const info = unActiveList[index];
            if(!info) break;
            this.setDangWei(info, index);
        }
        
        this.unActiveList = unActiveList;

//        //激活的
//        activeList.sort((a,b)=>{
//            return a.id - b.id;
//        })
//        for (let index = 0; index < 4; index++) {
//            const info =  activeList[index]
//            if(!info) break;
//            this.setDangWei(info, index);
//        }
    },


    openGetMoney(node){
        if(this.selectNode  && this.selectNode != node){
            this.selectNode.getComponent("SpriteEx").index = 0;
        }
        this.selectNode = node;
        this.selectNode.getComponent("SpriteEx").index = 1;
    },
 
    setDangWei(rd, index){
        let node
        let hongbaoCf = _G.CfgMgr.getConfigs("hongbao");
        let config = hongbaoCf[rd.id]; 
        let activedLayout = this.node.find("kuang/activedLayout");
        let unActivedLayout = this.node.find("kuang/unActivedLayout");
        switch ( rd.state ){ 
            case HB_STATE.SUCCESS: 
                node = cc.instantiate(this.dangweiTemplet);
                node.active =true;
                node.y = 20;
                node.parent = activedLayout; 
                node.find("stateLab").active = true;
                node.find("dsjLab").active = false; 
                node.find("djsIcon").active = false;
                node.find("stateLab").color = cc.color(62,82,123);
                node.find("moneyLab").color = cc.color(62,82,123);
                node.getComponent("SpriteEx").index = 2;
                cc.setText( node.find("stateLab"),"已领取")
                cc.setText(node.find("moneyLab"), "{0}元".format(config.amount/100));
                break;
            case HB_STATE.ACTIVATE: 
                node = cc.instantiate(this.dangweiTemplet);
                Wheen.stop(node.find("dsjLab"));
                node.active =true;
                node.y = 20;
                node.parent = activedLayout; 
                node.find("stateLab").active = false;
                node.find("dsjLab").active = true; 
                node.find("djsIcon").active = true;
                cc.setText(node.find("moneyLab"), "{0}元".format(config.amount/100));
                node.rd = rd; 
                node.on(cc.Node.EventType.TOUCH_END,this.openGetMoney.bind(this,node),this);
                let retime = (rd.activeTime + config.time) - Tools.getTime();
                retime = retime > 0 ? retime:0;
                cc.setText(node.find("dsjLab"),Tools.addPreZeroEx(retime));
                wheen(node.find("dsjLab")).wait(1000).invoke(()=>{
                    let retime = (rd.activeTime + config.time) - Tools.getTime()
                    retime = retime > 0 ? retime:0; 
                    cc.setText(node.find("dsjLab"),Tools.addPreZeroEx(retime)); 
                }).loop(-1).start();
                break;
            case HB_STATE.INVALID:
                node = cc.instantiate(this.dangweiTemplet);
                node.active =true;
                node.y = 20;
                node.parent = activedLayout; 
                node.find("stateLab").active = true;
                node.find("dsjLab").active = false; 
                node.find("djsIcon").active = false;
                node.find("stateLab").color = cc.color(62,82,123);
                node.find("moneyLab").color = cc.color(62,82,123);
                node.getComponent("SpriteEx").index = 2;
                cc.setText( node.find("stateLab"),"已过期");
                cc.setText(node.find("moneyLab"), "{0}元".format(config.amount/100));
                break;
            case HB_STATE.WAIT:
                let node = cc.instantiate(this.dangweiTemplet);
                node.active =true;
                node.y = 0
                node.parent = unActivedLayout; 
                node.find("stateLab").active = false;
                node.find("dsjLab").active = false; 
                node.find("djsIcon").active = false;
                console.log("ZTZT"+ config.openLimit+"///"+config.amount+"///"+config.time+"///"+config.icon+"///"+config.getLimit+"///"+config.desc)
                cc.setText(node.find("moneyLab"), "{0}元".format(this.rewardList[index]));
                break; 
            default:
                break;
        }
    },
 

    onTiXianRecord(){ 
        PopMgr.createPop("popGetCashRecord"); 
    },


    onGetTiXian(){
        let self = this;
        if(this.activeList.length <= 0 ){ 
            return PopMgr.createTip(_G.LangMgr.getText(1025)); 
        } 
        if(!self.selectNode){
            return PopMgr.createTip(_G.LangMgr.getText(1017)); 
        }
        if(!self.selectNode.rd) return;
        let id = self.selectNode.rd.id;
        if(_G.SDKMgr.UserInfo && _G.SDKMgr.UserInfo.openid){ 
            Utils.http(_G.MESSAGE.GET_ORDER,{goodsId:id});
        }else{
            PopMgr.createTip("请先绑定微信")
        } 
    },
 
    closePop(){
        PopMgr.closePop("popGetCash");
    },
   
    onGotoBind(){ 
        SDKMgr.bindWx();
        
    },

    //退出弹窗doing someing
    exitPop(){


    }  
});
