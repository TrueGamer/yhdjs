/**
 * 游戏逻辑工具类
 */

var digitsRE = /(\d{3})(?=\d)/g
var Tools = cc.Class({
    statics:{
        _gid:10000,
        getGID(){
            return Tools._gid++;
        },
        
         //获得单位 只展示3位
        getCompany(value,pos){  
            if(!value) return 0;
            pos = Utils.isNull(pos) ? 0:pos;
            var ErShiYi = Math.pow(10,21)
            var ShiBaWei = Math.pow(10,18)
            var ShiWuWei = Math.pow(10,15)
            var ShiErWei = Math.pow(10,12)
            var JiuWei = Math.pow(10,9)
            var LiuWei = Math.pow(10,6)
            var SanWei = Math.pow(10,3) 
            var str = value
            if(value > ErShiYi ){
                //21位  K
                str = Utils.toFixed(value/ErShiYi,pos) + "b" 
            }
            else if(value > ShiBaWei){
                //18位  K
                str = Utils.toFixed(value/ShiBaWei,pos) + "e" 
            }else if(value > ShiWuWei){
                //15位  K
                str = Utils.toFixed(value/ShiWuWei,pos) + "p" 
            }else if(value > ShiErWei){
                //12位  K
                str = Utils.toFixed(value/ShiErWei,pos) + "t" 
            }else if (value > JiuWei){
                //9位  K
                str = Utils.toFixed(value/JiuWei,pos) + "g" 
            }else if( value > LiuWei){ 
                //6位  K
                str = Utils.toFixed(value/LiuWei,pos) + "m" 
            } else if( value > SanWei ){ 
                //3位  K
                str = Utils.toFixed(value/SanWei,pos) + "k" 
            }else{
                str = Utils.toFixed(value,pos)
            }
            return str;
        },


       isCheckNum(key,comp){
            //购买判断
            var value = _G.IPlayer.getKey(key) 
            if(!value) return false;
            switch (key) {
                case "money":
                    if( value < comp){
                        PopMgr.createTip("铜钱不够")
                        return false
                    }
                    return true ; 
                 case "diamond":
                    if( value < comp){
                        PopMgr.createTip("元宝不够")
                        return false
                    } 
                    return true ;  
                default: 
                    if( value < comp){
                        PopMgr.createTip("不够")
                        return false
                    } 
                    return true ;   
            } 
        },

        //是否能购买
        isCanBuy(monsterCtrls){
            let isBuy = true;
            for (const key in monsterCtrls) { 
                const itemCtrl = monsterCtrls[key]; 
                if(itemCtrl.slot < 5) continue;
                if(itemCtrl.level == 0){
                    isBuy = false;
                    break;
                }
            } 
            return isBuy;
        },
 
        //自动同步金币
        autoSyncMoney(){
             //自动同步金币 如果发生没有交互
            if( _G.AppDef.lastUpdateTime - Math.floor(Date.now() / 1000) > _G.AppDef.STATIC_MAX_TIME ){
                _G.AppDef.lastUpdateTime = Math.floor(Date.now() / 1000);
                AppLog.log("自动同步")
                Utils.httpBase(_G.MESSAGE.SYNC_MONEY,{money:_G.IPlayer.getKey("money")});
            } 
        },

        /**
         * 获取植物总战力
         */
        getPetPower(){ 
            let pet = _G.IPlayer.getKey("pet");
            let list = pet.list;
            let totalPower = 0;
            for (let index = 0; index < list.length; index++) {
                const petInfo = list[index];
                if(petInfo.level == 0) continue ;
                let  plant = _G.CfgMgr.getConfig("plant",petInfo.level);
                totalPower += plant.power;
            }
            return totalPower;
        },

          //打包奖励
        unPack(array){
            var dict = {};
            for (var key in array) {
                var info = array[key];
                if(dict[info.itemID] == null){
                    dict[info.itemID] = 0;
                }
                dict[info.itemID] = info.num + dict[info.itemID];  
            } 
            return dict;
        },

           //获取当前时间 去除毫秒
        getTime(){  
            return _G.AppDef.serverTime + Math.floor(Date.now() / 1000) -  _G.AppDef.lastUpdateTime
        },

        addPreZero(num){ 
            let m=Math.floor(num/60%60);
            let s=Math.floor(num%60);  
            return "{0}:{1}".format( ('00'+m).slice(-2), ('00'+s).slice(-2))
        },

        addPreZeroEx(num){ 
            let h=Math.floor(num/60/60)
            let m=Math.floor(num/60%60);
            let s=Math.floor(num%60);  
            return "{0}:{1}:{2}".format( ('00'+h).slice(-2),('00'+m).slice(-2), ('00'+s).slice(-2))
        },

        //检查第一排炮塔是否有植物
        checkTownInPlant(){   
            let pet = _G.IPlayer.getKey("pet");
            let list = pet.list; 
            for (let index = 0; index < 5; index++) {
                const pet = list[index];
                if(pet.level >0) return true ;
            }
            return false;
        }  
        
        ,
        //Tools.playSound("SHOW")
        playSound(audio){  
            var audioMgr = cc.find("Canvas").getComponent("AudioMgr")
            audioMgr && audioMgr._playSFX(audioMgr[audio]); 
        },

         //设置玩家名字，限制长度
        setPlayerName(str, n) {
            if (Utils.isNull(str) || str == "" || str == "null") {
                return "神秘人";
            }
            //str = stripscript(str);//取消名字的屏蔽
            n = n || 8;
            var r = /[^\x00-\xff]/g;
            if (str.replace(r, "mm").length <= n) {
                return str;
            }
            var m = Math.floor(n / 2);
            for (var i = m; i < str.length; i++) {
                if (str.substr(0, i).replace(r, "mm").length >= n) {
                    return str.substr(0, i) + "...";
                }
            }
            return str;
        },
        currency (value, currency, decimals) {
            value = parseFloat(value)
            if (!isFinite(value) || (!value && value !== 0)) return ''
            currency = currency != null ? currency : '$'
            decimals = decimals != null ? decimals : 2
            var stringified = Math.abs(value).toFixed(decimals)
            var _int = decimals
                ? stringified.slice(0, -1 - decimals)
                : stringified
            var i = _int.length % 3
            var head = i > 0
                ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
                : ''
            var _float = decimals
                ? stringified.slice(-1 - decimals)
                : ''
            var sign = value < 0 ? '-' : ''
            return sign + currency + head +
                _int.slice(i).replace(digitsRE, '$1,') +
                _float 
        }, 

        //获取掉落格子的当前怪物序列
        getRandomBox(){
            //检查计算杀掉僵尸的数量，进行掉落宝箱 
            let maxLevel = _G.IPlayer.getKey("pet").maxLevel;
            let boxPro = _G.CfgMgr.getConfigs("boxPro");
            let length = Object.keys(boxPro).length;
            let minNum = 30;
            let maxNum = 50;
            for (let index = length ; index > 0; index--) {
                const info = boxPro[index];
                if(maxLevel >= info.minLv  && maxLevel <= info.maxLv ){
                    minNum = info.minGap;
                    maxNum = info.maxGap;
                }
            }
            let random = Utils.getRandom(maxNum,minNum);
            return random;
        }, 

        //检查免费阳光弹窗
        checkFreePop(ret){
            let count = _G.IPlayer.getKey("freeMoneyNum") + 1;
            let config =  _G.CfgMgr.getConfig("freeSun",count);
            let freeMoneyLastTime = _G.IPlayer.getKey("freeMoneyLastTime")
            let gapTime = config.gapTime - (Tools.getTime() - freeMoneyLastTime);
            let txt = _G.LangMgr.getText(ret).format(gapTime);
            if(!config) return PopMgr.createTip(ret); 
            if( gapTime < 0 ){
                PopMgr.createPop("popFreeSun");
            }else{

                let tipsConfig = _G.CfgMgr.getConfigs("tips");
                let length = Object.keys(tipsConfig).length;
                let randomN = Utils.getRandom(length,1);
                let text = tipsConfig[randomN] && tipsConfig[randomN].text || ret;
                PopMgr.createTip(text);
            }
        },

        /**
         * 检查新手钻石购买植物引导
         */
        checkShopGuide(){ 
            //引导过就不执行了
            let guide =_G.IPlayer.getKey("guide")
            if(guide >= _G.AppDef.MaxGuideStep){
                return;
            }  
            //新手引导第9步开始引导钻石
            if( guide < 9 ) return
            let maxLevel = _G.IPlayer.getKey("pet").maxLevel; 
            //钻石购买规则是N-2 金币购买N-4 也就是最低8级 才能引导钻石购买
            if(maxLevel < 6)return; 
            let zslevel = maxLevel - _G.AppDef.BUY_DIAMOND_LIMIT;;
            var buyNum = _G.IPlayer.getGoldBuyRecord(zslevel)
            var config = _G.CfgMgr.getConfig("petRmbShop",zslevel)
            var saleGold = Utils.toFixed(config.a + (buyNum -1) * config.b,0) 
            let diamond =  _G.IPlayer.getKey("diamond"); 
            //钻石不够不引导
            if( diamond < saleGold) return; 
            whevent.event("task3");
        },


        //检查新手红包
        checkGuideRedPack(){
            let hongbao = _G.IPlayer.getKey("hongbao")
            if(hongbao.newUserHb == -1){ 
                PopMgr.createPop("popRedPack",{title:"新人红包",redPackType:_G.AppDef.RED_PACK_TYPE.NEW_USER_HB})
            }else{ 
                whevent.event(_G.EVENT.GUIDE_CONTINUE);
            }
        },
    } 
});
if (typeof module !== 'undefined') {
	module.exports = Tools;
}
window.Tools = Tools;