/**
 * 游戏常量保存
 */
var AppDef = cc.Class({ 
     statics:{ 
        IS_DEBUG:true,
        APP_ID:"wxecb5a8e710205705" , // 微信AppID
        ISBIND_WX: false, //bind标识
        OPENID:"15818642856", //2123456521211 //手机号
        UID:"", //服务器返回ID
        STATIC_MAX_TIME :300,        //用于记录一个本地时间 当5分钟没有网络操作时候 主动同步
        DESIGN_WIDTH:1126,
        DESIGN_HEIGHT:2436, 
        KILL_MONSTER_MONEY:0,       //击杀怪物累计金币
        AUTO_MERGE_TIME:0, //自动合成时间
        ADDSPEED_COUNT:0, //加速   触发加速上报服务器 做为统计 
        VIDEO_COUNT:0, //视频统计次数
        SERVER_URL:"https://game.kakayunnews.com",
        GAME_CFG_URL:"/service/clientGetConfig.php",
        //怪物出生位置
        randomArray :[
         [0,1,2,3,4,5,6,7],
         [0,1,2,3,4,6], 
         [0,3,4,5,6], 
         [1,2,5,6,7], 
         [1,2,3,4,7], 
         [2,3,4,5,6], 
         [2,4,5,6,7], 
         [0,1,3,5,6,7], 
         [0,1,2,5,6,7],  
      ],
      //购买宠物等级限制N+4
      BUY_LIMIT_PET:4,
      //钻石购买限制  N+2
      BUY_DIAMOND_LIMIT:2, 
      //是否退出登录
      IS_EXIT_LOGIN:false,
      //暂停游戏
      PAUSE_GAME:false,
      //离线经验
      offLineExp:0,
      //离线红包
      offLineHb:0,

      offLineIsDouble:false,//是否双倍红包标记

      MaxGuideStep:12,//最大新手指引步数

      DELAY_BTN_SHOW_TIME:5,// 窗口延迟出现确定按钮事件
      DELAY_RED_BTN_SHOW_TIME:3,// 红包窗口延迟出现确定按钮事件
      

      ADD_SPEED_TIME:0,
      //杀死的怪物数量
      KILL_MONSTER_TOTAL_NUM:0,
 
      //视事件类型
      VIDEO_EVENT_TYPE:{
         QD:"qiandao",//签到
         LXJL:"lixianjiangli",//离线奖励
         HCSJ:"hechengshengji",//合成升级
         ZDHC:"zidonghecheng",//自动合成
         XYZP:"xinyunzhuanpan",//幸运转盘
         MFZS:"mianfeizuanshi",//免费钻石
         MFYG:"mianfeiyangguang", //免费阳光
         GZ:"gongzuo",//打工
         MRRW:"meirirenwu",//每日任务
         CJRW:"chengjiurenwu",//成就任务
         DWSJ:"duanweishengjijiangli",//段位升级
         DWJJ:"duanweijiangji",//段位奖励
         JS:"jiasu", //加速
         CQG:"cunqianguan",//存钱罐
         BX:"baoxiang",//开宝箱
         JSZW:"jiesuozhiwu",//解锁植物
         SJZW:"shengjizhiwu", //升级植物(合并越级)
         HB:"kaihongbao",//红包
         HBFB:"kaihongbaofanbei",//红包翻倍
         XSHB:"xinshouhongbao",//新手红包
      },
      
      //红包双倍标记类型
      RED_PACK_TYPE:{
         UNLOCK_PET :1,  //  解锁宠物
         UP_LEVEL  :2,  //  上级宠物广告
         AD_BOX  :3,  //  广告宝箱
         OFF_HB  :4,  //  离线宝箱
         NEW_USER_HB :5,  //  新用户红包  
         TAKS_HB: 6, // 任务红包双倍
      } 
      ,
      RED_PACK_ID:1003,//红包ID

      
     } 
    
});

if (cc.sys.platform  == cc.sys.ANDROID){   
   AppDef.IS_DEBUG = false;
}
module.export = AppDef;
