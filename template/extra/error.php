<?php
global $error_global;
$error_global = [];

// 错误码
$error_global['ERROR'] = array(
    'PARAMETER_ERROR'=> 1,              // 参数错误
    'USER_DATA_IS_NULL'=> 2,            // 玩家数据是空
    'DB_CONN_FAIL'=> 3,                 // 获取数据库连接失败
    'GET_USER_DATA_FAIL'=> 4,           // 获取玩家数据失败
    'SET_USER_DATA_FAIL'=> 5,           // 保存玩家数据失败
    'PET_LEVEL_BEYOND_RESTRICT'=> 8,    // 宠物等级超出可购买的限制
    'LACK_OF_MONEY'=> 9,                // 金钱不充足
    'LACK_OF_DIAMOND'=> 10,             // 钻石不足
    'LACK_OF_SITE'=> 11,                // 位置不足
    'PET_LEVEL_INCONFORMITY'=> 12,      // 宠物等级不符合
    'PET_LEVEL_NOT_ENABLED'=> 13,       // 该宠物等级未开启
    'REPEAT_SIGN'=> 14,                 // 不允许重复签到
    'ROLL_TICKET_NOT_ENOUGH'=> 15,      // 抽奖券不足
    'ROLL_ERROR'=> 16,                  // 抽奖出错(一般不会触发)
    'REPEAT_GET_DAILY_TASK'=> 17,       // 重复领取每日任务
    'DAILY_TASK_NOT_COMPLETE'=> 18,     // 任务条件未达成
    'REPEAT_GET_ACHIEVEMENT'=> 19,      // 重复领取成就
    'ACHIEVEMENT_NOT_COMPLETE'=> 20,    // 成就条件未达成
    'NOT_ALLOW_SPEED'=> 21,             // 不允许加速
    'SPEED_LIMIT'=> 22,                 // 加速次数达到上限
    'EXCHANGE_FAILURE'=> 23,            // 兑换失败
    'ALREADY_BIND_INVITE_MAN'=> 24,     // 已经绑定过邀请人
    'INVITE_MAN_IS_NULL'=> 25,          // 邀请人不存在
    'INVITE_MAN_NOT_IS_SELF'=> 26,      // 邀请人不能是自己
	'ACCOUNT_NOT_REGISTER'=> 27,        // 账号未注册不能登录
    'PET_NOT_CAN_SYNTHESIS'=> 28,       // 该宠物不能合成
    'NOT_MULTI_UP_AWARD'=> 29,          // 没有领取多倍段位奖励的机会
    'NOT_PET_UPGRADE_AWARD'=> 30,       // 没有宠物合成奖励领取
    'WORK_NOT_START'=> 31,              // 工作尚未开始进行
    'WORK_NOT_ACHIEVE'=> 32,            // 工作尚未完成
    'WORK_NOT_VALID'=> 33,              // 无效工作
    'WORKING'=> 34,                     // 当前正在进行工作
	'LACK_OF_BALANCE'=> 35,             // 红包余额不足
	'NOT_IS_ACTIVE'=> 36,               // 请先去激活该档位的红包
	'CREATE_ORDER_FAILURE'=> 37,        // 创建订单失败
	'ORDER_NOT_EXIST'=> 38,        	    // 订单不存在
	'ORDER_IS_COMPLETE'=> 39,        	// 订单是已经完成的
	'WITHDRAW_FAILURE'=> 40,        	// 提现失败
	'ONLY_SELL_PET'=> 41,        		// 只有宠物能够贩卖
	'GET_KILL_BOX_FAILURE'=> 42,        // 领取击杀宝箱失败
	'ONLY_OPEN_BOX'=> 43,        	    // 只能开启宝箱
	'ROLL_COOLING'=> 44,        	    // 请稍后再来抽奖
	'BALANCE_NOT_ENOUGH'=> 45,        	// 本期红包活动余额不足
	'HONGBAO_ACT_CONFIG_ERROR'=> 46,    // 红包活动配置有误
	'HONGBAO_NOT_OPEN'=> 47,    		// 红包活动尚未开启
	'HONGBAO_ALREADY_CLOSE'=> 48,    	// 本期红包活动结束
	'OVER_ON_FREE_MONEY_LIMIT'=> 49,    // 超过免费阳关次数限制
	'FREE_MONEY_COOLING'=> 50,    		// 请稍后在领取免费阳光
	'GET_EXTRA_HB_FAILURE'=> 51,    	// 额外红包领取失败
	'NOT_PET'=> 52,        				// 不是宠物
	'NOT_AD_UP'=> 53,        			// 没有广告升级宠物的资格

 );

// 获取通用错误码
function error_getCommonError( $key ){
    global $error_global;
    return $error_global['ERROR'][$key];
}

?>