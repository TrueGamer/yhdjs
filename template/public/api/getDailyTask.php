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

$msgID = $MESSAGE['GET_DAILY_TASK'];
$uid  = number_format($parameter['uid'],0, '', ''); // uid
$id  = $parameter['id']; // 每日任务配置表索引
$multi  = (int)$parameter['multi']; // 是否进行多倍领取

if( empty($multi) || $multi > 2 ){
    $multi = 1;
}

if(empty($id)){
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

// 效验任务是否重复领取
if(roleManager_repeatGetDailyTask($player, $id)){
    return RstMsg(error_getCommonError('REPEAT_GET_DAILY_TASK'), $msgID);
};

// 效验任务是否达到要求
if(!roleManager_checkDailyTaskComplete($player, $id)){
    return RstMsg(error_getCommonError('DAILY_TASK_NOT_COMPLETE'), $msgID);
};


// 奖励列表 --TODO 奖励列表主要是用来给前端做展示
$rewardList = [];

$awardBase = [];
// 计算金币商店能够购买的最高等级宠物的金币价格
$moneyBuyMaxLev = petManager_getMaxBuyPetLevelByMoney($player);
$awardBase['money'] = petManager_calculatePetMoneyCostByLevel($player, $moneyBuyMaxLev, 1);
// 计算钻石商店能够购买的最高等级宠物的钻石价格
$diamondBuyMaxLev = petManager_getMaxBuyPetLevelByDiamond($player);
$awardBase['diamond'] = petManager_calculatePetDiamondCostByLevel($player, $diamondBuyMaxLev,1);

// 获得每日任务的奖励
for ($i = 0; $i < $multi; $i++){
    roleManager_getDailyTaskReward($player, $id, $awardBase, $rewardList);
}

// 设置每日任务的记录
roleManager_setDailyTaskRecord($player, $id);

//  数据入库
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player) );
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
    return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}

$messageRetData = new stdClass();
$messageRetData->update = playerDataSync_getUpdate();
$messageRetData->rewardList = $rewardList;
return RstMsg(0, $msgID, $messageRetData);




