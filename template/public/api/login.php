<?php
// 公用方法
include("../../comm/comm.php");
// 数据库操作
include("../../extra/DBOperator.php");
// 结构升级
include("../../domin/roleInfoCom.php");
// 加载玩家对象类
include("../../domin/role.php");
// 系统配置
include("../../extra/sysConfig.php");
// 通用错误码
include("../../extra/error.php");
// 消息ID
include("../../extra/message.php");

// 逻辑管理器
include("../../manager/configManager.php");
include("../../manager/roleManager.php");
include("../../manager/playerDataSync.php");
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

// 取参数
$msgID = $MESSAGE['LOGIN'];
$uid     = number_format($parameter['uid'],0, '', ''); // uid
$openId  = $parameter['openId']; // 第三方ID

$channelsId = $parameter["channelsId"];        // 渠道id 那个渠道进入游戏
$gameId     = $parameter["gameId"];            // 游戏id 那个游戏

getLog()->error("uid : " . $uid  );
getLog()->error("openId : " . $openId  );

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

$userData = $getRoleDataRet['data'];

$player = NULL;
if( !$userData ){
	// --TODO 是否需要验证 openId换取uid 阶段
	$isOfficial = true;

    // 没找到玩家数据，创建玩家数据
    $player = roleInfoCom_createRoleData($uid, $openId, "" );

    // 角色创建完成后，做一些数据的初始化，比如主线任务模块数据，（初始化单个任务的逻辑在 mainTaskMannager,php中，在构造函数中直接初始化不方便)
    roleInfoCom_createLaterInit($player, $connObj);
}else{
    // 找到玩家数据，直接做数据更新
    $player = roleInfoCom_updateRoleStruct($userData);

	// 出现BUG，导致数据错误，用来处理一些数据修复的情况
	roleManager_dataRepair($player);

}
$rewardList = [];
// 计算收益
$offEarningsRet =  roleManager_calculateEarnings($player, $rewardList);

// 保存本次的离线收益
roleManager_setLastOffEarnings($player, $offEarningsRet["money"]);

// 红包结算
roleManager_hongbaoSettle($player);

// 日重置效验
roleManager_checkDayReset($player, false);

// 玩家登录
roleManager_login($player, $openId,$connObj);

// 处理登录的成就和每日任务
$dailyType = getSysConfig('DAILY_TASK_TYPE');
roleManager_disposeDailyTaskByType($player, $dailyType['LOGIN_NUMBER'], []);

$achievementType = getSysConfig('ACHIEVEMENT_TYPE');
roleManager_disposeAchievementByType($player, $achievementType['LOGIN_NUMBER'], []);

//  数据入库(数据只往redis数据库中进行存入)
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player));
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
    return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}


$messageRetData = new stdClass();
$messageRetData->rewardList = $rewardList;
$messageRetData->playerInfo = $player;
$messageRetData->earnings = $offEarningsRet;
return RstMsg(0, $msgID, $messageRetData);
