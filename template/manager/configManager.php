<?php
// 配置表管理
// 保证单例
global $configManager_configs;
$configManager_configs = new stdClass();

// 根据配置表的名字获取配置表
function configManager_getConfigs( $name ){
    global $configManager_configs;
    // 直接返回
    if( isset( $configManager_configs->$name )){
        return  $configManager_configs->$name;
    }
    $url = configManager_getConfigUrl($name);
    $jsonStr = file_get_contents( $url );
    if ( empty($jsonStr) ){
        return null;
    }
    $configManager_configs->$name = json_decode($jsonStr);
    return   $configManager_configs->$name;
}

// 根据配置表的名字获取配置表
function configManager_getConfig( $name, $field ){
    $configs = configManager_getConfigs($name);
    if ( empty($configs) || !$configs->$field ){
        return null;
    }
    return  $configs->$field;
}

// 获取系统宏定义的key值
function configManager_getSysMacro( $name ){
    $confObj = array (
        'DAY_RESET'=>1,     // 日重置时间
        'MAIL_EXPIRE'=>2,   // 邮件的有效期
        'SYS_MAX_RAN_PRO'=>3,   // 系统最大的随机概率
        'MAP_PET_MAX_NUM'=>4,   // 地图宠物位最大数量
        'MONEY_BUY_PET_LEVEL_CONDITION'=>5,   // 金钱购买宠物判断条件(最高解锁等级 - 购买等级)差值
        'START_USER_MOMEY'=>6,   // 角色初始化金币值
        'DIAMOND_BUY_PET_LEVEL_CONDITION'=>7,   // 钻石购买宠物判断条件(最高解锁等级 - 购买等级)差值
        'DIAMOND_BUY_MIN_LEVEL'=>8,   // 钻石购买的最低等级
        'PET_OPEN_MAX_LEVEL'=>9,   // 宠物当前开启的最高等级
        'EARNINGS_MAX_TIME'=>10,   // 收益最大时间
		'PET_MAX_UPGRADE_LEVEL'=>13,   // 宠物最大的可合成等级
        'MAX_DIVIDEND_PERSON'=>15,   // 最大分红的人数
        'EVERYDAY_ROLL_MAX_NUM'=>17,   // 每日转盘最大次数
        'HONGBAO_TO_BALANCE'=>19,   // 红包到余额的转换率
        'FREE_DIAMOND_MAX_NUM'=>20,   // 免费钻石的最大次数
		'ROLL_USE_INTERVAL'=>24,   // 转盘的使用间隔
		'FREE_ROLL_NUM'=>25,   // 前几次转盘无间隔
		'MAX_UP_LEVEL_HB_TIME'=>29,   // 升级红包最多领取次数
		'MAX_AD_BOX_HB_TIME'=>30,   // 广告宝箱最大的领取次数
		'OFF_HB_REWARD'=>31,   // 离线红包奖励值
		'OFF_HB_REWARD_TIME_LIMIT'=>32,   // 离线红包时间限制
		'NEW_USER_HONGBAO_VALUE'=>33,   // 新用户可以领取多少红包
    );
    return empty($confObj[$name])?null:$confObj[$name];
}

// 配置表管理
// --TODO 注意php的入口文件地址
function configManager_getConfigUrl( $name ){
    $confObj = array (
        'defingcfg'=>'../../config/defingcfg.json',                 // 系统宏定义
        'item'=>'../../config/item.json',                           // 道具表
        'petMoneyShop'=>'../../config/petMoneyShop.json',           // 金币购买宠物花费表
        'petRmbShop'=>'../../config/petRmbShop.json',               // 钻石购买宠物花费表
        'petSell'=>'../../config/petSell.json',                     // 宠物出售价格表
        'petCombineReward'=>'../../config/petCombineReward.json',   // 宠物星级首次达成奖励表
        'checkIn'=>'../../config/checkIn.json',                     // 签到配置表
        'roll'=>'../../config/roll.json',                           // 抽奖表
        'task'=>'../../config/task.json',                           // 每日任务
        'achieve'=>'../../config/achieve.json',                     // 成就
        'speed'=>'../../config/speed.json',                         // 收益加速
        'title'=>'../../config/title.json',                         // 称号表
        'level'=>'../../config/level.json',                         // 关卡表(--TODO 当前关卡表是与称号表对应的)
        'working'=>'../../config/working.json',                     // 工作表
        'freeZS'=>'../../config/freeZS.json',                       // 免费钻石
        'hongbao'=>'../../config/hongbao.json',                     // 红包表
		'box'=>'../../config/box.json',                     	 	// 宝箱表
		'upAD'=>'../../config/upAD.json',                     	 	// 合成触发广告
		'freeSun'=>'../../config/freeSun.json',                     // 免费钻石
		'dfwconfigs'=>'../../config/dfwconfigs.json',               // 总配置
    );
    return empty($confObj[$name])?null:$confObj[$name];
}

?>