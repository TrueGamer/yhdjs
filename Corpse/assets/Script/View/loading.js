/**
 * 加载
 */
cc.Class({
    extends: cc.Component,

    properties: { 
        bar:cc.ProgressBar,
        proText:cc.Label,
        gameConfig:cc.JsonAsset,  
        visitorBtn:cc.Node,
        wxBtn:cc.Node, 
    },
    
    initListener(){
        whevent.onOnce(_G.MESSAGE.LOGIN,this.onLoginResp,this); 
        whevent.on(_G.MESSAGE.SDK_GET_UID,this.onGetUIDByOpenId,this);
        whevent.on(_G.EVENT.SHOWLOGIN,this.showLoginBtn,this);
        whevent.on(_G.EVENT.SPLASH_END,this.onSplashEnd,this);
    },

    onLoad() {  
        cc.debug.setDisplayStats(false);
        this.visitorBtn.active = false;
        this.wxBtn.active = false;
        this.initMgr();
        this.initListener(); 
        this.bar.node.active = false;
        this.proText.node.active = false; 
        _G.SDKMgr.notifyLoadSuccess();  
    },

    showLoginBtn(){
        this.visitorBtn.active = true;
        this.wxBtn.active = true;
    },

    start(){ 
        this.getGameConfig();  
    }, 
    //开始检查
    beginStart(){ 
        this.showSplashAd();
    },

   //开屏广告
    showSplashAd(){
        SDKMgr.loadSplashAd();
    },
       //开屏广告
    onSplashEnd(){
        let isProto = _G.CfgMgr.getItem("isProto")|| false;
        if(!isProto){
            let call = this.onReadeyLogin.bind(this);
            PopMgr.createPop("popProto",{call:call})
        }else{
            this.onReadeyLogin();
        }
    },

    onReadeyLogin(){ 
        //退出账号后要阻止自动登录
        if(_G.AppDef.IS_EXIT_LOGIN){
            this.visitorBtn.active = true;
            this.wxBtn.active = true;
            return;
        } 
        let touristID = _G.CfgMgr.getItem("touristID");
        if (cc.sys.platform  == cc.sys.ANDROID){ 
            let accessToken = _G.CfgMgr.getItem("accessToken");  
            if(!Utils.isNull(accessToken)){
                SDKMgr.autoWxLogin()
            }else if(!Utils.isNull(touristID)){
                //游客登录
                _G.AppDef.touristId  = touristID;
                whevent.event(_G.MESSAGE.SDK_GET_UID);
            }else{
                this.visitorBtn.active = true;
                this.wxBtn.active = true;
            }
        }else{
              //pc调试 游客登录
            if(!Utils.isNull(touristID)){ 
                _G.AppDef.touristId  = touristID;
                whevent.event(_G.MESSAGE.SDK_GET_UID);
                return;
            }  
            this.visitorBtn.active = true;
            this.wxBtn.active = true;
        }; 
    },
  
    startPreloading:function(){
        var self = this;
        cc.director.preloadScene('main',self.onProgress.bind(self), function () {
            self.onLoadComplete();
        });
    },

    onProgress:function( completedCount, totalCount, item ){ 
        var pro = (completedCount/totalCount);  
        this.bar.progress = pro;
        this.proText.string = "正在加载...{0}%".format(Math.floor(pro*100));
    },

    //获取游戏配置表
    getGameConfig(){   
        let url= "{0}{1}".format(_G.AppDef.SERVER_URL,_G.AppDef.GAME_CFG_URL); 
        Utils.get(url,null,(resp)=>{
            _G.CfgMgr.init( resp.configs );
            //_G.CfgMgr.init(this.gameConfig.json);
            this.beginStart()
        })
    },
 
    /**
     * 加载完毕以后 进入游戏
     */
    onLoadComplete:function(){ 
        if (cc.sys.platform  == cc.sys.ANDROID )
        {
            SDKMgr.closeWxActivity();
        }
        this.enterGame();
    },

    onLoginCheck(){
        Utils.http(_G.MESSAGE.LOGIN,{openId:_G.AppDef.OPENID,uid:_G.AppDef.UID,channelsId:1,gameId:1}); 
    },
  
    onLoginResp(resp){ 
         //登陆界面 播放背景音乐
        console.log("离线经验", resp.earnings)
        if( resp.earnings.money > 0){
            _G.AppDef.offLineExp =  resp.earnings.money;
        } 
        _G.AppDef.offLineHb =  resp.earnings.hb || 0 ; 

        this.bar.node.active = true;
        this.proText.node.active = false; 
        this.startPreloading();   
    },

    //openID换取UID
    onGetUIDByOpenId(){
        this.visitorBtn.active = false;
        this.wxBtn.active = false; 
        let openId = null;
        if(_G.SDKMgr.isTourist){
            openId = _G.AppDef.touristId;
            AppLog.log("游客ID:{0} 换取 UID ".format(_G.AppDef.touristId));
            _G.CfgMgr.setItem("touristID",_G.AppDef.touristId);
        }else{
            AppLog.log("OpenID:{0} 换取 UID ".format(_G.SDKMgr.UserInfo.openid));
            openId =_G.SDKMgr.UserInfo.openid;
        }

        _G.AppDef.OPENID = openId;
        console.log("是否游客:"+_G.SDKMgr.isTourist)
        Utils.get(_G.MESSAGE.SDK_GET_UID,"?openId={0}&isTourist={1}".format(openId,_G.SDKMgr.isTourist),(data)=>{
            _G.AppDef.UID = data.accountId; 
            this.onLoginCheck();
        },()=>{
            this.visitorBtn.active = true;
            this.wxBtn.active = true; 
        }); 
    }, 

    //游客按钮
    onTouristBtn(){

        //如果游客已经登录过了
        let touristID = _G.CfgMgr.getItem("touristID");
        if(!Utils.isNull(touristID)){ 
            _G.AppDef.touristId  = touristID;
            whevent.event(_G.MESSAGE.SDK_GET_UID);
            return;
        }
        
        //获取游客ID
        Utils.get(_G.MESSAGE.GET_TOURIST,null,(data)=>{
            _G.AppDef.touristId  = data.touristId;
            AppLog.log("游客ID"+_G.AppDef.touristId);
            //登陆
            whevent.event(_G.MESSAGE.SDK_GET_UID);
        });
    },

     
    //初始化所有管理器
    initMgr(){
        //初始化人物数据
        let _G = {};
        window._G = _G;
        _G.SDKMgr = require("SdkMgr");
        _G.HTTP = require("HttpUtils");
        _G.AppDef =  require("AppDef");
        _G.MESSAGE = require("message");
        _G.EVENT = require("eventType");
        _G.IPlayer = new (require("IPlayer"));  
        _G.CfgMgr =  new (require("ConfigMgr"));
        _G.LangMgr = new (require("LangMgr"))  
        _G.RedDotMgr = require("RedDotMgr");
        
    },
    
    //进入游戏
    enterGame(){   
        this.node.runAction(cc.sequence(cc.fadeOut(1.0),cc.callFunc(
            function(){
                    cc.director.loadScene("main"); 
                }
            )
        ));  
    },

    //微信授权
    onWeiXinBtn(){
        SDKMgr.authLogin();
    },

    onDestroy(){
        whevent.off(_G.MESSAGE.SDK_GET_UID,this.onGetUIDByOpenId,this);
        whevent.off(_G.EVENT.SHOWLOGIN,this.showLoginBtn,this);
        whevent.off(_G.EVENT.SPLASH_END,this.onSplashEnd,this);
    }

 

});
