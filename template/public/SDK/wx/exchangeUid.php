<?php

include("../../../comm/comm.php");
include("../sdkComm.php");

// 接收参数
$openId     = $_GET["openId"];            // 第三方id


// $isTourist 为真则表示游客登录
$isTourist = $_GET["isTourist"] ? $_GET["isTourist"] : 0  ;

if (empty($openId)) {
    return commonRstMsg("0001", "openId is null.", []);
}

// 检查redis连接
$redisConn = include("../../../extra/redisconn.php");

if (!$redisConn) {
	getLog()->error("get redisConn failed.");
	return commonRstMsg("0002", "get redisConn failed.", []);
}

// 拼接redis key
$key =  "third." . $openId;

// 从redis中取
$result = $redisConn->HGETALL($key);
$accountId = null;

if ( empty($result) || count($result) == 0 ){
    // 在redis中没有找到玩家的数据，则创建
    $accountId =  sdkComm_createAccount( $redisConn );
	$curTime = time();
    if ($accountId){
    	$params = [
			"openId"	        => $openId,
			"accountId"         => $accountId,
			"createTime"        => $curTime,
			"recentlyLoginTime" => $curTime,
		];
		if($isTourist){
			$params["isBind"] = 0;
		}else{
			$params["isBind"] = 1;
		}
		$redisConn->hmset($key, $params);
	}else{
		return commonRstMsg("0003", "exchangeUid failed", []);
	}
}else {
	$result["recentlyLoginTime"] = time();
	$redisConn->hmset($key, $result);
    $accountId = $result['accountId'];
}

return commonRstMsg("0000", 'exchangeUid succ', ["accountId"=>$accountId]);

?>


