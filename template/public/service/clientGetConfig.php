<?php

// 公用方法
include("../../comm/comm.php");

// 公用方法
include("../../manager/configManager.php");

$configs = configManager_getConfigs('dfwconfigs');

if ( empty($configs) ) {
	return commonRstMsg(-1, ' 配置表不存在 ', []);
}

return commonRstMsg(0, ' 成功 ', [
	"configs" => $configs
]);
