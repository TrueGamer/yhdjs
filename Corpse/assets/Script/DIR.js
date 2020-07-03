/**
 * 方向
 */
let TYPE = cc.Enum({
    MOSTER:0, //怪物
    Wall:1,   //墙壁
})

let WALL_TYPE = cc.Enum({
    NONE:0,
    TOP:1, //上墙
    BOTTOM:2,   //下墙
    LEFT:3,  //左墙
    RIGHT:4, //右墙
    DIE:5,//死墙
})
  
cc.Class({
    extends: cc.Component,
    properties: { 
        //方向
        dir:cc.Vec2,
        //类型
        type:{
            type:TYPE,
            default:TYPE.MOSTER
        },
        tag:{
            type:WALL_TYPE,
            default:WALL_TYPE.NONE
        },
    }, 
});
