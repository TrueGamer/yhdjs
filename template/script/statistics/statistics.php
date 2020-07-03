<?php
// 注意: 通过 遍历数据库的方式进行统计, 只能在游戏开服测试阶段使用
// （注意为保证数据准确性，未使用 scan 命令, 在脚本执行阶段可能会导致服务器redis通道阻塞, 谨慎使用）

// 统计说明
// 今日新增用户 (在游戏中创建过账号的用户)
// 今日完成微信绑定的用户
// 今日完成新手引导的用户


// 公用方法
include("../../comm/comm.php");

// 数据库操作
include("../../extra/DBOperator.php");

// 系统配置
include("../../extra/sysConfig.php");

// 初始化连接
$initConnRet = DB_operator_initConnRedis();
if ( empty($initConnRet) || $initConnRet['code'] != 0 ){
	return commonRstMsg(-1, '获取连接失败', []);
}

$connObj = $initConnRet['data'];

// 获得所有用户的key
$userList = $connObj->redisConn->keys("userInfo.*");
getLog()->error($userList);

$newAddUser = 0;
$bindWxUser = 0;
$succGuideUser = 0;

// 获得今日的
$todayStart = strtotime(date('Y-m-d', time()));
$todayEnd = $todayStart + 24 * 60 * 60;
getLog()->error($todayStart);

getLog()->error($todayEnd);

foreach ($userList as $k => $v ){
	getLog()->error($v);
	$tempArr = explode('.', $v, 2);
	getLog()->error($tempArr);
	$uid = $tempArr[1];
	getLog()->error($uid);
	// 根据这个账号从数据库中查找数据
	$getRoleDataRet = DB_operator_getRoleDataNonLogin($uid, $connObj->redisConn);
	getLog()->error($getRoleDataRet);
	if ( empty($getRoleDataRet) || $getRoleDataRet['code'] != 0 ){
		// 用户不存在
		continue;
	}
	$userData = $getRoleDataRet['data'];
	if (empty($userData)){
		// 用户不存在
		continue;
	}

	$player = json_decode($userData);

	if ($player->createTime > $todayStart && $player->createTime < $todayEnd){
		$newAddUser++;
	}else{
		continue;
	}

	if ($player->pet->maxLevel >= 3){
		$succGuideUser++;
	}
	if (isset($player->openId) && substr((string)$player->openId, 0, 2) != "38"){
		$bindWxUser++;
	}
}

$result = [
	"newAddUser" => $newAddUser,
	"bindWxUser" => $bindWxUser,
	"succGuideUser" => $succGuideUser,
];

getLog()->error($result);

echo json_encode($result);

