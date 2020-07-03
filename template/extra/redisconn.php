<?php

$redis_address 	= "127.0.0.1";			// redis地址
$redis_port		= 6900;					// redis端口
$redis_password = "";
$redis = new Redis();
$redis->connect( $redis_address, $redis_port );
if ( !$redis )
{
	getLog()->error( "redis_connect failed" );
	return null;
}

// 授权
$redis->auth( $redis_password );
return $redis;

?>
