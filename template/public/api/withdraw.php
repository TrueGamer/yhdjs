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

$msgID = $MESSAGE['WITHDRAW'];
$uid  = number_format($parameter['uid'],0, '', ''); // uid
$orderId = (string)$parameter['orderId'];     // 订单号

// 订单号不能为空
if ( empty($orderId) ){
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

// 获取订单信息
$data = sdkComm_getOrderByOrderId($connObj->redisConn, $orderId );
if ( empty($data) ){
	return RstMsg(error_getCommonError('ORDER_NOT_EXIST'), $msgID);
}

// 订单是否已经被处理过了
if(sdkComm_orderAlreadyComplete($data)){
	return RstMsg(error_getCommonError('ORDER_IS_COMPLETE'), $msgID);
}


$goodsId = $data["goodsId"];
// 订单的提现钱,单位：分
$amount = $data["amount"];

$hongbaoConfigs = configManager_getConfigs('hongbao');
$hongbaoConfig = $hongbaoConfigs->$goodsId;

// 获得订单所有的状态枚举
$orderState = sdkComm_orderAllStates();

// goodsId 无效
if( empty($hongbaoConfig) ){
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('PARAMETER_ERROR'), $msgID);
}

// 日重置效验
roleManager_checkDayReset($player, true);

// 校验商品id激活情况
if (!roleManager_hongbaoIsActive($player, $goodsId)){
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('NOT_IS_ACTIVE'), $msgID);
}

// 校验玩家余额是否充足
$goodsType = getSysConfig('GOODS_TYPE');
$itemIds = getSysConfig('ITEM_ID');
if(!roleManager_goodsSufficient( $player, $itemIds['BALANCE'],$goodsType['BALANCE'], $hongbaoConfig->getLimit )){
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('LACK_OF_BALANCE'), $msgID);
}

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


// 效验活动余额是否充足
if ( empty($actInfo) ||
	 empty($actInfo["curRmb"]) ||
	$actInfo["curRmb"] < $amount
	 ){
	return RstMsg(error_getCommonError('BALANCE_NOT_ENOUGH'), $msgID);
}

// 优先扣钱，最后看处理结果分析是否将钱回写
$deductActBalanceRet = DB_operator_updateHongBaoActBalance($connObj->redisConn, -$amount);
if ( $deductActBalanceRet['code'] ){
	getLog()->error("优先扣钱 失败");
	return RstMsg(error_getCommonError('WITHDRAW_FAILURE'), $msgID);
}

// 做客户端的一些数据同步
roleManager_syncData($player, [
	"money" => @$parameter['syncMoney']?(int)$parameter['syncMoney'] : 0 ,
	"speed" => @$parameter['syncSpeed']?(int)$parameter['syncSpeed'] : 0 ,
	"ad" => @$parameter['syncAD']?(int)$parameter['syncAD'] : 0
]);

// 奖励列表 --TODO 奖励列表主要是用来给前端做展示
$rewardList = [];

$openId = $player->openId;

// 提现到领钱
$wxType = 1;
$wxConfig = sdkComm_getChannelConfig($wxType);
// 构造参数
$params = [
	"mch_appid" => $wxConfig["appId"],
	"mchid" => $wxConfig["vendor"],
	"nonce_str" => sdkComm_createRandString(16),
	"partner_trade_no" => $orderId,
	"openid" => $openId,
	"check_name" => "NO_CHECK",
	"amount" => $amount, // 单位是分
	"desc" => "游戏奖励"
];

$params["sign"] = sdkComm_wxSign($params);

$url = "https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers";
$ret = sdkComm_post($url, $params);
if( empty($ret) ){
	sdkComm_updateAndSaveOrder($connObj->redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
	return RstMsg(error_getCommonError('SYS_ERROR'), $msgID);
}

// 处理结果,并进行分析
$isSucc = sdkComm_analysisWithdrawResult($connObj->redisConn, $orderId, $ret);
$resultState = sdkComm_withdrawResultStates();
if ( $isSucc == $resultState["SUCCESS"] ){
	// 提现成功,无需回写
	// 记录用户提现成功
	DB_operator_addUserWithdrawSuccRecord($connObj->redisConn, $uid, $openId, $amount );
	// 扣除余额
	roleManager_expendGoods( $player, $itemIds['BALANCE'],$goodsType['BALANCE'], $hongbaoConfig->getLimit );
	// 红包档位失效
	roleManager_setHongbaoComplete($player, $goodsId);
}else{
	// 提现失败或者提现异常,都需要回写活动余额
	// 回写本期活动的余额
	DB_operator_updateHongBaoActBalance($connObj->redisConn, $amount);
	return RstMsg(error_getCommonError('WITHDRAW_FAILURE'), $msgID);
}

//  数据入库
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player) );
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
	return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}

$messageRetData = new stdClass();
$messageRetData->update = playerDataSync_getUpdate();
$messageRetData->rewardList = $rewardList;

return RstMsg(0, $msgID, $messageRetData);




