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

include ("../SDK/sdkComm.php");

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

$msgID = $MESSAGE['GET_WITHDRAW_ORDERID'];
$uid  = number_format($parameter['uid'],0, '', ''); // uid
$goodsId = $parameter['goodsId'];     // 商品id

// 商品id不能为空
if ( empty($goodsId) ){
	return RstMsg(error_getCommonError('PARAMETER_ERROR'), $msgID);
}
$hongbaoConfigs = configManager_getConfigs('hongbao');
$hongbaoConfig = $hongbaoConfigs->$goodsId;
// goodsId 无效
if( empty($hongbaoConfig) ){
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

// 校验商品id激活情况
if (!roleManager_hongbaoIsActive($player, $goodsId)){
	return RstMsg(error_getCommonError('NOT_IS_ACTIVE'), $msgID);
}

// 校验余额是否充足
$goodsType = getSysConfig('GOODS_TYPE');
$itemIds = getSysConfig('ITEM_ID');
if(!roleManager_goodsSufficient( $player, $itemIds['BALANCE'],$goodsType['BALANCE'], $hongbaoConfig->getLimit )){
	return RstMsg(error_getCommonError('LACK_OF_BALANCE'), $msgID);
}
// 做客户端的一些数据同步
roleManager_syncData($player, [
	"money" => @$parameter['syncMoney']?(int)$parameter['syncMoney'] : 0 ,
	"speed" => @$parameter['syncSpeed']?(int)$parameter['syncSpeed'] : 0 ,
	"ad" => @$parameter['syncAD']?(int)$parameter['syncAD'] : 0
]);

// 获取最新一期的红包活动的信息
$actInfoRet = DB_operator_getHongBaoActBaseInfo($connObj->redisConn);
if ( !empty( $actInfoRet['code'] )){
	// 获取活动信息失败
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('WITHDRAW_FAILURE'), $msgID);
}

$actInfo = $actInfoRet["data"];

// 是否在活动时间内
$time = time();
if ( $actInfo["createTime"] > $time ){
	// 红包活动尚未开启
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('HONGBAO_NOT_OPEN'), $msgID);
}

if ( $actInfo["endTime"] < $time ){
	// 红包活动已经关闭
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('HONGBAO_ALREADY_CLOSE'), $msgID);
}

$amount = $hongbaoConfig->amount;

// 效验活动余额是否充足
if ( empty($actInfo) ||
	empty($actInfo["curRmb"]) ||
	$actInfo["curRmb"] < $amount
){
	return RstMsg(error_getCommonError('BALANCE_NOT_ENOUGH'), $msgID);
}

// 奖励列表 --TODO 奖励列表主要是用来给前端做展示
$rewardList = [];

$openId = $player->openId;
// 分析上一次订单号的处理情况，是否需要继续使用原订单处理
$ret = sdkComm_analysisLastOrder($connObj->redisConn, $openId);

if ( !empty($ret) ){
	$orderId = $ret["orderId"];
}else{
	$configs = configManager_getConfigs('hongbao');
	$config = $configs->$goodsId;
	if ($config->amount < 0){
		return RstMsg(error_getCommonError('HONGBAO_ACT_CONFIG_ERROR'), $msgID);
	}
	$orderId = sdkComm_createSelfOrder($connObj->redisConn);
	$isSucc1 = sdkComm_initAndSaveOrder($connObj->redisConn, $openId, $goodsId, $orderId, $config->amount, $uid);
	if ( !$isSucc1 ){
		return RstMsg(error_getCommonError('CREATE_ORDER_FAILURE'), $msgID);
	}
	$isSucc2 = sdkComm_orderLpushList($connObj->redisConn, $openId, $orderId);
	if (!$isSucc2){
		return RstMsg(error_getCommonError('CREATE_ORDER_FAILURE'), $msgID);
	}
}

//  数据入库
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player) );
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
	return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}

$messageRetData = new stdClass();
$messageRetData->update = playerDataSync_getUpdate();
$messageRetData->rewardList = $rewardList;
$messageRetData->orderId = $orderId;
return RstMsg(0, $msgID, $messageRetData);




