<?php

// 公用方法
include("../../comm/comm.php");

// 数据库操作
include("../../extra/DBOperator.php");


$redisConn = include("../../extra/redisconn.php");

$hongbaoActs = json_decode(file_get_contents('../../config/hongbaoAct.json'));

if ( empty($hongbaoActs) ){
	return commonRstMsg("0001", " 请确认config目录下活动红包配置表已经配置 ", []);
}

// 配置文件中最大索引值
$maxIndex = 0;
foreach($hongbaoActs as $key => $val){
	if ( $key > $maxIndex ) {
		$maxIndex = $key;
	}
}

if ( !$maxIndex ){
	return commonRstMsg("0001", " 请确认config目录下活动红包配置表不能为空 ", []);
}
$hongbaoAct = $hongbaoActs->$maxIndex;
getLog()->error($hongbaoAct);

if ( empty($hongbaoAct->createTime) ){
	return commonRstMsg("0002", " 活动红包配置表中createTime字段是否已经配置 ", []);
}

if ( empty($hongbaoAct->endTime) ){
	return commonRstMsg("0003", " 活动红包配置表中endTime字段是否已经配置 ", []);
}

if( $hongbaoAct->createTime >= $hongbaoAct->endTime ){
	return commonRstMsg("0004", " 请确保活动开启的时间大于活动结束的时间 ", []);
}

// 获取活动总金额
if (empty($hongbaoAct->allRmb) ){
	return commonRstMsg("0005", " 活动红包配置表中allRmb字段是否已经配置 ", []);
}

if ($hongbaoAct->allMoney < 0){
	return commonRstMsg("0006", " 确认活动红包配置表中allMoney字段必须大于或者等于0 ", []);
}

// 获取活动id
if (empty($hongbaoAct->actId) ){
	return commonRstMsg("0007", " 活动红包配置表中actId字段是否已经配置 ", []);
}

// 获得最近一次红包活动数据
$actInfoRet = DB_operator_getHongBaoActBaseInfo($redisConn);
if ( !$actInfoRet['code']){
	//	$actInfoRet['code'] 返回0,服务器中已经保存过红包活动数据
	$actInfo = $actInfoRet["data"];
	if ($actInfo["actId"] == $hongbaoAct->actId) {
		return commonRstMsg("0008", " 本期开启的活动已经是在开启的活动中,请检测配置 ", []);
	}

}

$ret = DB_operator_openHongBaoAct($redisConn, $hongbaoAct->allRmb, $hongbaoAct->createTime, $hongbaoAct->endTime, $hongbaoAct->actId );

if ( empty($ret) || !empty($ret["code"]) ){
	return commonRstMsg("0009", " 确认服务器是否已经部署完成，并且已经开启 ", []);
}

return commonRstMsg("0000", " 活动已经开启成功", []);