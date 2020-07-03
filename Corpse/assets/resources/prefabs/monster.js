//子弹
var Vector2d = require( "vector2d" )
cc.Class({
    extends: cc.Component,

    properties: { 
        // 子弹速度
        speed:16,
        hp:1, 
        probar:cc.Node
    },

    onLoad(){  
       
    },
 
    onCollisionEnter(other, self) {  
        if(this.isStop ) return;
        let dir = other.node.getComponent("DIR");
        
        //撞到死亡线
        if(dir && dir.tag == 5){
            Tools.playSound("FAIL");
            return this.game.killAllMonster();
        }
        //被子弹打了 
        if(this.hp >= 0){
            let hurt = other.node.power;
            this.hp -= hurt;
            let hp = this.hp > 0 ? this.hp : 0;  
            cc.setText(this.probar,hp/this.maxHp)
            if(hp <= 0){
                this.probar.active = false;
            }
            
            this.hit();
        }
    },

    walk(){ 
        if(this.hp <= 0)return;
        this.spine.setAnimation(0, 'walk',true);
    },

    hit(){  
        Tools.playSound( this.monsterInfo.sound );
        this.spine.clearTrack(0);
        this.spine.setAnimation(0, 'hit');
    },

    dead(isAutoKill){
        this.isAutoKill = isAutoKill;
        this.enabled = false; 
        this.isStop  = true;  
        this.spine.clearTrack(0); 
        this.spine.setAnimation(0, 'dead');
    },
    
    /**
     * 开始激活
     * @param {*世界控制器} game 
     * @param {*血量} hp 
     * @param {*怪物id} monsterId 
     * @param {*速度} speed 
     */
    run(game,hp,monsterId,speed) { 
        // 启动update函数
        this.enabled = true;
        let self = this;
        this.isAutoKill = false;
        this.game = game; 
        let parent = this.node.parent;
        this.maxBottomY = -parent.height >> 1; 
        this.hp = hp;
        this.maxHp = hp;
        cc.setText(this.probar,hp/this.maxHp)
        this.probar.active = true;
        this.speed = speed/100000; 
        this.isStop = false; 
        let monsterInfo = _G.CfgMgr.getConfig("monster",monsterId); 
        this.monsterInfo = monsterInfo;
        let url = "monster/{0}/{0}".format(monsterInfo.model); 
        let spine = this.node.find2("sp",sp.Skeleton); 
        if(spine){  
            spine.destroy(); 
            spine = null;
        }
        let node = this.node.find("sp");
        spine = node.addComponent(sp.Skeleton);
        Utils.loadAsset(url,sp.SkeletonData,(err, skeletonData)=>{
            if(err)return;
            spine.skeletonData = skeletonData; 
            self.initMonitor(spine);  
            self.spine = spine;
            self.spine.timeScale = 1.5;
            self.walk();
        });
    },
    
    initMonitor(spine){
        if(!spine)return;
        spine.setCompleteListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            if (animationName === 'dead') {
                this.killMonster(); 
            }
            if (animationName === 'hit') { 
                this.walk();
            }
        });
   },

    killMonster(){
        this.hp = 0;  
        //阳光 
        this.game.collectMonster(this.node,this.isAutoKill);  
    },
    
    update(dt) {   

        if(_G.AppDef.PAUSE_GAME) return;
        if(this.isStop ) return;
        //this.node.y +=  Math.floor(dt * - this.speed);
        this.node.y -=  this.speed;
        if(this.hp <= 0 ){
            this.isStop = true; 
            this.dead();  
        }
    },
 
    setPauseSpine(){ 
        if(this.spine){
            this.spine.timeScale = 0;
        } 
     },
     setResumeSpine(){ 
         if(this.spine){
             this.spine.timeScale = 1.5;
         } 
      }


});
