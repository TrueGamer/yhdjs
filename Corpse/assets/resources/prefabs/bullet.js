//子弹
let TYPE = cc.Enum({
    MOSTER:0, //怪物
    WALL:1,   //墙壁
})
var Vector2d = require( "vector2d" )
cc.Class({
    extends: cc.Component,

    properties: {
         // 子弹初始角度
        angle:{
            type:cc.Integer,
            default:0,
            visible:false
        },
        // 子弹攻击力，基础攻击力
        attack:{
            type:cc.Integer,
            default:4,
            visible:false
        },
        // 子弹速度
        speed:16, 

        index:{
            default:9,
            type:cc.Integer,
            notify(){
                this.setBulletModel();
            }
        }, 
        tuowei:cc.Node
    },

    setBulletModel(){
       let spriteEx =  this.node.getComponent("SpriteEx") 
       spriteEx.index  = this.index;  


       let box = this.node.getComponent(cc.BoxCollider)
       box.size.width = spriteEx.node.width;
       box.size.width = spriteEx.node.height; 
        
    },

    checkDie(isDie){  
        if(isDie){ 
            this.enabled = false;
            this.game.collectBullet(this.node);
            return;
        }  
        //判断界限 超出战斗范围
        if( this.isBoom){
            let isOver = false;
            if(this.node.y < this.maxBottomY) {
                isOver = true;
            }
            else if(this.node.y > this.maxTopY ){
                isOver = true;
            }  
            else if(this.node.x > this.maxRightX){
                isOver = true;
            }  
            else if(this.node.x <  this.maxLeftX){
                isOver = true; 
            } 

            if(isOver){ 
                this.enabled = false;
                this.game.collectBullet(this.node);
            }  
        }
    },

    onCollisionEnter(other, self) {   
        //如果碰到怪物 还能再碰怪物  不能碰墙
        //如果碰到了墙 还能再碰怪物  不能再碰墙  
        var otherVec = null;
        let DIR = other.node.getComponent("DIR");
        if(DIR.type == TYPE.WALL && this.isBoom == true){ 
            return this.checkDie(true);
        } 
        if(DIR.type == TYPE.WALL && this.isBoomMonster == true){ 
            return this.checkDie(true); 
        }

        if( DIR.type == TYPE.MOSTER && this.isBoomMonster == true){
            return this.checkDie(true); 
        }

        //如果是最下面的档板也直接回收
        if(DIR.tag == 2)return this.checkDie(true); 
        var revise = 1;
        switch (DIR.type) {
            case TYPE.MOSTER:
                // 计算怪物向量(设置怪物为一个圆，向量等于圆心减碰撞点。记得改为单位向量Vector2d.normalize())
                var monsterVec = new Vector2d( other.node.x+other.offset.x,other.node.y+other.offset.y );
                var bulletVec = new Vector2d( this.node.x, this.node.y );
				if ( this.node.x < monsterVec.x ) {
					revise = -1;
				}
                otherVec = monsterVec.sub(bulletVec);
                otherVec = otherVec.normalize();
                break;
            case TYPE.WALL: 
                // 计算碰撞物向量(墙壁我固定向量)
                otherVec = new Vector2d( DIR.dir.x,DIR.dir.y );
                otherVec = otherVec.normalize(); 
                break;
            default:
                break;
        }

		// 计算两向量夹角cosθ=（a,b的向量积）/（a的模*b的模）
		var dot = this.node.direVec.dotProduct( otherVec );
		var len = this.node.direVec.length() * otherVec.length();
		var angle = Math.acos( dot/len ) / Math.PI * 180;
	  
        if( DIR.type == TYPE.MOSTER ) {
			angle = 90 - angle;
			angle *= revise;
        }  
		// 调整方向 
        this.rotation += angle*2;
        this.node.rotation = this.rotation;
		var sx = Math.sin(this.node.rotation / 180 * 3.14);
        var sy = Math.cos(this.node.rotation / 180 * 3.14);
		this.node.direVec = new Vector2d( sx, sy );
		this.node.direVec = this.node.direVec.normalize();
        
        //碰壁后反弹一次  超出界限就回收
        if( DIR.type == TYPE.WALL ) { 
            this.isBoom = true; 
        }
        if(DIR.type == TYPE.MOSTER){ 
            this.isBoomMonster = true;
        }
    },
    
    shot(game,speed,isRotate) {
        // 启动update函数
        this.game = game;
        this.enabled = true;
        this.isBoom = false;
        this.isBoomMonster = false;
        this.isRotate = isRotate; 
        //有手指指定攻击方向的时候 
        if(this.node.itemCtrl.find("paota").model){
            this.angle = this.node.itemCtrl.find("paota").model.find("sp").rotation;
        }  
        this.rotation = this.angle ; 
        this.node.rotation = this.rotation ;
        this.node.zIndex = 9999;
        let parent = this.node.parent;  
        this.maxRightX = parent.width >> 1;
        this.maxLeftX  = -this.maxRightX;
        this.maxTopY   = parent.height >> 1;
        this.maxBottomY = -this.maxTopY;
        this.speed = speed/1000;
       
    },

    update(dt) {   

        if(_G.AppDef.PAUSE_GAME) return;
        
        let speed = this.speed;
        if(_G.AppDef.ADD_SPEED_TIME > 0){
            this.tuowei.active = true;
            speed = speed * 2
        }else{
            if(this.tuowei.active){
                this.tuowei.active = false;
                _G.AudioMgr.playBgmLoading("BG");
            }
        }
        this.node.x += this.node.direVec.x * speed;
        this.node.y += this.node.direVec.y * speed;
        
        if(this.isRotate){
            if(Utils.isNull(this.node.rotation))return;
            let rotation = Math.floor(this.node.rotation +  dt * 1000); 
            if(rotation> 360){
                this.node.rotation = 0
            }
            else if(rotation <= 0){
                this.node.rotation = 360;
            }else{ 

                if(Utils.isNull(rotation)){ 
                    this.node.destroy();
                    return   
                } 
                this.node.rotation = rotation;
            } 
        } 
        this.checkDie();
    }
});
