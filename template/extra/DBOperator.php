<?php

// 只初始化reids的连接，非登录接口使用
function DB_operator_initConnRedis(){
    $ret = [
        'code' => 0,
        'data' => null,
    ];
    $redis = include(dirname(__FILE__) . "/redisconn.php");
    if ( !$redis ){
        $ret['code'] = -1;
        return $ret;
    }
    $ret['data'] = new stdClass();
    $ret['data']->redisConn = $redis;
    return $ret;
}


// 获得角色的整体数据,通过redis
function DB_operator_getRoleDataByRedis ($uid,$redisConn) {
    $ret = [
        'code' => 0,
        'data' =>null
    ];

    // 查询redis数据库
    $key = getSysConfig('REDIS_USERINFO_PRE') . $uid;
    $userData = $redisConn->get($key);
    if ($userData) {
        // 从redis中得到玩家数据
        $ret['data'] = $userData;
    }
    return $ret;
};


// 设置玩家的数据，通过redis
function DB_operator_setRoleDataByRedis ($uid, $redisConn, $userData) {
    $ret = [
        'code' => 0,
        'data' =>null
    ];

    // 查询redis数据库
    $key = getSysConfig('REDIS_USERINFO_PRE') . $uid;
    $redisRet = $redisConn->SET($key, $userData);
     // -TODO 用户锁这里线上先不加，如果添加，需要在错误处理的地方，也进行解锁操作（暂未添加）
//    // 解锁
//    $lockKey = "userLock." . $uid;
//    $redisConn->DEL($lockKey);

    // mysql存储失败了则返回失败-1
    if (!$redisRet) {
        $ret['code'] = -1;
    }
    return $ret;
};


// 获得角色的整体数据，非登录接口,该接口和登录接口的区别在于，登录接口使用了mysql连接，该接口只使用了redis的连接
function DB_operator_getRoleDataNonLogin ($uid,$redisConn) {
    $ret = [
        'code' => 0,
        'data' =>null
    ];
    // -TODO 用户锁这里线上先不加，如果添加，需要在错误处理的地方，也进行解锁操作（暂未添加）
//    // 查看是否添加用户锁
//    $lockKey = "userLock." . $uid;
//    $lock = $redisConn->GET($lockKey);
//    if ($lock){
//        getLog()->error("user Info lock");
//        $ret['code'] = -1;
//        return $ret;
//    }
//    $seconds  = 60;
//    $addLockRet =  $redisConn->SETEX($lockKey, $seconds, 1);
//    if (!$addLockRet){
//        getLog()->error("add lock fail");
//        $ret['code'] = -1;
//        return $ret;
//    }

    // 直接从redis中获取玩家的数据
    $retResult1 =  DB_operator_getRoleDataByRedis($uid,$redisConn);
    if ($retResult1['code'] == 0 && !empty( $retResult1['data'])){
        // 在redis中找到了该玩家的数据
        $ret['data'] = $retResult1['data'];
    }else{
        // 在redis中没有找到用户数据
        $ret['code'] = 0; // 先这样修改
    }
    return $ret;
};

// 开启红包活动
function DB_operator_openHongBaoAct ( $redisConn, $rmb, $createTime, $endTime, $actIndex ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	$incrementKey = "hongbaoAct_increment";
	$actId =  $redisConn->incr($incrementKey);
	if ( empty($actId) ){
		$ret['code'] = -1;
		return $ret;
	}
	$actKey = "hongBaoAct." . $actId;
	$params = [
		"allRmb" => (int)$rmb,
		"curRmb" => (int)$rmb,
		"createTime" => $createTime,
		"endTime" => $endTime,
		"actId" => $actIndex,
		"version" => $actId,
	];
	$openActRet = $redisConn->HMSET($actKey, $params);
	if ( $openActRet != "OK" ){
		$ret['code'] = -1;
		return $ret;
	}
	return $ret;
};

// 更新红包活动的余额
function DB_operator_updateHongBaoActBalance ( $redisConn, $rmb ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	// 获得第几期
	$actTime = DB_operator_getHongBaoActTime($redisConn);
	if ( !empty($actTime['code']) ){
		$ret['code'] = -1;
		return $ret;
	}
	$actKey = "hongBaoAct." . $actTime['data'];
	$field = "curRmb";
	$openActRet = $redisConn->HINCRBY($actKey, $field, $rmb);
	if ( !$openActRet ){
		$ret['code'] = -1;
		return $ret;
	}
	return $ret;
};

// 获取红包活动的余额
function DB_operator_getHongBaoActBaseInfo ( $redisConn ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	// 获得第几期
	$actTime = DB_operator_getHongBaoActTime($redisConn);
	if ( !empty($actTime['code']) ){
		$ret['code'] = -1;
		return $ret;
	}
	$actKey = "hongBaoAct." . $actTime['data'];
	$getActRet = $redisConn->HGETALL($actKey);
	if ( empty($getActRet) ){
		$ret['code'] = -1;
		return $ret;
	}
	$ret['data'] = $getActRet;
	return $ret;
};

// 获取红包活动的第几期
function DB_operator_getHongBaoActTime ( $redisConn ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	$incrementKey = "hongbaoAct_increment";
	$actId =  $redisConn->GET($incrementKey);
	if ( empty($actId) ){
		$ret['code'] = -1;
		return $ret;
	}
	$ret['data'] = $actId;
	return $ret;
};

// 增加用户的提现成功记录
function DB_operator_addUserWithdrawSuccRecord ( $redisConn, $uid, $openId, $amount ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	$key = "userWithdrawRecord." . $uid;
	$data = [
		"uid" => $uid,
		"openId" => $openId,
		"amount" => $amount,
		"time" => time()
	];
	$lpushRet =  $redisConn->LPUSH ($key, json_encode($data));
	if( $lpushRet && $lpushRet > 20 ){
		$redisConn->RPOP ($key);
	}else{
		$ret['code'] = -1;
	}
	return $ret;
};

// 获取用户的提现成功记录
function DB_operator_getUserWithdrawSuccRecord ( $redisConn, $uid ) {
	$ret = [
		'code' => 0,
		'data' =>null
	];
	$key = "userWithdrawRecord." . $uid;
	$lrangeRet =  $redisConn->LRANGE ($key, 0, -1);
	if ( $lrangeRet ){
		$ret['data'] = $lrangeRet;
	}else{
		$ret['code'] = -1;
	}
	return $ret;
};
?>