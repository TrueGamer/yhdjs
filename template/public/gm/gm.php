<?php

// 公用方法
include("../../comm/comm.php");
// 数据库操作
include("../../extra/DBOperator.php");
// 系统配置
include("../../extra/sysConfig.php");

$defingcfg = json_decode(file_get_contents('../../config/defingcfg.json'));

// 系统宏配置的第27项
$index = 27;

if (empty($defingcfg->$index) || empty($defingcfg->$index->value)){
	return commonRstMsg(-1, '当前不运行使用gm指令,请去修改系统宏配置表中的27项的值', []);
}


$uid = $_GET["uid"];
$type = $_GET["type"];
/*
 * 1: 金钱
 * 2: 门票
 * 3: 最大合成宠物等级
 * 4: 红包数据拉满
 * 5: 钻石
 * 6: 增加红包
 */
$num = @$_GET["num"] ? $_GET["num"] : 0;

// 初始化连接
$initConnRet = DB_operator_initConnRedis();
if ( empty($initConnRet) || $initConnRet['code'] != 0 ){
    return commonRstMsg(-1, '获取连接失败', []);
}

$connObj = $initConnRet['data'];
// 根据这个账号从数据库中查找数据
$getRoleDataRet = DB_operator_getRoleDataNonLogin($uid, $connObj->redisConn);
if ( empty($getRoleDataRet) || $getRoleDataRet['code'] != 0 ){
    // 只有内部出错，才会拿不到返回的数据
    return commonRstMsg(-1, '用户不存在', []);
}
$userData = $getRoleDataRet['data'];
if (empty($userData)){
    return commonRstMsg(-1, ' 用户不存在 ', []);
}

$player = json_decode($userData);

switch ($type){
    case 1:
        $player->money = (int)$num;
        break;
    case 2:
        $player->roll->ticket = (int)$num;
        break;
    case 3:
        $player->pet->maxLevel = (int)$num;
        break;
	case 4:
		// 红包数据拉满 测试环境下使用
		foreach ( $record as $k => $v ){
			$v->state = 3;
		}
		break;
	case 5:
		$player->diamond = (int)$num;
		break;
	case 6:
		$player->hongbao->val += 0;
		$player->hongbao->ADNum += 0;
		break;
    default:
        return commonRstMsg(-1, '类型不存在', []);
}

//  数据入库(数据只往redis数据库中进行存入)
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player));
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
    return commonRstMsg(-1, '失败', []);
}
return commonRstMsg(0, ' 成功 ', []);

