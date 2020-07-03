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
include("../../manager/petManager.php");
include("../../manager/roleManager.php");
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

$msgID = $MESSAGE['PET_BUY_BY_DIAMOND'];
$uid  = number_format($parameter['uid'],0, '', ''); // uid
$level = (int)$parameter['level']; // 购买的等级

if ( empty($level) ){
    return RstMsg(error_getCommonError('PARAMETER_ERROR'), $msgID);
}

// 该等级宠物是否已经开启
$petOpenMaxLevel =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('PET_OPEN_MAX_LEVEL'))->value;
if($level >= $petOpenMaxLevel){
    return RstMsg(error_getCommonError('PET_LEVEL_NOT_ENABLED'), $msgID);
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

// 做客户端的一些数据同步
roleManager_syncData($player, [
	"money" => @$parameter['syncMoney']?(int)$parameter['syncMoney'] : 0 ,
	"speed" => @$parameter['syncSpeed']?(int)$parameter['syncSpeed'] : 0 ,
	"ad" => @$parameter['syncAD']?(int)$parameter['syncAD'] : 0
]);


// 奖励列表 --TODO 奖励列表主要是用来给前端做展示
$rewardList = [];

// 判断是否有空位
$site = petManager_getFirstNullSites($player);
if ( $site < 0 ){
    return RstMsg(error_getCommonError('LACK_OF_SITE'), $msgID);
}

// 判断该等级的宠物是否能够够买
if(!petManager_ableBuyPetByDiamond($player, $level)){
    return RstMsg(error_getCommonError('PET_LEVEL_BEYOND_RESTRICT'), $msgID);
}

// 增加宠物的购买记录(方便后续计算)
petManager_addDiamondBuyRecordNum($player, $level);

// 获得需要的金钱花费(--TODO 因为先增加记录因此无需偏移)
$price =  petManager_calculatePetDiamondCostByLevel($player, $level, 0);
$goodsType = getSysConfig('GOODS_TYPE');
$itemIds = getSysConfig('ITEM_ID');
// 判断角色钻石是否充足
if(!roleManager_goodsSufficient($player, $itemIds['DIAMOND'],$goodsType['DIAMOND'], $price )){
    return RstMsg(error_getCommonError('LACK_OF_DIAMOND'), $msgID);
}

// 在位置上添加一个宠物
petManager_addPetBySiteAndlevel($player, $site, $level);

// 扣除钻石
roleManager_expendGoods($player, $itemIds['DIAMOND'],$goodsType['DIAMOND'], $price);

//  数据入库
$setRoleDataRet = DB_operator_setRoleDataByRedis($uid, $connObj->redisConn, json_encode($player) );
if ( empty($setRoleDataRet) || $setRoleDataRet['code'] != 0 ){
    return RstMsg(error_getCommonError('SET_USER_DATA_FAIL'), $msgID);
}

$messageRetData = new stdClass();
$messageRetData->update = playerDataSync_getUpdate();
$messageRetData->rewardList = $rewardList;
$messageRetData->buyInfo = [
    'site'=>$site,
    'level'=>$level
];
return RstMsg(0, $msgID, $messageRetData);




