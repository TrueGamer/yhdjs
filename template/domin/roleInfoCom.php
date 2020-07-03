<?php

// 角色数据结构
function roleInfoCom_createRoleData( $uid, $openId, $name ){
    $tempRole = new role($uid, $openId, $name);
    $roleData = $tempRole->get_roleInfo();
    return $roleData;
}

// 角色创建之后,初始化某些模块的数据
function roleInfoCom_createLaterInit( $player, $connObj ){
    // 初始化宠物列表
    petManager_initPetList($player);
    // 设置快速购买的数据
    petManager_setQuickBuyData($player);
}

// 玩家数据结构更新
function roleInfoCom_updateRoleStruct($oldData){
    // 新数据只做结构对比，玩家的原始数据从老数据中获得
    $newObj = roleInfoCom_createRoleData(1,0,"");
    $oldObj = json_decode($oldData);
    if ( $newObj->version <=  $oldObj->version){
        return $oldObj;
    }
    $newVersion =  $newObj->version;
    roleInfoCom_updateStruct($newObj, $oldObj);
    $newObj->version = $newVersion;
    return $newObj;
}

/** 结构更新
 * --TODO 注意，如果老数据a['b']是对象, 在新修改的数据当中将a['b']修改成了数组，数据更新是不会生效的
 * @param $oldData 玩家的老数据
 * @return int
 */
function  roleInfoCom_updateStruct( $newData, $oldData ){
    foreach ($newData as $key => $value){
        $sourceStr = gettype($value);
        if ($sourceStr == 'resource') {
            return;
        }
        if ( $sourceStr == 'object'){
            // 如果是对象，则递归调用
            if ( isset($oldData->$key) && gettype($oldData->$key) == 'object'  ){
                $oldData->$key = roleInfoCom_updateStruct($value, $oldData->$key);
            }
        }
    }
    return roleInfoCom_merge( $newData, $oldData );
}

/**  将二个对象合成一个对象,对象的数据targetObj为主，（包含的类型是基本类型 int等，和数组类型，数组类型不做进一步递归）
 * @param $sourceObj
 * @param $targetObj
 * @return mixed
 */
function roleInfoCom_merge($sourceObj,$targetObj) {
    $ret = $sourceObj;
    foreach ($targetObj as $k => $v) {
        $ret->$k = $v;
    }
    return $ret;
}

/** 对象的深拷贝
 * @param $sourceObj 源对象
 * @return mixed 返回一个新对象
 */
function roleInfoCom_deepCopy($sourceObj) {
    return json_decode(json_encode($sourceObj));
}

?>

