
/**
 *红点管理器  检测一些功能是否开启 是否应该关闭
 */
var RedDotMgr = cc.Class({

    statics:{
            /**
             * 检查是否已经签到过
             * false 签到过了
             * True 没签到
             */
            checkIsSignIn(){
                let resetTime = _G.CfgMgr.getSysConfig(1); 
                var signIn = _G.IPlayer.getKey("signIn"); 
                const isNextDay = Utils.checkOtherDay(signIn.lastTime,Tools.getTime(),resetTime);
                return isNextDay; 
            },

            checkTask(){
                let taskConfig = _G.CfgMgr.getConfigs("task")
                let achieveConfig = _G.CfgMgr.getConfigs("achieve") 
                
                //日常任务检查
                var dailyTaskRecord = _G.IPlayer.getKey("dailyTaskRecord");  
                for (var key in taskConfig) {  
                    if(dailyTaskRecord[key] && dailyTaskRecord[key].state == 2){
                        return true;
                    }
                }   
                //成就任务检查
                var achievementRecord = _G.IPlayer.getKey("achievementRecord"); 
                for (var key in achievementRecord) { 
                    var info = achievementRecord[key];  
                    if(info && info.state == 2) return true;
                }  
                return false;
            }, 

            checkTurn(){ 
                let roll = _G.IPlayer.getKey("roll"); 
                return roll.ticket > 0;
            },
 
            checkBank(){ 
                let exp =_G.IPlayer.getKey("moneyBox"); ; 
                let rankID = _G.IPlayer.getKey("rank");
                let titleInfo = _G.CfgMgr.getConfig("title",rankID);
                return exp >=  titleInfo.bankExp;
            } ,

            checkFreeZuanShi(){  
                let freeZS = _G.CfgMgr.getConfigs("freeZS");
                let maxLen = Object.keys(freeZS).length; 
                let count = _G.IPlayer.getKey("freeDiamondNum"); 
                if(count >= maxLen  ){ 
                    return false;
                } 
                return true;
            } ,


            /**
             * 检查是否打工完成
             */
            checkWork(){ 
                //开始工作 
                let work = _G.IPlayer.getKey("work");  
                //暂时没有开始工作
                if(!work || work.id == 0 ){ 
                    return false;
                }
                let info = _G.CfgMgr.getConfig("working",work.id);  
                let endTime = work.startTime +  info.time;
                let curtime = Tools.getTime();
                let djsTime = (endTime - curtime ) > 0  ? endTime - curtime : 0 ;
                return djsTime <= 0;
            },

            checkRedPack(){


                return false;
            }

        }
    }
)
module.export = RedDotMgr;

