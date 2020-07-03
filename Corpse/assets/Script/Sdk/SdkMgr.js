/**
 * SDK
 */ 
var SDKMgr = cc.Class({ 
    properties: {
       
    }, 
    statics:{  
        UserInfo:null,
        tokenInfo:null,
        isTourist:1,//默认游客 
        advCb : null, //播放完成回调
        /**
         * 设置用户ID  SDK获取的
         * nickname, sex, province, city, country, headimgurl; 
         */
        setUserInfo(userInfo){
            _G.SDKMgr.isTourist = 0;
            AppLog.log(JSON.stringify(userInfo))
            SDKMgr.UserInfo = userInfo;
            if(_G.AppDef.ISBIND_WX){
                Utils.get(_G.MESSAGE.TOURIST_BIND_OPENID, "?touristId={0}&openId={1}".format( _G.AppDef.touristId, _G.SDKMgr.UserInfo.openid),()=>{
                    _G.AppDef.ISBIND_WX = false;
                    AppLog.log("绑定成功"+_G.AppDef.touristId +"||"+ _G.SDKMgr.UserInfo.openid);
                    //通知popGetCash更新 
                    whevent.event(_G.EVENT.UPDATE_BIND_INFO);
                }); 
            }
            whevent.event(_G.MESSAGE.SDK_GET_UID);
        }, 
 
        //设置用户信息
        setWxInfo(wxTokenInfo){   
            AppLog.log(JSON.stringify(wxTokenInfo))
            if(typeof wxTokenInfo == "string"){
                SDKMgr.tokenInfo = JSON.stringify(wxTokenInfo);
            }else{
                SDKMgr.tokenInfo = wxTokenInfo;
            }  
            _G.CfgMgr.setItem("accessToken",JSON.stringify(wxTokenInfo)); 
            this.autoWxLogin();
        },


        /**
         * 通知加载资源成功关闭闪屏
         */
        notifyLoadSuccess(){ 
            if (cc.sys.platform  == cc.sys.ANDROID){
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "closeSplash", "()V");
            };  
        },

         /**
         * 微信授权
         */
        authLogin(){ 
            if (cc.sys.platform  == cc.sys.ANDROID){
                jsb.reflection.callStaticMethod("com.lz.yhdjs.wxapi.WXEntryActivity", "SendAuthRequest", "(Ljava/lang/String;Ljava/lang/String;)V","snsapi_userinfo","wechat_sdk_demo");
            };  
        },
        

        /**
         *关闭微信授权
         */
        closeWxActivity(){ 
            if (cc.sys.platform  == cc.sys.ANDROID){
                //jsb.reflection.callStaticMethod("com.lz.yhdjs.wxapi.WXEntryActivity", "closeWxActivity", "()V");
            };  
        },
 
        //自动登陆
        autoWxLogin(){ 
            //if (cc.sys.platform != cc.sys.ANDROID){return};

            let tokenInfo = _G.CfgMgr.getItem("accessToken");  
            AppLog.log("tokenInfo"+tokenInfo)
            if(Utils.isNull(tokenInfo)){
                whevent.event(_G.EVENT.SHOWLOGIN); 
                return;
            }
            _G.SDKMgr.tokenInfo = JSON.parse(tokenInfo);
            let accessToken = SDKMgr.tokenInfo.access_token;
            let openId =  SDKMgr.tokenInfo.openid;
            let refresh_token = SDKMgr.tokenInfo.refresh_token;
            //检查token是否有效
             Utils.get2("https://api.weixin.qq.com/sns/auth","?access_token={0}&openid={1}".format(accessToken,openId),(resp)=>{
                 if(resp.errcode == 0){
                     //token有效
                    Utils.get2("https://api.weixin.qq.com/sns/userinfo","?access_token={0}&openid={1}".format(accessToken,openId),(resp)=>{
                        if(resp.errcode){
                            //获取用户信息失败
                            PopMgr.createTip(resp.errcode + resp.errmsg);
                            AppLog.log(resp.errcode,resp.errmsg)
                            if(resp.errcode == 40003){
                                _G.CfgMgr.setItem("accessToken",""); 
                                whevent.event(_G.EVENT.SHOWLOGIN); 
                            }
                        }else{
                            SDKMgr.setUserInfo(resp);
                        }
                    })  
                 }else{
                    //token无效
                    Utils.get2("https://api.weixin.qq.com/sns/oauth2/refresh_token","?appid={0}&grant_type=refresh_token&refresh_token={1}".format(_G.AppDef.APP_ID,refresh_token),(resp)=>{
                        if(resp.errcode){
                            //有错误了 
                            PopMgr.createTip(resp.errcode + resp.errmsg);
                            _G.CfgMgr.setItem("accessToken",""); 
                            whevent.event(_G.EVENT.SHOWLOGIN);
                        }else{
                            //刷新Token
                            SDKMgr.tokenInfo = resp;
                            AppLog.log("刷新token===>",JSON.stringify(resp))
                            _G.CfgMgr.setItem("accessToken",JSON.stringify(resp)); 
                            SDKMgr.autoWxLogin();
                        }    
                    })
                 }
            })  
        },

        //绑定微信
        bindWx(){
            if (cc.sys.platform  == cc.sys.ANDROID){
                _G.AppDef.ISBIND_WX = true;
                jsb.reflection.callStaticMethod("com.lz.yhdjs.wxapi.WXEntryActivity", "bindSendAuthRequest", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V","snsapi_userinfo","wechat_sdk_demo","bindWx");
            };  
        },
        //绑定授权返回 
        notifyErrorBind(userInfo){
            //绑定授权回来
            AppLog.log("设置UserID",userInfo)
            AppLog.log(JSON.stringify(userInfo))
            SDKMgr.UserInfo = userInfo; 
            _G.SDKMgr.isTourist = 0;  
            AppLog.log("发起绑定") 
        },
  
        notifyError(){
            
        },
        
        /**
         * 初始化加载广告
         */
        onLoadAdv(){
            if (cc.sys.platform  == cc.sys.ANDROID){ 
                jsb.reflection.callStaticMethod("com.lz.yhdjs.ttapi.TTGameRewardVideo", "initLoad", "()V",); 
            };   
        },

        /**
         * 播放视频
         */
        showRewardVideoAd(call,type){
            AppLog.log("播放视频 ： 类型" + type)
            SDKMgr.advCb = call;
            SDKMgr.callType = type;
            if (cc.sys.platform  == cc.sys.ANDROID){   
                jsb.reflection.callStaticMethod("com.lz.yhdjs.ttapi.TTGameRewardVideo", "showRewardVideoAd", "()V",);
                AppLog.log("game 请求播放广告")
            }else{
                if(_G.AppDef.IS_DEBUG){
                    SDKMgr.androidVideoFinish(1);
                }
            } 
        }, 

        /**
         * 安卓激励视频完成奖励通知
         */
        androidVideoFinish(code){ 
            AppLog.log("播放完androidVideoFinish：" + code)
            if(code == 1){ 
                if(SDKMgr.advCb){ 
                    SDKMgr.advCb(); 
                } 
                SDKMgr.advCb = null;
                 //上报U盟统计
                 if (cc.sys.platform  == cc.sys.ANDROID){  
                    let params = {
                        uid:_G.IPlayer.getKey("uid"),
                        time:Tools.getTime(),
                        type:SDKMgr.callType
                    }
                    jsb.reflection.callStaticMethod("com.lz.yhdjs.umapi.UmengApplication", "sendEvent", "(Ljava/lang/String;)V",JSON.stringify(params));
                    console.log("upload Type:"+SDKMgr.callType)

                      //上报适服务器
                    let channeID = SDKMgr.getUmengChannel();
                    console.log("渠道："+channeID)
                    Utils.get(_G.MESSAGE.REPORT_SERVER,"?handlerId={0}&time={1}".format(channeID,1)); 
                } 
            }else{
                PopMgr.createTip("播放失败");
            }
        },

        
        //完成新手引导
        guideEndEvent(){   
            if (cc.sys.platform  == cc.sys.ANDROID){  
                let params = {
                    uid:_G.IPlayer.getKey("uid"),
                    time:Tools.getTime(),
                    type:"guide"
                }
                jsb.reflection.callStaticMethod("com.lz.yhdjs.umapi.UmengApplication", "sendGuideEvent", "(Ljava/lang/String;)V",JSON.stringify(params));
                AppLog.log("上报友盟成功")
            }
         },


         /**
          * 获取友盟渠道标记
          */
         getUmengChannel(){
            if (cc.sys.platform  == cc.sys.ANDROID){   
                let channel = jsb.reflection.callStaticMethod("com.lz.yhdjs.umapi.UmengApplication", "getUmengChannel", "()Ljava/lang/String;");
                AppLog.log("上报友盟成功渠道:" + channel)
                return channel;
            }
         },


         loadExpressAd(){
            AppLog.log("展示信息流:loadExpressAd")
            if (cc.sys.platform  == cc.sys.ANDROID){    
                jsb.reflection.callStaticMethod("com.lz.yhdjs.ttapi.TTGameExpressAd", "loadExpressAd", "()V",);
                AppLog.log("展示信息流:") 
            }

         },

         closeExpressAd(){
            AppLog.log("关闭信息流: closeExpressAd" ) 
            if (cc.sys.platform  == cc.sys.ANDROID){   
                jsb.reflection.callStaticMethod("com.lz.yhdjs.ttapi.TTGameExpressAd", "onDestroyExpress", "()V",);
                AppLog.log("关闭信息流:" ) 
            }
         } 
    } 
});

window.SDKMgr = SDKMgr;