/**
 * 弹窗管理器
 */
var PopMgr = {
    RES:{}, //路径转换表
    DICT:{},//弹窗句柄
    tipPool:null,//提示对象池
    /**
     * noScale:不适配放大
     * popStyle: 
     *          1 从上往下下回弹 显示 ->  关闭 掉落往下
     *          2 直接显示 ->  关闭 直接关闭
     *          3 从小到大
     */
    PopNameParams:{
        PopTurntable:{noScale:true,popStyle:2},
        PopRedBag:{noScale:true,popStyle:2},
        PopRank:{noScale:true,popStyle:2},
        popSpeedMc:{noScale:true,popStyle:0},
        popAddSpeed:{isPause:false,popStyle:3},
        popAutoMgrge:{isPause:false,popStyle:3},
        popProto:{popStyle:1},
        popMultipleReward:{popStyle:4},
        popRedPackRet:{popStyle:4}
    },

    getPop(popName){
        let pop = PopMgr.DICT[popName];
        if(pop && pop.isValid) return pop;
        return null;
    },


    /**
     * 获取是否有弹窗
     */
    getPopSize(){  
        let count = 0
        for (const key in PopMgr.DICT) { 
            let popName =  PopMgr.DICT[key];
            if(key == "popSellTip") continue;
            if(popName){
                count +=1;
            } 
        } 
        return count > 0;
    },


    //是否需要暂停spine
    getCanPopPause(){  
        let count = 0
        for (const key in PopMgr.DICT) { 
            let popName =  PopMgr.DICT[key];
            if(key == "popSellTip") continue;
            if(key == "popAddSpeed") continue;
            if(key == "popAutoMgrge") continue;  
            if(popName){
                count +=1;
            } 
        } 
        return count > 0;
    },

 
    /**
     * 通用创建弹窗
     * @param {*} popName 窗口名 默认和脚本名一致 
     * @param {*} params 附带参数
     */
    createPop(popName,params){ 
        let resUrl = PopMgr.RES[popName];
        //默认预制体目录下
        if(resUrl == null){
            resUrl = "prefabs/{0}".format(popName);
        }

        cc.loader.loadRes(resUrl, cc.Prefab, function (error, prefab) { 
            if (error) {
                cc.error(error);
                return;
            }
            
            if(PopMgr.getPop(popName)){
                if(popName == "popSellTip") return;
                PopMgr.closePop(popName,true); 
            }
            let pop = cc.instantiate(prefab);  
            PopMgr.DICT[popName] = pop;  
            if(params){
                let script = pop.getComponent(popName);
                if(script){
                    //用于透传参数
                    script.setParams && script.setParams(params);
                }  
            } 
            //是否对窗口进行修正
            let isPopSet =  PopMgr.PopNameParams[popName];
            if(!isPopSet || !isPopSet.noScale){
                let w = cc.winSize.width / pop.width 
                let h = cc.winSize.height/ pop.height
                let scale = w>h?w:h
                pop.setScale(scale,scale) 
            }
            
            //执行一个从上到下的动画 
            var popStyle = isPopSet ? isPopSet.popStyle : 3;

            var isPause =  isPopSet ? isPopSet.isPause : true;
            if(isPause){
                _G.AppDef.PAUSE_GAME = true;
                whevent.event(_G.EVENT.PAUSE_SPINE); 
            }
            switch (popStyle) {
                case 1:
                    let blackNode = pop.getChildByName("black")
                    let kuanNode = pop.getChildByName("kuang")
                    kuanNode.y = cc.winSize.height;
                    blackNode.opacity = 0;
                    wheen(blackNode).to({opacity:255},500).start();
                    wheen(kuanNode).to({y:0,opacity:255},1000,Wheen.Easing.Elastic.easeOut).start();
                    break; 
                case 2: 
                    pop.x = -cc.winSize.width
                    wheen(pop).to({x:0},200).start(); 
                    break; 
                case 3: 
                    let kNode = pop.getChildByName("kuang");
                    kNode.scale = 2;
                    kNode.opacity = 0;
                    wheen(kNode).to({opacity:255},200).start();
                    wheen(kNode).to({scale:1},200).start(); 
                    break;  
                case 4: 
                    let kNode2 = pop.getChildByName("kuang");
                    kNode2.scale = 2;
                    kNode2.opacity = 0; 
                    kNode2.y  = (cc.winSize.height - kNode2.height)/2 - 100;
                    wheen(kNode2).to({opacity:255},200).start();
                    wheen(kNode2).to({scale:1},200).start(); 
                    break; 
                default:
                    break;
            } 
 
            if(popName == "popExit"){
                pop.parent = cc.find("Canvas/exitLayer");
            }else{
                pop.parent = cc.find("Canvas/popLayer");
            } 
            AppLog.log("open popName :"+popName)

        })
    },

    closePop(popName,isNoAction){ 
        let pop = PopMgr.DICT[popName];
        if(pop){   
            let isPopSet =  PopMgr.PopNameParams[popName];
            let call = (pop)=>{  
                if(!pop.isValid) return AppLog.log("无效Node"+popName);
                if(pop.hasComponent(popName)){ 
                    let script = pop.getComponent(popName);
                    if(script){
                        //用于脚本特殊处理需要清理 或者关闭之后做的事
                        script.exitPop && script.exitPop();
                    } 
                }
                AppLog.log("close popName :"+popName)
                PopMgr.DICT[popName] = null;
                pop.removeFromParent();
                pop.destroy();

                //解锁spine
                if(PopMgr.getCanPopPause() == false){
                    _G.AppDef.PAUSE_GAME = false;
                    whevent.event(_G.EVENT.RESUME_SPINE); 
                }

            }
            if(isNoAction){
                return call(pop);
            } 
            //执行一个从上到下的动画 
            pop.getChildByName("black").active = false; 
            var popStyle = isPopSet ? isPopSet.popStyle : 3;  
 
            switch (popStyle) {
                case 1:
                    wheen(pop).to({y:-cc.winSize.height},200,Wheen.Easing.Elastic.easeInOut).on("finish", call.bind(this,pop) ).start();
                    break; 
                case 2:
                    wheen(pop).to({x:-cc.winSize.width},200,Wheen.Easing.Linear).on("finish", call.bind(this,pop) ).start();
                    break;  
                case 3: 
                    let kNode = pop.getChildByName("kuang")
                    kNode.scale = 1;
                    kNode.opacity = 255;
                    wheen(kNode).to({opacity:0},200).start();
                    wheen(kNode).to({scale:2},200).on("finish", call.bind(this,pop) ).start(); 
                    break;  
                case 4: 
                    let kNode2 = pop.getChildByName("kuang")
                    kNode2.scale = 1;
                    kNode2.opacity = 255;
                    wheen(kNode2).to({opacity:0},200).start();
                    wheen(kNode2).to({scale:2},200).on("finish", call.bind(this,pop) ).start(); 
                    break;  
                default:
                    call(pop);
                    break;
            }   
        }
    },

    /**
     * 关闭所有弹窗
     */
    closeAllPop(){  
        for (const popName in PopMgr.DICT) {  
            if(PopMgr.getPop(popName)){
                if(popName == "popSellTip") return;
                PopMgr.closePop(popName,true); 
            } 
        }  
    },
    
    createTip(txt){  
        if(Utils.isValid(txt)){
            let tip = _G.LangMgr.getText(txt);
            if(tip){
                txt = tip;
            } 
        } 
       if(!PopMgr.tipPool ){
            PopMgr.tipPool = new cc.NodePool();
       }

       let tip = null;
        //c1、当前对象池中的可用对象数量
        if (PopMgr.tipPool.size > 0) {
            //_1、从对象池中获取对象
            tip = PopMgr.tipPool.get();    
             //c2、将生成的节点挂载到节点树上
            tip.parent = cc.find("Canvas");
            //c3、调用enemy的脚本进行初始化
            tip.getComponent('Tip').init(txt); 
        } else {
            //_2、若没有空闲的对象，也就是对象不够用时，就克隆节点
            cc.loader.loadRes("prefabs/Tip", cc.Prefab, function (error, prefab) { 
                if (error) {
                    cc.error(error);
                    return;
                }
                tip = cc.instantiate(prefab); 
                //c2、将生成的节点挂载到节点树上
                tip.parent = cc.find("Canvas");
                //c3、调用enemy的脚本进行初始化
                tip.getComponent('Tip').init(txt); 
            }) 
        } 
    },
    
    closeTip(Tip) { 

        if(PopMgr.tipPool){
            PopMgr.tipPool.put(Tip);
        }
    },

    clearTips(){
        if(PopMgr.tipPool){
            PopMgr.tipPool.clear();
        }
    }

}
 
if(typeof module !== "undefined"){
    module.exports = PopMgr;
}

window.PopMgr = PopMgr;




