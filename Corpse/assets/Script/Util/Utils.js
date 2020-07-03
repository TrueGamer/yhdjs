 /**增加string.format 功能*/
 if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== "undefined" ? args[number] : match;
        });
    };
}
/**增加Date.format 功能*/
if (!Date.prototype.format) {
    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
}
var Utils = cc.Class({ 
        statics:{
            /**
             * 得到一个节点的世界坐标
             * node的原点在中心
             * @param {*} node 
             */
            localConvertWorldPointAR(node) {
                if (node) {
                    return node.convertToWorldSpaceAR(cc.v2(0, 0));
                }
                return null;
            },

            /**
             * 得到一个节点的世界坐标
             * node的原点在左下边
             * @param {*} node 
             */
            localConvertWorldPoint(node) {
                if (node) {
                    return node.convertToWorldSpace(cc.v2(0, 0));
                }
                return null;
            },

            /**
             * 把一个世界坐标的点，转换到某个节点下的坐标
             * 原点在node中心
             * @param {*} node 
             * @param {*} worldPoint 
             */
            worldConvertLocalPointAR(node, worldPoint) {
                if (node) {
                    return node.convertToNodeSpaceAR(worldPoint);
                }
                return null;
            },

            /**
             * 把一个世界坐标的点，转换到某个节点下的坐标
             * 原点在node左下角
             * @param {*} node 
             * @param {*} worldPoint 
             */
            worldConvertLocalPoint(node, worldPoint) {
                if (node) {
                    return node.convertToNodeSpace(worldPoint);
                }
                return null;
            },

            /**
             *  * 把一个节点的本地坐标转到另一个节点的本地坐标下
             * @param {*} node 
             * @param {*} targetNode 
             */
            convetOtherNodeSpace(node, targetNode) {
                if (!node || !targetNode) {
                    return null;
                }
                //先转成世界坐标
                let worldPoint = this.localConvertWorldPoint(node);
                return this.worldConvertLocalPoint(targetNode, worldPoint);
            },

            /**
             *  * 把一个节点的本地坐标转到另一个节点的本地坐标下
             * @param {*} node 
             * @param {*} targetNode 
             */
            convetOtherNodeSpaceAR(node, targetNode) {
                if (!node || !targetNode) {
                    return null;
                }
                //先转成世界坐标
                let worldPoint = this.localConvertWorldPointAR(node);
                return this.worldConvertLocalPointAR(targetNode, worldPoint);
            } ,
        /**
         * 加载resources下的cc.SpriteFrame, cc.AnimationClip, cc.Prefab
         * 不带扩展名
         * @method loadAsset
         * @param {String} url resources下路径
         * @param {typeof cc.Asset} assetType cc.SpriteFrame, cc.AnimationClip, cc.Prefab..
         * @param {Function} [callback] (err:Error,asset:cc.Asset)
         * @param {typeof cc.Asset} callback.asset cc.SpriteFrame, cc.AnimationClip, cc.Prefab..
         */
        loadAsset(url,assetType,callback) {
            let res = cc.loader.getRes(url,assetType);
            if(res){
                if(callback){
                    callback(null,res);
                }
                return;
            }
            cc.loader.loadRes(url,assetType,function(err,asset){
                if(err)console.log("err",err)
                if(callback){
                    callback(err,asset);
                }
            });
        }, 
        
        isNull( value ) {
            if( "undefined" === typeof value ){
                return true;
            }
            if ( null === value ) {
                return true;
            } 

            if(typeof(value) == "number"){
                if(value == 0) return false;
            }

            if(!value){
                return true;
            }

            return false;
        },

        isValid(value){
            return !Utils.isNull( value );
        },

        getValid(value, defaultValue) {
            return Utils.isNull(value) ? defaultValue : value ;
        },

        /**
         * 深拷贝
         * @param {*} obj 
         */
        copy(obj) {
            var newObj;
            if (obj instanceof Array) {
                newObj = [];
            }else if (obj instanceof Object) {
                newObj = {};
            }else {
                return obj;
            }
            var keys = Object.keys(obj);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                newObj[key] = this.copy(obj[key]);
            }
            return newObj;
        },
            /**
         * 获取随机范围内一个数
         * @param {*} maxNum 
         * @param {*} minMum 
         */
        getRandom(maxNum, minMum) {
            return Math.floor(Math.random()*(maxNum-minMum+1)+minMum);
        },

        httpBase(cmd,params){  
            var path = _G.CfgMgr.getUrl(cmd);
            var url = "{0}{1}".format(_G.AppDef.SERVER_URL,path);   
            if(cmd != 121){
                AppLog.log(url+ JSON.stringify(params))
            } 
            _G.HTTP.httpPost(url,JSON.stringify(params),(res)=>{
                if(res == -1) return;
                let resp = res;
                let msgID = resp.msgID; 
                if(resp.ret != 0){  
                    AppLog.log("error:"+JSON.stringify(resp))
                    
                    //合成失败的时候
                    if(resp.ret == 12){
                        return whevent.event(_G.EVENT.ERR_MEGER );  
                    }  
                    //阳光光不足
                    if(resp.ret == 9){
                       return Tools.checkFreePop(resp.ret);
                    }  

                    PopMgr.createTip(resp.ret);
                    //特殊错误处理
                    switch (res.msgID) {
                        case _G.MESSAGE.PET_MERGE:
                            whevent.event(_G.EVENT.RESUM_DRAG_ITEM);
                            break;
                    } 
                    return;
                } 
               
                if(msgID == 103  || msgID == 121){ 
                }else{
                    AppLog.log("服务器返回"+JSON.stringify(resp))
                } 
 
                var data =  resp.data;
                //同步玩家信息
                if(data && data.playerInfo && cmd == _G.MESSAGE.LOGIN ){ 
                    _G.IPlayer.init(data.playerInfo); 
                }else if(data && data.update){
                    _G.IPlayer.synchronPlayerData(data.update); 
                } 

                 //偷个懒检查掉落宝箱
                if (data.boxUpdate && data.boxUpdate.length > 0){
                    AppLog.log("有{0}宝箱掉下来了".format(data.boxUpdate.length))
                    whevent.event(_G.EVENT.DROP_BOX ,data.boxUpdate);
                }

                _G.AppDef.serverTime = resp.ctime;
                _G.AppDef.lastUpdateTime = Math.floor(Date.now() / 1000); 
                // 分发消息的地方
                whevent.event(msgID,data)
            },()=>{
                whevent.event(_G.EVENT.NET_FAIL,{cmd:cmd,params:params});
                //PopMgr.createTip("网络发送失败") 
            }) 
        },
 
        http(cmd,params){ 
            //在执行下一步网络请求
            params = params || {} 
            params.uid = _G.AppDef.UID;
            if(_G.AppDef.KILL_MONSTER_MONEY){
                params.syncMoney = _G.AppDef.KILL_MONSTER_MONEY; 
                _G.AppDef.KILL_MONSTER_MONEY = 0;
            }
            if(_G.AppDef.ADDSPEED_COUNT){
                params.syncSpeed = _G.AppDef.ADDSPEED_COUNT; 
                _G.AppDef.ADDSPEED_COUNT = 0;
            }

            if(_G.AppDef.VIDEO_COUNT){
                if(params.syncAD){
                    params.syncAD = params.syncAD + _G.AppDef.VIDEO_COUNT; 
                }else{
                    params.syncAD = _G.AppDef.VIDEO_COUNT;
                } 
                _G.AppDef.VIDEO_COUNT = 0;
            }

            Utils.httpBase(cmd,params);
        },
 
        get(cmd,params,call,failCb){
            var path = _G.CfgMgr.getUrl(cmd);
            var url = "";
            if(path){
                url= "{0}{1}".format(_G.AppDef.SERVER_URL,path); 
            }else{ 
               url = cmd;
            }
            if(cmd){
                AppLog.log(Utils.isNull(params)? url : url+params);
            }
            url = Utils.isNull(params)? url : url+params;
            _G.HTTP.httpGets(url,(res)=>{
                var resp = res;
                AppLog.log("服务器返回"+JSON.stringify(resp))
                if(resp.code != "0000"){  
                    PopMgr.createTip(resp.errorMessage || resp.code);
                    return;
                }   
                // 分发消息的地方
                call && call(resp.info);
            },()=>{
                failCb && failCb();
                PopMgr.createTip("发送失败，请检查网络后重试!")
            }) 
        },

        get2(cmd,params,call,failCb){
            var path = _G.CfgMgr.getUrl(cmd);
            var url = "";
            if(path){
                url= "{0}{1}".format(_G.AppDef.SERVER_URL,path); 
            }else{ 
               url = cmd;
            }
            if(cmd){
                AppLog.log(Utils.isNull(params)? url : url+params);
            }
            url = Utils.isNull(params)? url : url+params;
            _G.HTTP.httpGets(url,(res)=>{
                var resp = res;
                AppLog.log("服务器返回"+JSON.stringify(resp)) 
                // 分发消息的地方
                call && call(resp);
            },()=>{
                failCb && failCb();
                PopMgr.createTip("发送失败，请检查网络后重试!")
            }) 
        },


        getRotation(p1,p2){ 
            var angle = Math.atan2((p2.y-p1.y), (p2.x-p1.x)) //弧度  0.6435011087932844
            var theta = angle*(180/Math.PI); //角度  36.86989764584402
            return theta;
        },   

        //保留小数点后几位
        toFixed(number,fractionDigits){
            var times = Math.pow(10, fractionDigits);
            var roundNum = Math.round(number * times) / times;
            return roundNum.toFixed(fractionDigits);
        }, 

        // 跨天检查
        checkOtherDay(t1, t2, rt) {
            if (Utils.isNull(t1)) {
                return false;
            }
            t2 = t2 || 0;
            rt = rt || 0;

            if (Math.abs(t2 - t1) > 86400) {
                return true;
            }
            return t2 > Utils.figureResetTime(t1, rt);
        },

        // 计算重置点
        figureResetTime(t1, rt) {
            var rH = Math.floor(rt / 60 / 60);
            var rM = Math.floor(rt / 60 % 60);
            var rS = Math.floor(rt % 60);
            var dd = new Date(2099, 1, 1, rH, rM, rS);
            var rd = dd.getTime() / 1000;
            return t1 + ((rd - t1) % 86400);
        },
    }, 
 
}) 
  
 window.Utils = Utils;