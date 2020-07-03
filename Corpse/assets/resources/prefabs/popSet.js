/**
 * 设置界面
 */
cc.Class({
    extends: cc.Component,

    properties: {
         musicBtn:cc.Node,
         soundBtn:cc.Node,
    }, 

    onLoad () {
        this.musicBtn.find2("icon-di1/music","SpriteEx").index = Utils.isNull(_G.AudioMgr._isMusic) ? 1 : Number(_G.AudioMgr._isMusic);
        this.soundBtn.find2("icon-di1/music","SpriteEx").index = Utils.isNull(_G.AudioMgr._isSound) ? 1 : Number(_G.AudioMgr._isSound); 
        cc.setText(this.node.find2("kuang/uidLab"),_G.IPlayer.getKey("uid")); 
        
    }, 
  
    setMusic : function(e){  
        _G.AudioMgr._isMusic = !_G.AudioMgr._isMusic;
        if(_G.AudioMgr._isMusic){
             this.musicBtn.find2("icon-di1/music","SpriteEx").index = 1;
            _G.AudioMgr.openMusic()
        }else{
            this.musicBtn.find2("icon-di1/music","SpriteEx").index = 0;
            _G.AudioMgr.closeMusic()
        }  
    },
    
    setSound : function(e){ 
        _G.AudioMgr._isSound = !_G.AudioMgr._isSound;
        if(_G.AudioMgr._isSound){
            this.soundBtn.find2("icon-di1/music","SpriteEx").index = 1;
            _G.AudioMgr.openSound()
        }else{
            this.soundBtn.find2("icon-di1/music","SpriteEx").index = 0;
            _G.AudioMgr.closeSound()
        }  
    },

    closePop(){
        PopMgr.closePop("popSet");
    },

    /**
     * 登出账号
     */
    onLoginOut(){
        PopMgr.createPop("popExit",{isSetPop:true});
    },
 
    //退出弹窗doing someing
    exitPop(){


    }  

    // update (dt) {},
});
