<?php

// 公用方法
include("../comm/comm.php");

$url = "http://dfw.0clan.com/jiangshihc/public/api/petExchangeSite.php";
$index = 12;
$params = [
    "uid" => 100100000000009,
];

for( $i = 0; $i < 1000000; $i++ ){
    if ( $i % 10000 == 0 ){
        $params["indexs"] = [];
        $randVal = mt_rand(0,14);
        array_push($params["indexs"],$index);
        array_push($params["indexs"],$randVal);
        $index = $randVal;
        call_curl_post_jsonType($url, $params);
    }
}
