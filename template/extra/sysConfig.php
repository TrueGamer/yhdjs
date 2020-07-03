<?php
global $sysconfig_global;
$sysconfig_global = [];
$sysconfig_global['MYSQL_INTERVAL'] = 200; // mysql数据库分表间 隔
$sysconfig_global['REDIS_USERINFO_PRE'] = 'userInfo.'; // redis保存用户数据的前缀

// 道具id
$sysconfig_global['ITEM_ID'] = array(
    'MONEY' =>1001,	// 游戏币
    'DIAMOND' =>1002,	// 充值币
    'HONGBAO' =>1003,	// 红包
    'BALANCE' =>1004,	// 余额
);


// 物品的类型
$sysconfig_global['GOODS_TYPE'] = array(
    'MONEY' => 1,    // 游戏币
    'DIAMOND' => 2,  // 充值币
    'HONGBAO' => 3,  // 红包
    'BALANCE' => 4,  // 余额
);

// 抽奖奖励类型
$sysconfig_global['ROLL_TYPE'] = array(
    'TYPE1' => 1,    // 钻石获取
    'TYPE2' => 2,    // 离线时常收益
    'TYPE3' => 3,    // 倍数奖励
);

// 每日任务的类型
$sysconfig_global['DAILY_TASK_TYPE'] = array(
    'COMPOUND_NUMBER' => 1,    // 合成次数
    'LOGIN_NUMBER' => 2,    // 登录次数
    'WATCH_AD_NUMBER' => 3,    // 广告观看次数
    'ROTARY_NUMBER' => 4,    // 转盘次数
    'SPEED_NUMBER' => 5,    // 加速次数
    'PET_COMPOUND_RECORD' => 6,    // 武将合成记录
);

// 每日任务的奖励类型
$sysconfig_global['DAILY_TASK_AWARD_TYPE'] = array(
    'STANDARD'  => 1,        // 基准型
    'NUMERICAL' => 2,        // 数值型
);

// 成就任务的类型
$sysconfig_global['ACHIEVEMENT_TYPE'] = array(
    'COMPOUND_NUMBER' => 1,    // 合成次数
    'LOGIN_NUMBER' => 2,    // 登录次数
    'WATCH_AD_NUMBER' => 3,    // 广告观看次数
    'ROTARY_NUMBER' => 4,    // 转盘次数
    'SPEED_NUMBER' => 5,    // 加速次数
    'PET_COMPOUND_RECORD' => 6,    // 武将合成记录
);


// 成就任务的完成状态
$sysconfig_global['ACHIEVEMENT_STATE'] = array(
    'UNDER_WAY' => 1, // 进行中
    'COMPLETE' => 2, // 可以领取
    'ALL_OVER' => 3, // 全部结束
);

// 红包档位状态
$sysconfig_global['HONGBAO_STATE'] = array(
    "AWAIT_ACTIVE" => 1,// 等待激活
    "ACTIVE" =>       2,// 激活
    "FAILURE" =>      3,// 失效
    "SUCC_DRAW" =>    4,// 成功领取
);

// 位置的类型
$sysconfig_global['POSITION_TYPE'] = array(
	"NULL" => 0, //  空的
	"PET"  => 1, //  宠物
	"BOX"  => 2, //  宝箱
);

// 位置的类型
$sysconfig_global['BOX_TYPE'] = array(
	"ONE" => 1, // 植物宝箱
	"TWO" => 2, // 广告宝箱
);

// 获取红包接口Handler 类型
$sysconfig_global['GET_HONGBAO_HANDLER'] = array(
	"UNLOCK_PET" =>1, // 解锁宠物
	"UP_LEVEL" =>2, // 上级宠物广告
	"AD_BOX" =>3, // 广告宝箱
	"OFF_HB" =>4, // 离线宝箱
	"NEW_USER_HB" =>5, // 新用户红包

);

function getSysConfig( $key ){
    global $sysconfig_global;
    return $sysconfig_global[$key];
}

?>

