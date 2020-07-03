<?php
// 公用方法
include("../../comm/comm.php");
// 数据库操作
include("../../extra/DBOperator.php");
// 系统配置
include("../../extra/sysConfig.php");
// 通用错误码
include("../../extra/error.php");
// 消息ID
include("../../extra/message.php");

// 逻辑管理器
include("../../manager/configManager.php");
include("../../manager/playerDataSync.php");
include("../../manager/roleManager.php");

include("../../manager/petManager.php");

// 接收参数
$parameter = null;
$tempContent = file_get_contents("php://input");
if (!empty($tempContent)){
    // 从流中获取数据
    $parameter = json_decode($tempContent, true);
}else if (!empty($_POST)){
    // 一般的表单提交可以直接同过$_POST来获取传参
    $parameter = $_POST;
}

$msgID = $MESSAGE['PET_UPGRADE'];
$uid  = number_format($parameter['uid'],0, '', ''); // uid
$indexs = $parameter['indexs']; // 位置数组 [0]下标的值，是新宠物生成的位置
if ( empty($indexs) ){
    return RstMsg(error_getCommonError('PARAMETER_ERROR'), $msgID);
}

// 初始化连接（保证一次请求只取一次连接）
$initConnRet = DB_operator_initConnRedis();
if ( empty($initConnRet) || $initConnRet['code'] != 0 ){
    return RstMsg(error_getCommonError('DB_CONN_FAIL'), $msgID);
}
$connObj = $initConnRet['data'];
// 根据这个账号从数据库中查找数据
$getRoleDataRet = DB_operator_getRoleDataNonLogin($uid, $connObj->redisConn);

if ( empty($getRoleDataRet) || $getRoleDataRet['code'] != 0 ){
    // 只有内部出错，才会拿不到返回的数据
    return RstMsg(error_getCommonError('GET_USER_DATA_FAIL'), $msgID);
}
$player = json_decode($getRoleDataRet['data']);
if ( empty($player) ){
    return RstMsg(error_getCommonError('USER_DATA_IS_NULL'), $msgID);
}
// 日重置效验
roleManager_checkDayReset($player, true);

// 做客户端的一些数据同步
roleManager_syncData($player, [
	"money" => @$parameter['syncMoney']?(int)$parameter['syncMoney'] : 0 ,
	"speed" => @$parameter['syncSpeed']?(int)$parameter['syncSpeed'] : 0 ,
	"ad" => @$parameter['syncAD']?(int)$parameter['syncAD'] : 0
]);

// 奖励列表 --TODO 奖励列表主要是用来给前端做展示
$rewardList = [];

// 校验是否允许升级
if ( !petManager_allowUpgrade($player, $indexs) ){
    return RstMsg(error_getCommonError('PET_LEVEL_INCONFORMITY'), $msgID);
}

// 宠物最大可合成等级
$petMaxUpgradeLevel =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('PET_MAX_UPGRADE_LEVEL'))->value;
$pet = petManager_getPetDataBySite($player, $indexs[0]);
if($pet->level >= $petMaxUpgradeLevel){
    return RstMsg(error_getCommonError('PET_NOT_CAN_SYNTHESIS'), $msgID);
}

// 进行宠物合成
$firstUpgrade =  petManager_petUpgrade($player, $indexs);

//是否需要触发合成触发广告升级宠物机制
$adMark = false;
$adMark = petManager_touchUpAD($player, $pet->level+1);
$upLevel = 0;
$hb = 0;
if ( $adMark ){
	$upLevel = petManager_ranOnePetUpLevel($pet->level+1);
	$maxUpLevevHbTime = configManager_getConfig('defingcfg',configManager_getSysMacro('MAX_UP_LEVEL_HB_TIME') )->value;
	$upLevevHbTime = roleManager_getUpLevelHbTime($player);
	if ( $upLevevHbTime < $maxUpLevevHbTime ){
		$hb = petManager_getHongbaoByLevelAndUpLevel($pet->level+1, $upLevel);
		roleManager_setUpLevelHb($player,$hb);
	}
}
// 保存合成的位置
petManager_saveLastUpSite($player, $indexs[0], $upLevel);

// 处理成就和每日任务
$dailyType = getSysConfig('DAILY_TASK_TYPE');
roleManager_disposeDailyTaskByType($player, $dailyType['COMPOUND_NUMBER'], []);
roleManager_disposeDailyTaskByType($player, $dailyType['PET_COMPOUND_RECORD'], ['level'=> $pet->level]);
$achievementType = getSysConfig('ACHIEVEMENT_TYPE');
roleManager_disposeAchievementByType($player, $achievementType['COMPOUND_NUMBER'], []);
roleManager_disposeAchievementByType($player, $achievementType['PET_COMPOUND_RECORD'], ['level'=> $pet->level]);

$boxUpdate = [];
// 检查宝箱
petManager_inspectOverflowBox($player, $boxUpdate);

//  数据入库
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player) );
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
    return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}

$messageRetData = new stdClass();
$messageRetData->update = playerDataSync_getUpdate();
$messageRetData->rewardList = $rewardList;
$messageRetData->indexs = $indexs;
$messageRetData->firstUpgrade = $firstUpgrade;
$messageRetData->boxUpdate = $boxUpdate;
$messageRetData->touchAD = [
	"adMark" => $adMark,
	"upLevel" => $upLevel,
	"hb" => $hb
]; // 广告标记

return RstMsg(0, $msgID, $messageRetData);




