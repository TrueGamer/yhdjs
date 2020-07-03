<?php

include("../../comm/comm.php");

// 接收参数
$handlerId     = $_GET["handlerId"];            // 渠道ID
$time    = @$_GET["time"]?$_GET["time"]:1;      // 次数

if (empty($handlerId)) {
	return commonRstMsg("0001", "handlerId param is null.", []);
}

if ( !is_numeric($time) ){
	$time = 1;
}


// 检查redis连接
$redisConn = include("../../extra/redisconn.php");

if ( empty($redisConn)) {
	return commonRstMsg("0002", " redisConn get failed.", []);
}

$dateKey = date('Y-m-d');

$key = "jshc.stats.ad." . $dateKey;

getLog()->error($key);

$redisConn->HINCRBY($key, $handlerId, $time);

return commonRstMsg(0, ' 成功 ', []);

