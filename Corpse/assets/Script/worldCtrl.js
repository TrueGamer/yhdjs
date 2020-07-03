
cc.Class({
    extends: cc.Component,
    properties: {
        //快捷购买CD
        cdbuyTime:{
            type:cc.Integer,
            default:0,
            visible:false
        }
    },
    onLoad () {
        this.initListener();
    },

    //监听网络事件
    initListener(){
        whevent.on(_G.MESSAGE.BUY_PET_MONEY,this.onRespBuyPetMoney,this); 
        whevent.on(_G.MESSAGE.BUY_PET_GLOD,this.onRespBuyPetGold,this); 
        whevent.on(_G.MESSAGE.PET_MERGE,this.onRespPetMerge,this); 
        whevent.on(_G.MESSAGE.PET_SWAP_POS,this.onRespPetSwapPos,this); 
        whevent.on(_G.MESSAGE.SELL_PET,this.onRespSellPet,this); 
        whevent.on(_G.MESSAGE.QUICK_BUY_PET,this.onRespQuicKBuyPet,this);
        whevent.on(_G.MESSAGE.SET_DUANWEI,this.onRespDuanWei,this); 
        whevent.on(_G.MESSAGE.SIGNIN,this.onRespSignIn,this); 
        whevent.on(_G.MESSAGE.GET_BANK,this.onRespGetBank,this); 
        whevent.on(_G.MESSAGE.DAILYTASK,this.onRespTask,this); 
        whevent.on(_G.MESSAGE.ACHIEVENMENT,this.onRespAchievenMent,this); 
        whevent.on(_G.MESSAGE.ROLL,this.onRespRoll,this); 
        whevent.on(_G.MESSAGE.GET_MULTI_UPDUAN,this.onUpDuanReward,this); 
        whevent.on(_G.MESSAGE.PET_COMBINE,this.onPetComBine,this); 
        
        whevent.on(_G.MESSAGE.START_WORK,this.onStartWork,this); 
        whevent.on(_G.MESSAGE.GET_WORK_REWARD,this.onGetWorkReward,this); 
        whevent.on(_G.MESSAGE.FREE_VIDEO_ZUANSHI,this.onFreeZuanShiResp,this); 
        whevent.on(_G.MESSAGE.GET_ORDER,this.onGetGameOrder,this); 
        whevent.on(_G.MESSAGE.GET_CASH,this.onGetGameOrderRsp,this); 
        whevent.on(_G.MESSAGE.GET_BOX,this.onGetBoxResp,this); 
        whevent.on(_G.MESSAGE.OPEN_BOX,this.onOpenBoxResp,this); 
        whevent.on(_G.MESSAGE.GET_RED_PACK,this.onRedPackActiveResp,this); 
        whevent.on(_G.MESSAGE.GET_MONEY_RECORD,this.onTiXianRecord,this); 
        whevent.on(_G.MESSAGE.UP_AD_REWARD,this.onUpAdReward,this); 
        whevent.on(_G.MESSAGE.FREE_MONEY,this.onFreeMoney,this); 
        whevent.on(_G.MESSAGE.GET_DOUBLE_REDPACK,this.onDoubleRedPackResp,this); 
        whevent.on(_G.MESSAGE.ROLL_DOUBLE,this.onRollDoubleResp,this); 
        whevent.on(_G.MESSAGE.GET_OFFLINE_MULT,this.onOffLineMult,this); 
 
        
        //自定义事件 
        whevent.on(_G.EVENT.PAUSE_SPINE ,this.setPauseAllSpine,this); 
        whevent.on(_G.EVENT.OPEN_DAN ,this.onDuanWei,this); 
        whevent.on(_G.EVENT.GUIDE_REDPACK ,this.onGuideRedPack,this); 
        whevent.on(_G.EVENT.GUIDE_DAN ,this.onGuideDan,this); 
        whevent.on(_G.EVENT.RESUME_SPINE ,this.setResumeAllSpine,this); 
        whevent.on(_G.EVENT.CHECK_RED_DOT ,this.onCheckRedDot,this); 
        whevent.on(_G.EVENT.UPDATE_BIND_INFO ,this.onBingInfo,this); 
        whevent.on(_G.EVENT.DROP_BOX ,this.onDropBox,this); 
        whevent.on(_G.EVENT.AUTO_MERGE ,this.onAddSpeed,this); 
        whevent.on(_G.EVENT.UPDATE_PLANT ,this.onUpdatePlant,this); 
        whevent.on(_G.EVENT.PLAY_OFFLINE_MC ,this.onPlayOffLineMc,this); 
        whevent.on(_G.EVENT.RESUM_DRAG_ITEM ,this.onResumDragItem,this);
        whevent.on(_G.EVENT.OPEN_REDPACK ,this.openWallet,this);
        whevent.on(_G.EVENT.NET_FAIL ,this.onNetFailResp,this); 
        whevent.on(_G.EVENT.REMOVELISTENER ,this.removeListener,this); 
        whevent.on(_G.EVENT.ERR_MEGER ,this.unLockErrAutoMerge,this); 
        whevent.on(_G.EVENT.GUIDE_CONTINUE,this.guideContinue,this);
        
        this.game = this.node.getComponent("world")
    }, 
    
    //移除所有监听
    removeListener(){
        whevent.off(_G.MESSAGE.BUY_PET_MONEY,this.onRespBuyPetMoney,this); 
        whevent.off(_G.MESSAGE.BUY_PET_GLOD,this.onRespBuyPetGold,this); 
        whevent.off(_G.MESSAGE.PET_MERGE,this.onRespPetMerge,this); 
        whevent.off(_G.MESSAGE.PET_SWAP_POS,this.onRespPetSwapPos,this); 
        whevent.off(_G.MESSAGE.SELL_PET,this.onRespSellPet,this); 
        whevent.off(_G.MESSAGE.QUICK_BUY_PET,this.onRespQuicKBuyPet,this);
        whevent.off(_G.MESSAGE.SET_DUANWEI,this.onRespDuanWei,this); 
        whevent.off(_G.MESSAGE.SIGNIN,this.onRespSignIn,this); 
        whevent.off(_G.MESSAGE.GET_BANK,this.onRespGetBank,this); 
        whevent.off(_G.MESSAGE.DAILYTASK,this.onRespTask,this); 
        whevent.off(_G.MESSAGE.ACHIEVENMENT,this.onRespAchievenMent,this); 
        whevent.off(_G.MESSAGE.ROLL,this.onRespRoll,this); 
        whevent.off(_G.MESSAGE.GET_MULTI_UPDUAN,this.onUpDuanReward,this); 
        whevent.off(_G.MESSAGE.PET_COMBINE,this.onPetComBine,this); 
        
        whevent.off(_G.MESSAGE.START_WORK,this.onStartWork,this); 
        whevent.off(_G.MESSAGE.GET_WORK_REWARD,this.onGetWorkReward,this); 
        whevent.off(_G.MESSAGE.FREE_VIDEO_ZUANSHI,this.onFreeZuanShiResp,this); 
        whevent.off(_G.MESSAGE.GET_ORDER,this.onGetGameOrder,this); 
        whevent.off(_G.MESSAGE.GET_CASH,this.onGetGameOrderRsp,this); 
        whevent.off(_G.MESSAGE.GET_BOX,this.onGetBoxResp,this); 
        whevent.off(_G.MESSAGE.OPEN_BOX,this.onOpenBoxResp,this); 
        whevent.off(_G.MESSAGE.GET_RED_PACK,this.onRedPackActiveResp,this); 
        whevent.off(_G.MESSAGE.GET_MONEY_RECORD,this.onTiXianRecord,this); 
        whevent.off(_G.MESSAGE.UP_AD_REWARD,this.onUpAdReward,this); 
        whevent.off(_G.MESSAGE.FREE_MONEY,this.onFreeMoney,this); 
        whevent.off(_G.MESSAGE.GET_DOUBLE_REDPACK,this.onDoubleRedPackResp,this); 
        whevent.off(_G.MESSAGE.ROLL_DOUBLE,this.onRollDoubleResp,this);
        whevent.off(_G.MESSAGE.GET_OFFLINE_MULT,this.onOffLineMult,this); 
        //自定义事件 
        whevent.off(_G.EVENT.PAUSE_SPINE ,this.setPauseAllSpine,this); 
        whevent.off(_G.EVENT.OPEN_DAN ,this.onDuanWei,this); 
        whevent.off(_G.EVENT.GUIDE_REDPACK ,this.onGuideRedPack,this); 
        whevent.off(_G.EVENT.GUIDE_DAN ,this.onGuideDan,this); 
        whevent.off(_G.EVENT.RESUME_SPINE ,this.setResumeAllSpine,this); 
        whevent.off(_G.EVENT.CHECK_RED_DOT ,this.onCheckRedDot,this); 
        whevent.off(_G.EVENT.UPDATE_BIND_INFO ,this.onBingInfo,this); 
        whevent.off(_G.EVENT.DROP_BOX ,this.onDropBox,this); 
        whevent.off(_G.EVENT.AUTO_MERGE ,this.onAddSpeed,this); 
        whevent.off(_G.EVENT.UPDATE_PLANT ,this.onUpdatePlant,this); 
        whevent.off(_G.EVENT.PLAY_OFFLINE_MC ,this.onPlayOffLineMc,this); 
        whevent.off(_G.EVENT.RESUM_DRAG_ITEM ,this.onResumDragItem,this);
        whevent.off(_G.EVENT.OPEN_REDPACK ,this.openWallet,this);
        whevent.off(_G.EVENT.NET_FAIL ,this.onNetFailResp,this);  
        whevent.off(_G.EVENT.REMOVELISTENER ,this.onNetFailResp,this);
        whevent.off(_G.EVENT.ERR_MEGER ,this.unLockErrAutoMerge,this); 
        whevent.off(_G.EVENT.GUIDE_CONTINUE,this.guideContinue,this); 
    },

    //转盘双倍响应
    onRollDoubleResp(resp){  
      let pop = PopMgr.getPop("popTurn")
      if(pop){
          let script = pop.getComponent("popTurn") 
          script.doubleReward(resp);
      } 
    },
 
    //离线收益双倍
    onOffLineMult(resp){ 
        if(resp.rewardList && resp.rewardList.length > 0){
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }
    },
 

    /**
     * 红包双倍奖励返回的
     */
    onDoubleRedPackResp(resp){  
        let pop  = null;
        switch (resp.handler) { 
            //新手红包
            case _G.AppDef.RED_PACK_TYPE.NEW_USER_HB:
                PopMgr.closePop("popRedPack");
                //展示奖励 
                if(resp.rewardList){
                    //已知一定会是红包
                    let num = resp.rewardList[0].num; 
                    PopMgr.createPop("popRedPackRet",{curMoney:num,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.NEW_USER_HB});
                }
                break;
            //离线红包翻倍
            case _G.AppDef.RED_PACK_TYPE.OFF_HB: 
                if(resp.rewardList &&  _G.AppDef.offLineIsDouble){ 
                    _G.AppDef.offLineIsDouble = false;
                    PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
                } 
                pop = PopMgr.getPop("popRedPackRet"); 
                if(pop){
                    let script = pop.getComponent("popRedPackRet") 
                    script.hideDBbtn(); 
                } 
                break;
            //越级升级
            case _G.AppDef.RED_PACK_TYPE.UP_LEVEL: 
                // if(resp.rewardList){  
                //     PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
                // }
                pop = PopMgr.getPop("popRedPackRet"); 
                if(pop){
                    let script = pop.getComponent("popRedPackRet") 
                    script.hideDBbtn(); 
                }
                break;
            //广告宝箱
            case _G.AppDef.RED_PACK_TYPE.AD_BOX:
                // if(resp.rewardList){  
                //     PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
                // } 
                pop = PopMgr.getPop("popRedPackRet"); 
                if(pop){
                    let script = pop.getComponent("popRedPackRet") 
                    script.hideDBbtn(); 
                }
                break;
            case  _G.AppDef.RED_PACK_TYPE.UNLOCK_PET:
                // if(resp.rewardList){  
                //     PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
                // }  
                pop = PopMgr.getPop("popRedPackRet"); 
                if(pop){
                    let script = pop.getComponent("popRedPackRet") 
                    script.hideDBbtn(); 
                }
                break;
            default:
                break;
        }
 
    },

    /**
     * 为了网络失败做恢复操作
     * 有的为了体验合理 在发送网络请求前做了操作  网络失败后 会显示不正常
     * 当网络失败后 要恢复之前的操作。 比如移动植物，合成植物
     */
    onNetFailResp(data){
        if(!data)return;
        let cmd = data.cmd;
        let params = data.params;
        switch (cmd) {
            //植物合成
            case _G.MESSAGE.PET_MERGE:
                this.game.refreshModel(params.indexs);
                break;
            //植物交换位置
            case _G.MESSAGE.PET_SWAP_POS: 
                this.game.refreshModel(params.indexs);
                break; 
            default:
                break;
        }
    },
 
    /**
     * 弱指引去点击升级段位
     */
    onGuideDan(){ 
        if( _G.AppDef.isGuideDan) return;
        if(PopMgr.getPopSize()) return; 
        _G.AppDef.isGuideDan = true; 
        whevent.event("task2");

    },


    /**
     * 弱指引去点击红包按钮
     */
    onGuideRedPack(){
        let _godGuide = this.game.getComponent("LoadGuide")._godGuide;
        let redBtn = this.game.topLayer.find("btnLayer3/bth_wallet");
        _godGuide.guideRedPack(redBtn);
    },

    /**
     * 免费阳光获得
     */
    onFreeMoney(resp){ 
        _G.AppDef.FREE_GAP_TIME  = resp.freeMoneyLastTime;
        if(resp.rewardList){ 
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }
        this.game.updateUI(); 
    },
 
    //指定越级升级植物
    onUpAdReward(resp){ 
        this.game.updateUI(); 
        if(resp.site){ 
            let level = _G.IPlayer.getPetLevel(resp.site); 
            this.game.onAddBuyPet(level,resp.site);  
        }
 
        //  //植物越级后 产生红包 双倍
        //  if(resp.rewardList.length > 0 ){ 
        //     let num = resp.rewardList[0].num; 
        //     let itemID = resp.rewardList[0].itemID; 
        //     if(itemID == _G.AppDef.RED_PACK_ID){
        //         PopMgr.createPop("popRedPackRet",{curMoney:num,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.UP_LEVEL});    
        //     }else{
        //         PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        //     } 
        // }
 
        //越级升级之后
        let hongbao =_G.IPlayer.getKey("hongbao");
        let count = _G.CfgMgr.getSysConfig(29) - hongbao.upLevelHbTime;  
        if(count > 0){
            PopMgr.createPop("popRedPackRet",{curMoney:hongbao.upLevelHb,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.UP_LEVEL});   
        } 

         
        
    },

    //提现记录
    onTiXianRecord(resp){   
        let pop = PopMgr.getPop("popGetCashRecord")
        if(pop){
            let script = pop.getComponent("popGetCashRecord") 
            script.updateItem(resp.record); 
        } 
    },
 
    //更新绑定信息
    onBingInfo(){
        let pop = PopMgr.getPop("popGetCash")
        if(pop){
            let script = pop.getComponent("popGetCash") 
            script.updateBingInfo(); 
        } 
    }, 

    //出来红包活动信息
    onRedPackActiveResp(resp){
     console.log("onRedPackActiveResp",Object.keys(resp));
        let pop = PopMgr.getPop("popGetCash")
        if(pop){
            let script = pop.getComponent("popGetCash") 
            script.setHongBaoInfo(resp.info, resp.rewardList);
            script.updateInfo();
        }
    },
    //刷新箱子
    onOpenBoxResp(resp){ 
        this.game.updateUI();
        let buyInfo = resp.buyInfo;
        if(resp.site){ 
            let targetNode = this.game.modelCtrls[resp.site];
            if(targetNode){
                let script = targetNode.getComponent("role");
                script.box.active = false;
            }
            let petList = _G.IPlayer.getKey("pet").list;
            let info = petList[resp.site]
            this.game.onAddBuyPet(info.level,resp.site);
            
        }else{
            this.game.refreshModel();
        }

        //植物越级后 产生红包 双倍
        if(resp.rewardList.length > 0){ 
            let num = resp.rewardList[0].num; 
            let itemID = resp.rewardList[0].itemID; 
            if(itemID == _G.AppDef.RED_PACK_ID){
                PopMgr.createPop("popRedPackRet",{curMoney:num,title:"恭喜获得",redPackType:_G.AppDef.RED_PACK_TYPE.AD_BOX});    
            }else{
                PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
            } 
        }

    },

    //监听所有掉落的宝箱
    onDropBox(boxUpdate){
        AppLog.log("监听所有掉落的宝箱"+JSON.stringify(boxUpdate));
        if(boxUpdate){
            for (const key in boxUpdate) { 
                const boxInfo = boxUpdate[key];
                this.game.dropBoxByRole(boxInfo.site,boxInfo.id);
            }
            
        }

    }, 

    //获得宝箱
    onGetBoxResp(resp){
        _G.AppDef.KILL_MONSTER_TOTAL_NUM = 0;
    },

    //获取订单号
    onGetGameOrder(resp){
        Utils.http(_G.MESSAGE.GET_CASH,{orderId:resp.orderId});  
    },
     //提现反馈
    onGetGameOrderRsp(resp){
        PopMgr.createTip("提现申请已提交,请耐心等待")   
    },
      
    /**
     * 免费钻石返回
     */
    onFreeZuanShiResp(resp){  
        if(resp.rewardList && resp.rewardList.length > 0){
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }
        let pop = PopMgr.getPop("popFreeZuanShi")
        if(pop){
            let script = pop.getComponent("popFreeZuanShi") 
            script.onUpdateInfo();
        } 
        this.game.updateUI();
    },
    /**
     * 开始工作
     */
    onStartWork(resp){
        //刷新内容
        let pop = PopMgr.getPop("popWorking")
        if(pop){
            let script = pop.getComponent("popWorking") 
            script.onUpdateInfo(resp);
        } 
        whevent.event(_G.EVENT.UPDATE_WORK_STATE); 
    },

    /**
     * 获取工作奖励
     */
    onGetWorkReward(resp){ 
        if(resp.rewardList && resp.rewardList.length > 0){ 
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }
        this.game.updateUI();
        this.onStartWork(resp);
    },

    //首次合成看视频或者其他奖励
    onPetComBine(resp){
        console.log("首次合成看视频或者其他奖励",resp);
        PopMgr.closePop("popUnLock");  
        if( resp.rewardList && resp.rewardList.length > 0 ){ 
            //过滤红包出来
            let rewards = null; 
            for (const key in resp.rewardList) {
                const info = resp.rewardList[key];
                if(info.itemID == _G.AppDef.RED_PACK_ID)  {
                    rewards = info;
                    resp.rewardList.splice(Number(key),1);
                }  
            } 
            //增加红包回调
            let call = null;
            if(_G.IPlayer.getKey("guide") >= 6){
                let pet = _G.IPlayer.getKey("pet");
                let maxLevel = pet.maxLevel; 
                let config = _G.CfgMgr.getConfig("petCombineReward",maxLevel);  
                call = ()=>{ 
                    PopMgr.createPop("popRedPack",{num:config.hb,title:"解锁红包",redPackType:_G.AppDef.RED_PACK_TYPE.UNLOCK_PET});   
                }
            }

            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得",call:call});
            
        }  
        this.game.updateUI();
    }, 

    /**
     * 解锁新段位 三倍奖励处理
     */
    onUpDuanReward(resp){ 
        PopMgr.closePop("popUpDan"); 
        if(resp.rewardList){ 
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        } 
        this.game.updateUI();
    },
 
    onUpdatePlant(slot){ 
        if(slot){
            this.game.refreshModel([slot]);
        }
    },
 
    onRespRoll(resp){
        //TODO 处理奖励弹窗
        this.game.updateUI();
        let pop = PopMgr.getPop("popTurn")
        if(pop){
            let script = pop.getComponent("popTurn");
            script.onRespReward(resp);
        } 
    },
 
    /**
     * 成就响应返回
     */
    onRespAchievenMent(resp){
        //TODO 处理奖励弹窗
        this.game.updateUI(); 

        let pop = PopMgr.getPop("popRedPackRet"); 
        if(pop){
            let script = pop.getComponent("popRedPackRet") 
            script.hideDBbtn(); 
        }else{
            if(resp.rewardList){ 
                PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
            } 
        } 

        //刷新任务界面
        let popTask = PopMgr.getPop("popTask")
        if(popTask){
            let script = popTask.getComponent("popTask") 
            script.setAchieve();
        }  
    },

    /**
     * 每日任务响应返回
     */
    onRespTask(resp){ 
        //TODO 处理奖励弹窗
        this.game.updateUI();
        //刷新任务界面

        let pop = PopMgr.getPop("popRedPackRet"); 
        if(pop){
            let script = pop.getComponent("popRedPackRet") 
            script.hideDBbtn(); 
        }else{
            if(resp.rewardList){ 
                PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
            } 
        }

        let popTask = PopMgr.getPop("popTask")
        if(popTask){
            let script = popTask.getComponent("popTask") 
            script.setTask();
        } 
    },  


    /**
     * 領取存钱罐返回
     */
    onRespGetBank(resp){
        //获取存钱罐里面的钱 
        //TODO 表现
        let pop = PopMgr.getPop("popBank")
        if(pop){
            let script = pop.getComponent("popBank")
            script.updateUI();
        }
        if(resp.rewardList){ 
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }   
        this.game.updateUI();
        whevent.event(_G.EVENT.PLAY_OFFLINE_MC);
    },


    //返回签到奖励
    onRespSignIn(resp){ 
        AppLog.log("onRespSignIn",resp);
  
        if(resp.rewardList){ 
            PopMgr.createPop("popReward",{rewardList:resp.rewardList,title:"恭喜获得"});
        }  
        let pop = PopMgr.getPop("popSignIn")
        if(pop){
            let script = pop.getComponent("popSignIn")
            script.onUpdateUI();
        }
        this.game.updateUI();
    },
 
    onRespDuanWei(resp){ 
        if(this.game.node.isValid == false) return ;  
        AppLog.log("段位设置返回",_G.IPlayer.getKey("rank")) 
        //如果是提升 就直接关闭。
        PopMgr.closePop("popDan"); 
        //TODO  首次有奖励  maxRank
        if(resp.isFirst){
            PopMgr.createPop("popUpDan",{rewardList:resp.rewardList}); 
        }  
        this.game.levelTotalExp  = 0;
        _G.CfgMgr.setItem(_G.AppDef.UID +"levelTotalExp",this.game.levelTotalExp);
        this.game.updateDuanWei();
        this.game.updateUI();
    },


    //解锁自动合成
    unLockErrAutoMerge(){
        if(this.game){
            this.game.autoMergeing = false;
        } 
    },
 
    //响应植物合并
    onRespPetMerge(resp){  
        let self = this;
        this.game.updateUI();
        if(Tools.checkTownInPlant()){
            //这里再加一个步长检查 
            whevent.event(_G.EVENT.GUIDE_PLANT_MOVE);
        } 
        self.game.autoMergeing = false;
        if(resp.indexs){
             //广告合成高等级
            if(resp.touchAD && resp.touchAD.adMark){ 
                self.game.onCombineMc(resp.indexs[0],resp.indexs[1],true);
                let level = _G.IPlayer.getPetLevel(resp.indexs[0]);
                PopMgr.createPop("popAdUp",{ posLevel:level, upLevel:resp.touchAD.upLevel,call:function(){
                    self.game.test(resp.indexs[0]);
                    //取消升级操作
                    let hongbao =_G.IPlayer.getKey("hongbao");
                    let count = _G.CfgMgr.getSysConfig(29) - hongbao.upLevelHbTime;  
                    if(count > 0){
                        PopMgr.createPop("popRedPack",{title:"升级红包",redPackType:_G.AppDef.RED_PACK_TYPE.UP_LEVEL});    
                    }
                }});
            }else{
                self.game.onCombineMc(resp.indexs[0],resp.indexs[1]);
            } 
        }
 
        //需要知道是新解锁的 
        if(resp.firstUpgrade > 0){  
            PopMgr.createPop("popUnLock");
        }
    },

    onRespPetSwapPos(resp){   
        //检查是否移动到第一个炮塔位置
        if(Tools.checkTownInPlant()){
            //这里再加一个步长检查
            whevent.event(_G.EVENT.GUIDE_PLANT_MOVE);
        } 
        this.game.refreshModel(resp.indexs);
    },

    //金币购买
    onRespBuyPetMoney(resp){ 
        this.game.updateUI();
        let buyInfo = resp.buyInfo;
        this.game.onAddBuyPet(buyInfo.level,buyInfo.site);  
        PopMgr.createTip(1022);
    },

    //钻石购买
    onRespBuyPetGold(resp){
        this.game.updateUI();
        let buyInfo = resp.buyInfo; 
        this.game.onAddBuyPet(buyInfo.level,buyInfo.site); 
        PopMgr.createTip(1022);
    },
 
    onRespSellPet(resp){   
        PopMgr.closePop("popSellTip");
        this.game.updateUI(); 
        if(resp.site){
            this.game.refreshModel([resp.site]); 
            this.game.sellMc();
        }
        
    },

    onRespQuicKBuyPet(resp){  
        this.game.updateUI();
        let buyInfo = resp.buyInfo;
        this.game.onAddBuyPet(buyInfo.level,buyInfo.site); 
    },

    onPlayOffLineMc(){
        this.game.playOffLineMc();
    },

    /**
     * 用于合成是拖拽的第一个item 隐藏后 发生服务器错误 导致不显示
     * 所以出现错误需要恢复显示
     */
    onResumDragItem(){
        this.game.resumDargItemContrl();
    },
 
    //==================按钮响应操作区=========
    onQuickBuyPet(){
        AppLog.log("快速购买");
        if((Date.now() - this.cdbuyTime) < 300) return  AppLog.log("速度过快");
        if(Tools.isCanBuy(this.game.monsterCtrls) == false){
            PopMgr.createTip(1008);
            return;
        }
        this.cdbuyTime = Date.now();
        Utils.http(_G.MESSAGE.QUICK_BUY_PET);  
    }, 
    //菜单
    onMenu(){
        AppLog.log("打开菜单");
    },

    onAutoMerge(){
        AppLog.log("开始自动合成"); 
        let maxRank = _G.IPlayer.getKey("maxRank"); 
        let maxDj = _G.CfgMgr.getSysConfig(28); 
        if(maxRank+1 < maxDj){
            let config = _G.CfgMgr.getConfig("title",maxDj);
            return PopMgr.createTip(_G.LangMgr.getText(1026).format(config.name))
        }
        PopMgr.createPop("popAutoMerge"); 
    },
    
    //段位
    onDuanWei(){ 
        //特殊处理升级段位  
        Tools.playSound("BTN");
        PopMgr.createPop("popDan");  

        /***
         * {call:()=>{
            if(_G.AppDef.isGuideDan){
                _G.AppDef.isGuideDan = false; 
                whevent.event("task2");
                let _godGuide = this.game.getComponent("LoadGuide")._godGuide;
                if(_godGuide._danFinger){
                    Wheen.stop(_godGuide._danFinger);
                    _godGuide._danFinger.parent = null;
                } 
            } 
        }}
         */
    },

    //打开商店
    onOpenShop(){
        AppLog.log("打开商店");
        Tools.playSound("BTN");
        PopMgr.createPop("popShop");
    },

    //添加钻石
    onAddDiamond(){
        PopMgr.createPop("popFreeZuanShi"); 
        Tools.playSound("BTN");
    }, 
 
     //打开存钱罐
     onOpenBank(){
        AppLog.log("打开存钱罐"); 
        PopMgr.createPop("popBank");
        Tools.playSound("BTN");
    }, 

    
    //打开签到
    onOpenSignIn(){
        AppLog.log("打开签到"); 
        PopMgr.createPop("popSignIn");
        Tools.playSound("BTN");
    }, 

    //打开签到
    onOpenTask(){
        AppLog.log("打开任务"); 
        PopMgr.createPop("popTask");
        Tools.playSound("BTN");
    }, 

    //打开存钱罐
    onOpenSet(){  
        PopMgr.createPop("popSet");
        Tools.playSound("BTN");
    }, 

    //打开加速
    openAddSpeed(){
        AppLog.log("打开存钱罐"); 
        PopMgr.createPop("popAddSpeed");
        Tools.playSound("BTN");
    }, 

    //打開轉盤
    openTurn(){
        AppLog.log("打開轉盤"); 
        PopMgr.createPop("popTurn");
        Tools.playSound("BTN");
    }, 
    //免费钻石
    openFree(){
        AppLog.log("免费钻石");
        PopMgr.createPop("popFreeZuanShi"); 
        Tools.playSound("BTN");
    }, 

    //打开钱包
    openWallet(){
        AppLog.log("钱包"); 
        Tools.playSound("BTN"); 
        PopMgr.createPop("popWallet",{call:()=>{
            if(_G.AppDef.isGuideRed){
                _G.AppDef.isGuideRed = false;
                let _godGuide = this.game.getComponent("LoadGuide")._godGuide;
                if(_godGuide._redFinger){
                    Wheen.stop(_godGuide._redFinger);
                    _godGuide._redFinger.parent = null;
                } 
            } 
        }});  

    }, 
     
     
    /**
     * 刷新红点
     */
    onCheckRedDot(){ 
        this.game.refenceRedPoint(); 
    },

    /**
     * 自动合成
     */
    onAddSpeed(){
        _G.AppDef.AUTO_MERGE_TIME += _G.CfgMgr.getSysConfig(21);  
   },

      /**
     * 打工
     */
    onWork(){
        PopMgr.createPop("popWorking");
        Tools.playSound("BTN"); 
   },

   onSell(){
        PopMgr.createTip(1020); 
   },
 
   onJianDel(){
        Tools.playSound("BTN");
        PopMgr.createTip("暂未开放")
        // let pet = _G.IPlayer.getKey("pet");
        // let list = pet.list; 
        // for (let index = 0; index < list.length; index++) { 
        //     this.scheduleOnce(()=>{
        //         Utils.http(_G.MESSAGE.SELL_PET,{site:index});
        //     },1)
           
        // }  
   },


   setPauseAllSpine(){
        //暂停所有怪物
        if(!this.game || !this.game.isValid) return;
        let monsterCtrls = this.game.monsterCtrls
        for (let index = 0; index < monsterCtrls.length; index++) {
            const monster = monsterCtrls[index];
            monster.getComponent("monster").setPauseSpine();
        }

        //前排炮塔
        let modelCtrls = this.game.modelCtrls;
        for (let index = 0; index < modelCtrls.length; index++) {
            if(index >= 5) return;
            const role = modelCtrls[index];
            role.getComponent("role").setPauseSpine();
        } 
   },
   
   setResumeAllSpine(){
        //恢复所有怪物
        if(!this.game || !this.game.isValid) return;
        let monsterCtrls = this.game.monsterCtrls
        for (let index = 0; index < monsterCtrls.length; index++) {
            const monster = monsterCtrls[index];
            monster.getComponent("monster").setResumeSpine();
        } 
        //前排炮塔
        let modelCtrls = this.game.modelCtrls;
        for (let index = 0; index < modelCtrls.length; index++) {
            if(index >= 5) return;
            const role = modelCtrls[index];
            role.getComponent("role").setResumeSpine();
        } 
   }, 
   
   //开始新手检查
   guideContinue(){ 
        console.log("开始检查新手指引")
        cc.find("Canvas").getComponent("LoadGuide").runTask();   
   }
 
});
