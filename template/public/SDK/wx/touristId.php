<?php
// 获得游客临时OpenId
include("../../../comm/comm.php");
include("../sdkComm.php");

// 检查redis连接
$redisConn = include("../../../extra/redisconn.php");

if (!$redisConn) {
	getLog()->error("get redisConn failed.");
	return commonRstMsg("0002", "get redisConn failed.", []);
}

$touristId = sdkComm_createTouristOpenId($redisConn);

if ($touristId){
	return commonRstMsg("0000", "get touristId succ", ["touristId" => $touristId]);
}else{
	return commonRstMsg("0001", "get touristId failed", []);
}


