/*
 * creator: lc
 * time   : 2017.08.16
 * desc   : 消息ID定义
 */

var MESSAGE                 = {};
MESSAGE.SET_GAME_DATA      = 1001;  // 更新游戏数据
MESSAGE.GET_GAME_DATA      = 1002;  // 获取游戏数据
MESSAGE.GET_RANK           = 1003;  // 获取排行榜
MESSAGE.SUBMIT_INVITER     = 1004;  // 上报邀请者
MESSAGE.GET_INVITE_DATA    = 1005;  // 获取邀请信息 
MESSAGE.LOGIN              = 101;   //登录游戏
MESSAGE.BUY_PET_MONEY      = 105;   //通过铜钱购买宠物
MESSAGE.BUY_PET_GLOD       = 106;   //通过钻石购买宠物
MESSAGE.PET_MERGE          = 107;   //宠物合成
MESSAGE.PET_SWAP_POS       = 108;   //宠物交换位子
MESSAGE.SELL_PET           = 109;   //出售宠物
MESSAGE.QUICK_BUY_PET      = 110;   //快捷购买
MESSAGE.SIGNIN             = 111;   //签到
MESSAGE.ROLL               = 112;   //抽奖
MESSAGE.DAILYTASK          = 113;   //每日任务
MESSAGE.ACHIEVENMENT       = 114    //成就任务
MESSAGE.SPEED              = 115;   //加速
MESSAGE.EXCHANGE           = 116;   //兑换商品
MESSAGE.BINDCODE           = 117;   //绑定邀请码
MESSAGE.AGENTLIST          = 118;   //获取代理列表
MESSAGE.AGENT_MSG_LIST     = 119;   //获代理取消息列表
MESSAGE.ROLL_DOUBLE        = 120;   //抽奖翻倍
MESSAGE.SYNC_MONEY         = 121;   //金币同步
MESSAGE.SET_DUANWEI        = 122;   //用户段位控制
MESSAGE.UPDATE_BANK        = 123;   //更新存钱罐
MESSAGE.GET_BANK           = 124;   //领取存钱罐
MESSAGE.GET_MULTI_UPDUAN   = 125;   //首次多倍领取升段奖励
MESSAGE.PET_COMBINE        = 126;   //宠物合成奖励
MESSAGE.START_WORK         = 127;   //开始工作ID
MESSAGE.GET_WORK_REWARD    = 128;   //领取工作奖励
MESSAGE.FREE_VIDEO_ZUANSHI = 129;   //免费钻石
MESSAGE.GET_ORDER          = 130;   //获取订单号
MESSAGE.GET_CASH           = 131;   //提现 
MESSAGE.GET_BOX  = 132;  //获得宝箱
MESSAGE.OPEN_BOX = 133;  //开启宝箱 
MESSAGE.GET_OFFLINE_MULT = 134;  //离线奖励多倍
MESSAGE.GUIDE            = 135;  //新手引导 
MESSAGE.GET_RED_PACK = 136;  //获得红包活动 
MESSAGE.GET_MONEY_RECORD = 137 ;  //提现记录 
MESSAGE.UP_AD_REWARD = 138 ;  //广告越级植物 
MESSAGE.FREE_MONEY = 139 ;  //免费阳光 
MESSAGE.GET_DOUBLE_REDPACK = 140 ;  //双领取倍红包
MESSAGE.REGISTER       = 153;  //注册
MESSAGE.LOGINCEHCK     = 154;  //登陆
MESSAGE.FIXPWD         = 155;  //修改密码
MESSAGE.GET_GOODS_LIST = 156;  //获取商品列表 
MESSAGE.SERACH_EXCHANGE_STATE = 158;  //查询兑换商品状态
MESSAGE.SEND_CODE             = 159;  //发送验证码
MESSAGE.FORGET_SEND_CODE      = 160;  //找回密码发送验证码
MESSAGE.FORGET_PWD            = 161;  //找回密码
MESSAGE.AD_BOUNUS             = 162;  //广告分红

MESSAGE.SDK_GET_CODE        = 170;  //code 换openID
MESSAGE.SDK_GET_UID         = 171;  //通过openId换取本地uid
MESSAGE.GET_TOURIST         = 172;  //获取游客OPENID
MESSAGE.TOURIST_BIND_OPENID = 173;  //游客id绑微信iD

MESSAGE.GET_GAME_JSON = 174;  //拉客户端配置
MESSAGE.REPORT_SERVER = 175;  //广告上报自己服务器

if (typeof module !== 'undefined') {
	module.exports = MESSAGE;
}
