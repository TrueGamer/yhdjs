/**
 * 音乐管理器
 */
;
cc.Class({
    extends: cc.Component,

    properties: {
         BG:{
            type:cc.AudioClip, 
            default:null
         },
         BG2:{
            type:cc.AudioClip, 
            default:null
         },
         BTN:{
             type:cc.AudioClip,
             default:null
        }, 
        COMBINE:{
            type:cc.AudioClip,
            default:null
       }, 
        SELL:{
                type:cc.AudioClip,
                default:null
        }, 
        SHOW:{
            type:cc.AudioClip,
            default:null
        },
        //放置
        RELEASE:{
            type:cc.AudioClip,
            default:null
        },
        //射击飞镖
        DARTS:{
            type:cc.AudioClip,
            default:null
        },
        //射击子弹
        BULLET:{
            type:cc.AudioClip,
            default:null
        },
        //普通受击
        HIT:{
            type:cc.AudioClip,
            default:null
        },
        //带防具受击
        HIT2:{
            type:cc.AudioClip,
            default:null
        },
        //失败
        FAIL:{
            type:cc.AudioClip,
            default:null
        },

        COMEIN:{
            type:cc.AudioClip,
            default:null 
        },
        //购买新植物
        ADDPLANT:{
            type:cc.AudioClip,
            default:null
        },
        WIN:{
            type:cc.AudioClip,
            default:null
        }
    },
 
    initSet(){ 
        let _isSound = _G.CfgMgr.getItem("SoundVal")
        this._isSound = Utils.isNull(_isSound) ? 1 : parseFloat(_isSound);
        let _isMusic = _G.CfgMgr.getItem("MusicVal")
        this._isMusic = Utils.isNull(_isMusic) ? 1 : parseFloat(_isMusic);
        AppLog.log("初始化 音乐：",this._isMusic);
        AppLog.log("初始化 音效：",this._isSound);
    },

    onLoad(){  

        this.bgUrl = "BG";
        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });

        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
        });
    },

    openSound()
    {
        this._isSound = 1;
        _G.CfgMgr.setItem("SoundVal", this._isSound) 
        AppLog.log("开启音效");
    },

    closeSound()
    {
        this._isSound = 0;
        _G.CfgMgr.setItem("SoundVal", this._isSound)
        AppLog.log("关闭音效");
    },

    openMusic()
    {
        this._isMusic = 1;
        this.resumeMusic();
        //暂停全部背景音乐 
        _G.CfgMgr.setItem("MusicVal", this._isMusic) 
    },

    resumeMusic: function() {
        switch(this.nowPlayID)
        {
            case 0:
                this.playBgmLoading();
                break; 
        }
    },

    closeMusic()
    {
        this.stopMusic();
        this._isMusic = 0;
        _G.CfgMgr.setItem("MusicVal", this._isMusic);
    },

    playBgmLoading: function(url) { 

        if(this.bgUrl == url) return;

        if(!Utils.isNull(url)){
            this.bgUrl = url;
        }  
        this.nowPlayID = 0;
        if(this._isMusic == 0)  return;
        this.stopMusic();
        this._playMainId = cc.audioEngine.play( this[ this.bgUrl ], true );
    },
 
    stopMusic: function() {
        cc.audioEngine.stopAll() 
    },
 
    _playSFX: function(clip) { 
        if(this._isSound == 0)
        {
            return;
        }
        //播放音效
        cc.audioEngine.playEffect( clip, false );
    },
    
    playSound(url){
        let sound = this[url];
        if(sound){
            this._playSFX(sound); 
        }else{
            console.error("no find sound url:"+url)
        }
    },
  
    playBtn(){ 
        this._playSFX(this.BTN);
    },

    playSell(){ 
        this._playSFX(this.BTN);
    },

    playComBine(){ 
        this._playSFX(this.COMBINE);
    }

});
