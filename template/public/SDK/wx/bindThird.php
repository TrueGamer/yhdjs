<?php

include("../../../comm/comm.php");
include("../sdkComm.php");

// 接收参数
$touristId     = $_GET["touristId"];            // 游客ID
$openId        = $_GET["openId"];            	// 第三方Id

if (empty($touristId)) {
	return commonRstMsg("0001", "touristId is null.", []);
}

if (empty($openId)) {
	return commonRstMsg("0002", "openId is null.", []);
}

// 检查redis连接
$redisConn = include("../../../extra/redisconn.php");

if (!$redisConn) {
	getLog()->error("get redisConn failed.");
	return commonRstMsg("0002", "get redisConn failed.", []);
}
// 拼接redis key
$newKey =  "third." . $openId;

// 从redis中取
$newUserData = $redisConn->HGETALL($newKey);

if ($newUserData){
	// 该openId已经绑定过账号了
	return commonRstMsg("0003", "the openId has been bound", []);
}

$oldKey = "third." . $touristId;
// 从redis中取
$oldUserData = $redisConn->HGETALL($oldKey);
if (empty($oldUserData) || count($oldUserData) == 0){
	// 该touristId是空的
	return commonRstMsg("0004", "tourist data is null", []);
}

if( $oldUserData["isBind"] ){
	return commonRstMsg("0005", "Tourist account can only be bound once", []);
}

$curTime = time();

// 绑定
$params = [];
$params["openId"] = $openId;
$params["accountId"] = $oldUserData["accountId"];
$params["createTime"] = $curTime;
$params["recentlyLoginTime"] = $curTime;
$params["isBind"] = true;
$redisConn->hmset($newKey, $params);

// 修改老数据的绑定标志,给老的数据设置一个生命周期，30天
$oldUserData["isBind"] = true;
$redisConn->hmset($oldKey, $oldUserData);
$redisConn->EXPIRE($oldKey, 86400*30);

return commonRstMsg("0000", 'bind succ', []);

?>


