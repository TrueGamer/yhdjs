<?php

date_default_timezone_set('PRC');

include dirname(__FILE__).'/log4php/Logger.php';
$log = Logger::getLogger(__FILE__);

if(file_exists('log_config.xml'))
{
    Logger::configure("log_config.xml");
}
else
{
    Logger::configure(dirname(__FILE__).'/log_config.xml');
}

function getLog()
{
    $log = Logger::getLogger(__FILE__);
    return $log;
}

function call_curl_post($url,$data_array)
{
    $data = '';
    foreach($data_array as $key=>$value) { $data .= $key.'='.$value.'&'; }
    rtrim($data,'&');
    $ch = curl_init($url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
    curl_setopt($ch,CURLOPT_POST,true);
    curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
    $info = curl_exec($ch);    
    curl_close($ch);    
    return json_decode($info, true);
}

function call_curl_post_jsonType($url, $data_array)
{
    $data = json_encode($data_array);
    $ch = curl_init($url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
    curl_setopt($ch,CURLOPT_POST,true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($data)));
    curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
    $info = curl_exec($ch);
    curl_close($ch);
    return json_decode($info, true);
}

// get请求
function call_curl_get( $url, $data_array )
{
    $data = '';
    if ($data_array != null)
    {
        foreach($data_array as $key=>$value) 
        { 
            $data .= $key.'='.$value.'&'; 
        }
        $data = rtrim($data,'&');        
    }
    $url .= "?";
    $url .= $data;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
    curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 5 );
    $info = curl_exec($ch);    
    curl_close($ch);    

    return json_decode($info, true);
}


function call_curl_get_str( $url, $data_array )
{
    $data = '';
    if ($data_array != null)
    {
        foreach($data_array as $key=>$value)
        {
            $data .= $key.'='.$value.'&';
        }
        $data = rtrim($data,'&');
    }
    $url .= "?";
    $url .= $data;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
    curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 5 );
    $info = curl_exec($ch);
    curl_close($ch);

    return $info;
}

//取字符的下val个字符 如 getNextChar( "A"，1 )  ==  "B"
function getNextChar( $srcChar, $val ){
    return chr( ord( $srcChar ) + $val );
}

// 通用http请求消息返回格式
 function commonRstMsg( $code, $errorMessage, $info ){
     $res = array(
         "code"=>$code,
         "errorMessage" => $errorMessage?$errorMessage:'',
         "info"=>$info?$info:[]
     );
     echo json_encode($res);
     return true;
 }

// 游戏逻辑的消息返回格式
function RstMsg( $ret, $msgID, $data = null ){
    $res = array(
        "ret"=>$ret,
        "msgID"=>$msgID,
        "data"=>$data,
        "ctime"=>time(),
    );
    echo json_encode($res);
    return true;
}


// 计算重置点
function figureResetTime( $t1, $rt ) {
    $rH = floor( $rt/60/60 );
    $rM = floor( $rt/60%60 );
    $rS = floor( $rt%60 );
    $dd = mktime($rH, $rM, $rS, 1, 1, 2030);
    return $t1 + (($dd - $t1)%86400);
};

//从索引位置分割字符串，$srcStr 原字符串，$index 索引，$part 返回部分，0-头部，1-尾部
function getSubStrFromIndex($srcStr,$index,$part){
    //索引位置
    $loc = strpos($srcStr,$index);
    //头
    $front = substr($srcStr,0,$loc);
    //尾
    $tail = substr($srcStr,$loc+1);
    if($part == 1 ){
        return $tail;
    }else if($part == 0 ){
        return $front;
    }
}

// 参数拼接
function getParamStr( $params ){
    $str = "";
    foreach( $params as  $k => $v ){
        $str = $str . $k . "=" . $v . "&";
    }
    $str = rtrim( $str, "&");
    return $str;
}

// 删除指定key
function array_del( $arr, $key ){
    if( !array_key_exists( $key, $arr ) ){
        return $arr;
    }
    $keys = array_keys( $arr );
    $index = array_search( $key, $keys );
    if( $index !== FALSE ){
        array_splice( $arr, $index, 1 );
    }
    return $arr;
}

/**
 * 十进制数转换成62进制
 *
 * @param integer $num
 * @return string
 */
function from10_to62($num) {
	$to = 62;
	$dict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$ret = '';
	do {
		$ret = $dict[bcmod($num, $to)] . $ret;
		$num = bcdiv($num, $to);
	} while ($num > 0);
	return $ret;
}

/**
 * 62进制数转换成十进制数
 *
 * @param string $num
 * @return string
 */
function from62_to10($num) {
	$from = 62;
	$num = strval($num);
	$dict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$len = strlen($num);
	$dec = 0;
	for($i = 0; $i < $len; $i++) {
		$pos = strpos($dict, $num[$i]);
		$dec = bcadd(bcmul(bcpow($from, $len - $i - 1), $pos), $dec);
	}
	return $dec;
}



function  randomByMinAndMax($min = 0, $max = 10000) {
    return mt_rand($min, $max);
}

function indexAction() {
	/*
	时间戳转换成日期不用说了
	但是日期要转成时间戳的话就要用到
	strtotime()
	*/
	$time = time(); //时间戳
	$nowtime = date('Y-m-d H:i:s', $time); //生成带格式的日期
	$oldtime = '2010-11-10 22:19:21';
	$catime = strtotime($oldtime); //日期转换为时间戳
	$nowtimes = date('Y-m-d H:i:s', $catime); //时间戳又转回日期了
	echo $nowtimes;
}

//设置此页面的过期时间(用格林威治时间表示)，只要是已经过去的日期即可。
header("Expires: Mon, 26 Jul 1970 05:00:00 GMT");

//设置此页面的最后更新日期(用格林威治时间表示)为当天，可以强制浏览器获取最新资料
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");

//告诉客户端浏览器不使用缓存，HTTP 1.1 协议
header("Cache-Control: no-cache, must-revalidate");

//告诉客户端浏览器不使用缓存，兼容HTTP 1.0 协议
header("Pragma: no-cache");

header('content-type:application/json;charset=utf8');  


?>
