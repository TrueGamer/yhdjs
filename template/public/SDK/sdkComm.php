<?php

/**
 * 账号拼接
 * @param $accountData
 * @return string
 */
function  sdkComm_packAccount( $accountData ){
    $channelsId = $accountData['channelsId'];    // 渠道id
    $gameId = $accountData['gameId'];  // 游戏id
    $incrVal = $accountData['incrVal'];  // 自增值

    $a = $channelsId*1000 + $gameId;
    $accountId = $a * 100000000000 + $incrVal;
    return sprintf("%.0f",$accountId);
}

/**
 * 账号解析
 * @param $accountId
 * @return array|null
 */
function  sdkComm_unpackAccount( $accountId ){
    $result = [];
    if ( is_string($accountId) || is_int($accountId) ){
        $accountId = (int)$accountId;
        $result['channelsId'] =  floor($accountId / 100000000000 / 1000);    // 渠道id
        $result['gameId'] = floor($accountId / 100000000000 % 1000) ;  // 游戏id
        $result['incrVal']  = floor(fmod(floatval($accountId), 100000000000));  // 自增值
    }else{
        return NULL;
    }
    return $result;
}


/**
 * 创建一个账号
 * 0       000            0000 0000 0000
 * 渠道id    游戏id      自增序列 通过redis生成,12位
 * @param $redisConn
 * @return bool|string]
 */
function  sdkComm_createAccount( $redisConn ){
	$channelsId = 1;
	$gameId = 1;
    $increment_key = "user_increment";
    $incrVal =  $redisConn->incr($increment_key);
    if ( !$incrVal ){
		getLog()->error( "incrVal is null");
		return false;
    }
    $param = [];
    $param["channelsId"] = $channelsId;
    $param["gameId"] = $gameId;
    $param["incrVal"] = $incrVal;
    $result = sdkComm_packAccount($param);
    return $result;
}



/**
 * 创建一个游客账号
 * @param $redisConn
 * @return bool|string]
 */
function  sdkComm_createTouristOpenId( $redisConn ){
	$increment_key = "tourist_increment";
	$incrVal =  $redisConn->incr($increment_key);
	if ( !$incrVal ){
		getLog()->error( "incrVal is null");
		return false;
	}
	$touristOpenId = pow(10,15) + $incrVal;
	return dechex($touristOpenId);
}

/**
 * 创建一个随机字符串
 * @param $length
 * @return string
 */
function sdkComm_createRandString( $length ) {
	if ( empty($length) ){
		$length = 8;
	}
	// 密码字符集，可任意添加你需要的字符
	$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	$len = strlen($chars);
	$password = "";
	for ( $i = 0; $i < $length; $i++ )
	{
		$password .= $chars[ mt_rand(0, $len - 1) ];
	}
	return $password;
}

/**
 * 创建一个自己的订单号
 * @param $redisConn
 * @return bool|string
 */
function sdkComm_createSelfOrder( $redisConn ) {
	$increment_key = "order_increment";
	$incrVal =  $redisConn->incr($increment_key);
	if ( !$incrVal ){
		getLog()->error( "incrVal is null");
		return false;
	}
	$preTime =  date("YmdGis");
	$result = $preTime . $incrVal;
	return $result;
}

/**
 * 初始化订单信息
 * @param $redisConn
 * @param $openId
 * @param $goodsId
 * @param $orderId
 * @param $amount
 * @param $uid
 * @return bool
 */
function sdkComm_initAndSaveOrder($redisConn,
								  $openId,
								  $goodsId,
								  $orderId,
								  $amount,
								  $uid) {
	$orderState = sdkComm_orderAllStates();
	$curTime = time();
	$info = [
		"state" => 	$orderState["PENDING_PROCESSING"],
		"openId" => $openId,
		"goodsId" => $goodsId,
		"createTime" => $curTime,
		"updateTime" => $curTime,
		"orderId" => $orderId,
		"amount" => $amount,
		"uid" => $uid
	];
	$key = "order." . $orderId;
	$ret =  $redisConn->HMSET ($key, $info);
	if ( $ret == "ok" ){
		return true;
	}else{
		getLog()->error(" order save failure ");
		getLog()->error(" orderId :  :  " . $orderId);
		return false;
	}
}

/**
 * 更新订单状态
 * @param $redisConn
 * @param $orderId
 * @param $state
 * @return bool
 */
function sdkComm_updateAndSaveOrder($redisConn, $orderId, $state) {
	$curTime = time();
	$info = [
		"state" => 	$state,
		"updateTime" => $curTime,
	];
	$key = "order." . $orderId;
	$ret =  $redisConn->HMSET($key, $info);
	if ( $ret == "ok" ){
		return true;
	}else{
//		getLog()->error(" order save failure ");
//		getLog()->error(" openId :  :  " . 	$orderId);
		return false;
	}
}

/**
 * 保存微信提现的处理结果
 * @param $redisConn
 * @param $orderId
 * @param $data
 * @return bool
 */
function sdkComm_withdrawResultSave( $redisConn, $orderId, $data ) {
	$key = "withdrawResult." . $orderId;
	$ret =  $redisConn->LPUSH ($key, json_encode($data));
	if ( !$ret ){
		getLog()->error( "Lpush Order failure");
		return false;
	}
	return true;
}

/**
 * 将订单号插入到订单表头
 * @param $redisConn
 * @param $openId
 * @param $orderId
 * @return bool
 */
function sdkComm_orderLpushList( $redisConn, $openId, $orderId ) {
	$key = "orderList." . $openId;
	$ret =  $redisConn->LPUSH ($key, $orderId);
	if ( !$ret ){
		getLog()->error( "Lpush Order failure");
		return false;
	}
	return true;
}

/**
 * 获取玩家最近的一次订单
 * @param $redisConn
 * @param $openId
 * @return mixed
 */
function sdkComm_lastOrderId( $redisConn, $openId ) {
	$key = "orderList." . $openId;
	$ret =  $redisConn->LRANGE ($key, 0, 0);
	return $ret;
}

/**
 * 分析上个订单
 * @param $redisConn
 */
function sdkComm_analysisLastOrder( $redisConn, $openId ) {
	$lastOrderId = sdkComm_lastOrderId( $redisConn, $openId );
	if (empty($lastOrderId)){
		// 一次订单都没有
		return [];
	}
	// 获取订单数据
	$data = sdkComm_getOrderByOrderId($redisConn, $lastOrderId[0]);
	if ( empty($data) ){
		// 没有存订单数据
		return [];
	}
	$orderState = sdkComm_orderAllStates();
	if ($data["state"] == $orderState["PROCESSING_ABNORMAL"]){
		// 微信处理订单过后，产生未知错误的异常状态，需注意，使用原订单好继续发送
		return ["orderId" => $lastOrderId[0]];
	}else if ($data["state"] == $orderState["PENDING_PROCESSING"]){
		// 订单还未处理，继续发原订单账号
		return ["orderId" => $lastOrderId[0]];
	}else{
		return [];
	}
}

/**
 * 订单已经处理完成
 * @param $data
 */
function sdkComm_orderAlreadyComplete( $data ) {
	if ( empty($data) ){
		// 没有存订单数据
		return true;
	}
	$orderState = sdkComm_orderAllStates();
	if ($data["state"] == $orderState["PROCESSING_ABNORMAL"]){
		// 微信处理订单过后，产生未知错误的异常状态，需注意，使用原订单好继续发送
		return false;
	}else if ($data["state"] == $orderState["PENDING_PROCESSING"]){
		// 订单还未处理，继续发原订单账号
		return false;
	}else{
		return true;
	}
}

// 通关订单号获取订单数据
function sdkComm_getOrderByOrderId( $redisConn, $orderId ) {
	$key = "order." . $orderId;
	$data =  $redisConn->HGETALL($key);
	return $data;
}

/**
 * 签名
 * @param $data
 * @return string
 */
function sdkComm_wxSign( $data ) {
	// 排序，拼接
	$stringA = sdkComm_ASCII($data);

	// 追加秘钥
	$stringSignTemp = $stringA . "&key=e49ca098f79b3cfcf76eff5f6733f7de" ;
	$sign= strtoupper(md5($stringSignTemp));
	return $sign;
}

/**
 * 将数组ASCII排序并且拼接
 * @param array $params
 * @return bool|string
 */
function sdkComm_ASCII($params = array()){
	if(!empty($params)){
		$p =  ksort($params);
		if($p){
			$str = '';
			foreach ($params as $k=>$val){
				$str .= $k .'=' . $val . '&';
			}
			$strs = rtrim($str, '&');
			return $strs;
		}
	}
	return false;
}

// 获取渠道枚举
function sdkComm_getChannelEnum(){
	return  array(
		"WEIXIN" => 1,
	);
}

// 获取渠道配置
function sdkComm_getChannelConfig( $type ){
	$types =  sdkComm_getChannelEnum();
	if ( $type == $types["WEIXIN"] ){
		return array(
			"appId" => "wxecb5a8e710205705",
			"appSecret" => "32b31f2ff437b3c2259bd80b7039538d",
			"vendor" => "1480323992"
		);
	}
}

// 获取渠道配置
function sdkComm_orderAllStates(  ){
	return array(
		"PENDING_PROCESSING"=>1,	  // 订单等待处理
		"PROCESSING_SUCCESS"=>2,	  // 订单成功
		"PROCESSING_FAILURE"=>3,	  // 订单失败
		"PROCESSING_ABNORMAL"=>4, 	  // 订单异常
	);
}

// 获取提现结果的状态
function sdkComm_withdrawResultStates(  ){
	return array(
		"SUCCESS"=>1,	  // 订单成功
		"FAILURE"=>2,	  // 订单失败
		"ABNORMAL"=>3, 	  // 订单异常
	);
}


// 通用http请求消息返回格式
function sdkComm_commonRstMsg( $code, $errorMessage, $info ){
	$res = array(
		"code"=>$code,
		"errorMessage" => $errorMessage?$errorMessage:'',
		"info"=>$info?$info:[]
	);
	echo json_encode($res);
	return true;
}

// 查询处理微信提现的处理结果
function sdkComm_findOrderResult( $orderId ){
	$wxType = 1;
	$config = sdkComm_getChannelConfig($wxType);
	$params = [
		"nonce_str" => sdkComm_createRandString(16),
		"partner_trade_no" => $orderId,
		"mch_id" => $config["vendor"],
		"appid" => $config["appId"]
	];
	$params["sign"] = sdkComm_wxSign($params);
	$url = "https://api.mch.weixin.qq.com/mmpaymkttransfers/gettransferinfo";
	$ret = sdkComm_post($url, $params);
	return $ret;
}


function sdkComm_post($url, $data_array )
{
	$data = sdkComm_arrayToXml($data_array);
	$ch = curl_init($url);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
	curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
	curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,false);
	curl_setopt($ch, CURLOPT_TIMEOUT, 2);
	curl_setopt($ch,CURLOPT_POST,true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($data)));
	curl_setopt($ch,CURLOPT_SSLCERTTYPE,'PEM');
	curl_setopt($ch,CURLOPT_SSLCERT,"/alidata/www/game.kakayunnews.com/ssl/apiclient_cert.pem");
	curl_setopt($ch,CURLOPT_SSLKEYTYPE,'PEM');
	curl_setopt($ch,CURLOPT_SSLKEY,"/alidata/www/game.kakayunnews.com/ssl/apiclient_key.pem");
	curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
	$info = curl_exec($ch);
//	getLog()->error($info);
	curl_close($ch);
	return sdkComm_xmlToArray($info);
}

// 数组转化为xml
function sdkComm_arrayToXml($arr) {
	$xml = "<xml>";
	foreach ($arr as $key => $val){
		if (is_numeric($val)){
			$xml.="<$key>$val</$key>";
		}
		else
			$xml.="<$key><![CDATA[$val]]></$key>";
	}
	$xml.="</xml>";
	return $xml;
}

// xml转化为数组
function sdkComm_xmlToArray($xml) {
	$arr = json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
	return $arr;
}

/**
 * 分析提供结果
 * @param $redisConn
 * @param $data
 */
function sdkComm_analysisWithdrawResult( $redisConn, $orderId, $data ) {
	// 订单的所有状态
	$orderState = sdkComm_orderAllStates();
	// 提现结果的所有状态
	$resultState = sdkComm_withdrawResultStates();
	// 为了正常流程下提现金的安全，初始结果赋值为异常状态
	$isSucc = $resultState["ABNORMAL"];
	if ( $data['return_code'] == "SUCCESS" ){
		// 先保存这条通信返回
		sdkComm_withdrawResultSave($redisConn, $orderId, $data );
		// 写个日志
//		getLog()->error("提现结果 如下 : ");
//		getLog()->error($data);
		// 微信服务器成功接收消息，并返回
		if ( $data["result_code"] == "SUCCESS" ){
			// 消息处理成功
			$updateRet = sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_SUCCESS"]);
			if ($updateRet){
				$isSucc = true;
			}
		}else if($data["result_code"] == "FAIL" ){
			// 消息处理失败, 再一次查询该订单处理结果
			$findRet = sdkComm_findOrderResult($orderId);
//			getLog()->error("查询结果 如下 : ");
//			getLog()->error($findRet);
			if ( $findRet["return_code"] == "SUCCESS" ){
				sdkComm_withdrawResultSave($redisConn, $orderId, $findRet );
				//	判断微信对该订单的处理状态
				if ( $findRet["status"] == "SUCCESS" ){
					// 成功
					$updateRet = sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_SUCCESS"]);
					if ($updateRet){
						$isSucc = $resultState["ABNORMAL"];
					}
				}else if ($findRet["status"] == "FAILED"){
					/**
					 * 表示与wx服务器进行提现请求，并且通信成功，但是返回的结果是"FAIL"，
					 * 进行订单账号查询请求,通信成功，但是返回的result_code 是FAILED
					 * 表示订单已经处理完成，提现的结果是失败的
					 * 返回处理结果失败
					 */
					$updateRet = sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_FAILURE"]);
					if ($updateRet){
						$isSucc = $resultState["FAILURE"];
					}
				}else{
					/**
					 * 表示与wx服务器进行提现请求，并且通信成功，但是返回的结果是"FAIL"，
					 * 进行订单账号查询请求,通信成功，但是返回的result_code 不是FAILED SUCCESS
					 * 表示订单还在处理，或者微信服务器发送异常
					 * 返回处理结果异常
					 */
					// 订单还在处理中  --将本地订单号保存成异常状态（下次获取订单还是获取的原订单）
					sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_ABNORMAL"]);
				}
			}else{
				/*
					表示与wx服务器进行提现请求，并且通信成功，但是返回的结果是"FAIL"，
					进行订单账号查询请求,但是通信失败
					返回处理结果异常
				*/
				//  将本地订单号保存成异常状态（下次获取订单还是获取的原订单）
				sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_ABNORMAL"]);
			}
		}else{
			/*
			 * 表示与wx服务器进行提现请求，并且通信成功，但是 "result_code"返回来异常值，非"FAIL" "SUCCESS"
			 * 返回处理结果异常
			 */
			// --将本地订单号保存成异常状态（下次获取订单还是获取的原订单）
			sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_ABNORMAL"]);
		}
	}else{
		/*
		 * 表示与wx服务器进行提现请求，但是通信未成功，则设置成为异常状态
		 * 返回处理结果异常
		 */
		// --将本地订单号保存成异常状态（下次获取订单还是获取的原订单）
		sdkComm_updateAndSaveOrder($redisConn, $orderId,  $orderState["PROCESSING_ABNORMAL"]);
	}
	return $isSucc;
}
