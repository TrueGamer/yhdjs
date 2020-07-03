<?php
// 玩家数据同步模块
global $playerDataSync_info;
$playerDataSync_info = new stdClass();

// 通用的更新方式 (整体替换)
function playerDataSync_generalUpdate( $player, $moudleName, $field=null ){
    global $playerDataSync_info;
    if ( !isset( $playerDataSync_info->$moudleName) ){
        $playerDataSync_info->$moudleName = new stdClass();
    }
    if ( isset($field) ){
        $playerDataSync_info->$moudleName->$field = $player->$moudleName->$field;
    }else{
        $playerDataSync_info->$moudleName = $player->$moudleName;
    }
}

// 获得更新数据
function playerDataSync_getUpdate(){
    global $playerDataSync_info;
    return $playerDataSync_info;
}


?>