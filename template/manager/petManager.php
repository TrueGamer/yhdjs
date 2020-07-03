<?php

// 获得宠物数据
function petManager_getData($player){
    return $player->pet;
}

// 初始化宠物列表
function petManager_initPetList ( $player ){
    $data = petManager_getData($player);
    if( sizeof($data->list) != 0 ){
        return ;
    }
    // 初始化
    $mapMaxPetNum =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('MAP_PET_MAX_NUM'))->value;
    for ( $i = 0; $i < $mapMaxPetNum; $i++ ){
        $data->list[$i] = array(
			"level" => 0,
			"type" => 0,
			"id" => 0,
		);
    }
    return ;
}

// 初始化快速购买数据
function petManager_setQuickBuyData ( $player ){
    $data = petManager_getData($player);
    $ret = petManager_getCostPerformanceHigPet($player);
    $data->qk = $ret;
    playerDataSync_generalUpdate($player, 'pet', 'qk');
}

// 获取地图位置上的一个空位
function petManager_getFirstNullSites ( $player ){
    $site = -1;
    $data = petManager_getData($player);
    $num = count($data->list);
    // i从5开始  0~4位置是战斗位，可以为空
    for ( $i = 5; $i < $num; $i++ ){
        $temp = $data->list[$i];
        // 当前位置level为0
		$type = getSysConfig('POSITION_TYPE');
        if ( $temp->level == 0  &&  $temp->type == $type["NULL"] ){
            $site = $i;
            break;
        }
    }
    return $site;
}

// 通过某个位置上添加某个等级的宠物
function petManager_addPetBySiteAndlevel ( $player, $site, $level){
    $data = petManager_getData($player);
	$type = getSysConfig('POSITION_TYPE');
    $data->list[$site]->level = $level;
	$data->list[$site]->id = $level; // 当前宠物的等级和id是保持一致的
	$data->list[$site]->type = $type["PET"];
    playerDataSync_generalUpdate($player, 'pet', 'list');
    // 是否更新当前等级最高的宠物
    petManager_updateMaxLevelPet($player, $level);
}


// 通过某个位置的数据
function petManager_getPetDataBySite ( $player, $site ){
    $data = petManager_getData($player);
    return $data->list[$site]?$data->list[$site]:null;
}

// 可以升级宠物
function petManager_allowUpgrade ( $player, $indexs ){
	if ( count($indexs) < 2 ){
		return false;
	}
	$type = getSysConfig('POSITION_TYPE');
	$pet1 = petManager_getPetDataBySite($player, $indexs[0]);
	if ( $pet1->type != $type["PET"] ){
		return false;
	}
	$pet2 = petManager_getPetDataBySite($player, $indexs[1]);
	if ( $pet2->type != $type["PET"] ){
		return false;
	}
	if ($pet1->level != $pet2->level){
		return false;
	}
	return true;
}

// 更新当前等级最高的宠物
function petManager_updateMaxLevelPet ( $player, $level ){
    $data = petManager_getData($player);
    if ($data->maxLevel >=  $level){
        return 0;
    }
    // 需要更新
    $data->maxLevel = $level;
    playerDataSync_generalUpdate($player, 'pet', 'maxLevel');

    // 获得第一次达到某个等级的奖励
    $data->maxLevelReward = $level;
    playerDataSync_generalUpdate($player, 'pet', 'maxLevelReward');
	//  将上一次解锁的最大宠物等级保存到 lastUnlockMaxPet 中
	$player->hongbao->lastUnlockMaxPet = $level;
	playerDataSync_generalUpdate($player, 'hongbao', 'lastUnlockMaxPet');
    return $level;
}

// 允许领取宠物合成奖励
function petManager_allowGetPetUpgradeReward ( $player ){
    $data = petManager_getData($player);
    if ($data->maxLevelReward > 0){
        return true;
    }
    return false;
}

// 分发宠物合成奖励
function petManager_handOutPetUpgradeReward ( $player, $multi, &$rewardList ){
    $data = petManager_getData($player);
    $configs = configManager_getConfigs('petCombineReward');
    $level = $data->maxLevelReward;
    $config = $configs->$level;
    $rmb = (int)$config->rmb;
    $goodsType = getSysConfig('GOODS_TYPE');
    $itemIds = getSysConfig('ITEM_ID');
    roleManager_addGoods($player, $itemIds['DIAMOND'],$goodsType['DIAMOND'], $rmb*$multi, $rewardList);
}

// 清理最大合成奖励的数据
function petManager_clearMaxUpgradeRewardData ( $player ){
    $data = petManager_getData($player);

    $data->maxLevelReward  = 0;
    playerDataSync_generalUpdate($player, 'pet', 'maxLevelReward');
}

// 能够使用金钱购买当前等级的宠物
function petManager_ableBuyPetByMoney ( $player, $level ){
    $data = petManager_getData($player);
    $condition =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('MONEY_BUY_PET_LEVEL_CONDITION'))->value;
    // 一级不做限制
    if ($level === 1){
        return true;
    }
    // 大于一级增加限制
    if($data->maxLevel - $level < $condition ){
        return false;
    }
    return true;
}

// 获得金币购买的最大宠物等级
function petManager_getMaxBuyPetLevelByMoney ( $player ){
    $data = petManager_getData($player);
    $maxPetLevel = $data->maxLevel;
    $condition =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('MONEY_BUY_PET_LEVEL_CONDITION'))->value;
    if ($maxPetLevel <=  $condition){
        return 1;
    }else{
        return $maxPetLevel-$condition;
    }
}

// 能够使用钻石购买当前等级的宠物
function petManager_ableBuyPetByDiamond ( $player, $level ){
    $data = petManager_getData($player);
    $condition =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('DIAMOND_BUY_PET_LEVEL_CONDITION'))->value;
    $minLevel =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('DIAMOND_BUY_MIN_LEVEL'))->value;
    // 如果购买的宠物等级小于4，不能进行购买
    if ($level < $minLevel){
        return false;
    }
    if( $data->maxLevel - $level < $condition ){
        return false;
    }
    return true;
}

// 获取使用钻石购买当前等级的宠物
function petManager_getMaxBuyPetLevelByDiamond ( $player ){
    $condition =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('DIAMOND_BUY_PET_LEVEL_CONDITION'))->value;
    $minLevel =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('DIAMOND_BUY_MIN_LEVEL'))->value;
    $data = petManager_getData($player);
    $maxPetLevel = $data->maxLevel;

    // 购买的宠物等级小于这个最小值
    if( $maxPetLevel < ($condition + $minLevel) ){
        return 0;
    }
    return $maxPetLevel - $condition ;
}

// 增加金币购买宠物的购买次数记录
function petManager_addMoneyBuyRecordNum( $player, $level ){
    $data = petManager_getData($player);
    if( empty($data->moneyBuyRecord->$level) ){
        $data->moneyBuyRecord->$level=0;
    };
    $data->moneyBuyRecord->$level++;
    playerDataSync_generalUpdate($player, 'pet', 'moneyBuyRecord');
    // 重新计算快速购买的数据
    petManager_setQuickBuyData($player);
}

// 增加钻石购买宠物的购买次数记录
function petManager_addDiamondBuyRecordNum( $player, $level ){
    $data = petManager_getData($player);
    if( empty($data->diamondBuyRecord->$level) ){
        $data->diamondBuyRecord->$level=0;
    };
    $data->diamondBuyRecord->$level++;
    playerDataSync_generalUpdate($player, 'pet', 'diamondBuyRecord');
}

// 通过等级计算金币的花费
function petManager_calculatePetMoneyCostByLevel( $player, $level, $offset ){
    if (empty( $offset) ){
        $offset = 0;
    }
    $data = petManager_getData($player);
    $config = configManager_getConfigs('petMoneyShop');
	$levelBuyNum = isset($data->moneyBuyRecord->$level)?$data->moneyBuyRecord->$level:0;
    // 第一次购买
    if ( $levelBuyNum + $offset <= 1 ){
        return $config->$level->a ;
    }else{
        $temp = pow($config->$level->b, $levelBuyNum-1+$offset);
        return round($temp*$config->$level->a);
    }
}

// 通过等级计算钻石的花费
function petManager_calculatePetDiamondCostByLevel( $player, $level, $offset ){
    if (empty( $offset) ){
        $offset = 0;
    }
    $data = petManager_getData($player);
    $configs = configManager_getConfigs('petRmbShop');
    if ( empty($configs) || empty($configs->$level) ){
    	return 0;
	}
    return round($configs->$level->a + $configs->$level->b * ($data->diamondBuyRecord->$level-1 + $offset));
}


// 宠物合成升级
function petManager_petUpgrade( $player, $indexs ){
    // 普通合成
    $data = petManager_getData($player);
    // 将位置0的宠物等级+1
    $data->list[$indexs[0]]->level++;
	$data->list[$indexs[0]]->id =  $data->list[$indexs[0]]->level;
    // 将位置1的位置数据清空
	petManager_clearSiteDataBySite($player, $indexs[1]);
    playerDataSync_generalUpdate($player, 'pet', 'list');
    // 是否需要更新当前等级最高的宠物
    $result = petManager_updateMaxLevelPet($player, $data->list[$indexs[0]]->level);
    return $result;
}


// 位置交换
function petManager_petExchangeSite( $player, $indexs ){
    $data = petManager_getData($player);
    $temp = $data->list[$indexs[0]];
    $data->list[$indexs[0]] = $data->list[$indexs[1]];
    $data->list[$indexs[1]] = $temp;
    playerDataSync_generalUpdate($player, 'pet', 'list');
}

// 计算宠物出售的价格
function petManager_calculatePetSellPrice( $player, $site ){
    $data = petManager_getData($player);
    $level = $data->list[$site]->level;
    if ($level == 0 ){
        return 0;
    }
    $config = configManager_getConfigs('petSell');
    if (empty($config->$level)){
        return 0;
    }
    return $config->$level->price;
}

// 获得性价比最高的宠物
function petManager_getCostPerformanceHigPet( $player ){
    $data = petManager_getData($player);
    $condition =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('MONEY_BUY_PET_LEVEL_CONDITION'))->value;
    // 获得当前所有金钱购买解锁宠物的等级
    $val = $data->maxLevel - $condition;
    // 6级前只解锁第1级宠物
    if ( $val <= 0 ){
        $val = 1;
    }
    $costPerformanceHigPetLevel = 1;
    $costPerformanceHigPetval = 0;
    $costPerformanceHigPrice = 0;
    // 计算所有解锁等级的性价比
    for( $i = 1; $i <= $val ; $i++ ){
        // 获得当前等级的价格
        $price = petManager_calculatePetMoneyCostByLevel($player, $i, 1);
        $rate = 0;
        if ( $i == 1 ){
            $rate = 1;
        }else{
            $rate = pow(2,($i-1));
        }
//      getLog()->error('倍率'. $rate );
        $costPerformance = round($price/$rate);
//      getLog()->error('价格: '. $price . ' 性价比: ' . $costPerformance . " 等级 : "  . $i);
        if( $costPerformanceHigPetval == 0 ||  $costPerformance < $costPerformanceHigPetval ){
            $costPerformanceHigPetval = $costPerformance;
            $costPerformanceHigPetLevel = $i;
            $costPerformanceHigPrice = $price;
        }
    }
    //  getLog()->error('性价比最高的等级: ' . $costPerformanceHigPetLevel . " 性价比 : "  . $costPerformanceHigPetval);
    $ret = new stdClass();
    $ret->level = $costPerformanceHigPetLevel;
    $ret->money = $costPerformanceHigPrice;
    return $ret;
}

// 清空某个位置的数据
function petManager_clearSiteDataBySite( $player, $site  ){
	$data = petManager_getData($player);
	$type = getSysConfig('POSITION_TYPE');
	$data->list[$site]->level = 0;
	$data->list[$site]->id = 0;
	$data->list[$site]->type = $type["NULL"];
	playerDataSync_generalUpdate($player, 'pet', 'list');
}

// 通过某个位置上添加宝箱
function petManager_addBox ( $player, $boxId, &$boxUpdate ){
	// 获取当前的空位
	$nullSite = petManager_getFirstNullSites($player);
	// 当site < 0时，当前没有空位
	if ( $nullSite < 0 ){
		// 没有空位,添加到宝箱溢出保存列表
		petManager_boxOverflowUnshift($player, $boxId);
	}else{
		// 有空位,直接添加一个宝箱
		petManager_addBoxBySite($player, $nullSite, $boxId);
		array_push($boxUpdate,[
			"site" =>	$nullSite,
			"id" => $boxId
		]);
	}
}

// 通过某个位置上添加宝箱
function petManager_addBoxBySite ( $player, $site, $boxId){
	$data = petManager_getData($player);
	$type = getSysConfig('POSITION_TYPE');
	$data->list[$site]->level = 0;
	$data->list[$site]->id = $boxId;
	$data->list[$site]->type = $type["BOX"];
	playerDataSync_generalUpdate($player, 'pet', 'list');
}

// 是宝箱
function petManager_isBoxOfSite ( $player, $site ){
	$data = petManager_getData($player);
	$type = getSysConfig('POSITION_TYPE');
	if( $data->list[$site]->type != $type["BOX"] ){
		return false;
	}
	return true;
}

// 开启宝箱
function petManager_openBox( $player, $site, &$boxUpdate, $admark, &$rewardList){
	$data = petManager_getData($player);
	$configs = configManager_getConfigs('box');
	$boxId = $data->list[$site]->id;
	$config = $configs->$boxId;
	if ( empty($config) ){
		return ;
	}
	$boxType = getSysConfig('BOX_TYPE');
	if ( $config->type == $boxType["ONE"] ){
		// 植物宝箱
		petManager_openOneTypeBox( $player, $site);
	}else if ( $config->type == $boxType["TWO"] ){
		// 广告宝箱
		petManager_openTwoTypeBox($player, $site, $boxUpdate, $admark, $rewardList );
	}
}

// 头插一个溢出宝箱数据
function petManager_boxOverflowUnshift( $player, $id ){
	$data = petManager_getData($player);
	$info = new stdClass();
	$info->id =  $id;
	$info->create = time();
	array_unshift($data->boxOverflow, $info);
	// 如果长度大于20，丢弃掉最早插入的溢出宝箱
	if ( count($data->boxOverflow) > 20 ){
		// 尾删
		array_pop($data->boxOverflow);
	}
	playerDataSync_generalUpdate($player, 'pet', 'boxOverflow');
}

// 弹出尾部一个溢出宝箱数据
function petManager_boxOverflowPop( $player ){
	$data = petManager_getData($player);
	$result= array_pop($data->boxOverflow);
	playerDataSync_generalUpdate($player, 'pet', 'boxOverflow');
	return $result;
}

// 溢出列表是空的
function petManager_boxOverflowIsNull( $player ){
	$data = petManager_getData($player);
	if(!count($data->boxOverflow)){
		// 溢出列表为空
		return true;
	}
	return false;
}

// 开启一个植物宝箱
function petManager_openOneTypeBox( $player, $site ){
	$data = petManager_getData($player);
	$configs = configManager_getConfigs('box');
	$boxId = $data->list[$site]->id;
	$config = $configs->$boxId;
	if ( empty($config) ){
		return ;
	}
	$maxPetLevel = $data->maxLevel;
	$rule = $config->rule;
	$result = $maxPetLevel - $rule;
	if ( $result <= 0  ){
		// 最低获得1级的植物
		$result = 1;
	}
	// 清空当前位置数据
	petManager_clearSiteDataBySite($player, $site);
	// 在当前位置上添加植物
	petManager_addPetBySiteAndlevel($player, $site, $result);
}


// 开启一个广告宝箱
function petManager_openTwoTypeBox( $player, $site, &$boxUpdate, $admark, &$rewardList ){
	$data = petManager_getData($player);
	$configs = configManager_getConfigs('box');
	$boxId = $data->list[$site]->id;
	$config = $configs->$boxId;
	if ( empty($config) ){
		return ;
	}
	$rule = $config->rule;
	// 清空当前位置数据
	petManager_clearSiteDataBySite($player, $site);
	if ( empty($admark) ){
		return ;
	}
	// rule 获得一类宝箱的个数
	for ( $i = 0; $i < $rule; $i++ ){
		$boxType = getSysConfig('BOX_TYPE');
		// 随机一个1类型的宝箱
		$id = petManager_ranOneBox($boxType["ONE"]);
		if ( empty($id) ){
			getLog()->error("petManager_ranOneBox is error");
		}
		petManager_addBox($player, $id, $boxUpdate);
	}

	// 红包奖励
	// 是否能够获得
	$adBoxHbTime = roleManager_getAdBoxHbTime($player);
	$maxAdBoxHbTime = configManager_getConfig('defingcfg',configManager_getSysMacro('MAX_AD_BOX_HB_TIME') )->value;
	if ( $adBoxHbTime >= $maxAdBoxHbTime ) {
		return;
	}
	//	增加红包值
	$goodsType = getSysConfig('GOODS_TYPE');
	$itemIds = getSysConfig('ITEM_ID');
	roleManager_addGoods($player, $itemIds['HONGBAO'], $goodsType['HONGBAO'], $config->hb, $rewardList);
	// 增加领取次数
	roleManager_addAdBoxHbTime($player,1);
	// 设置红包缓存值
	roleManager_setAdBoxHb($player, $config->hb);
}

/**
 * 随机一个宝箱
 * @param $player
 * @param $type  0: 对所有类型宝箱一起随机  1.2.3对单类型宝箱随机
 */
function petManager_ranOneBox( $type  ){
	$configs = configManager_getConfigs('box');
	$allWeight = -1;
	foreach ( $configs as $k => $v ){
		if ( $type && $v->type != $type ){
			continue;
		}
		$allWeight += (int)$v->weight;
	}
	$randVal = mt_rand(0,$allWeight);
	$tempWeight = 0;
	foreach ( $configs as $k => $v ){
		if ( $type && $v->type != $type ){
			continue;
		}
		$tempWeight += (int)$v->weight;
		if ( $randVal < $tempWeight ){
			return $k;
		}
	}
	return null;
}

/**
 * 增加击杀盒子记录的数量
 * @param $type
 * @return int|null|string
 */
function petManager_addKillBoxNum( $player  ){
	$data = petManager_getData($player);
	$data->killBoxRecord++;
	playerDataSync_generalUpdate($player, 'pet', 'killBoxRecord');
}

/*
 * 检查溢出宝箱
 * @param $player
 */
function petManager_inspectOverflowBox( $player, &$boxUpdate  ){
	$data = petManager_getData($player);
	// 溢出宝箱列表是否为空
	if (petManager_boxOverflowIsNull($player)){
		return ;
	}
	$len = count($data->boxOverflow);
	for ($i =0; $i < $len; $i++ ){
		// 获取当前的空位
		$nullSite = petManager_getFirstNullSites($player);
		if ( $nullSite < 0 ){
			return ;
		}
		// 弹出尾部的数据
		$data = petManager_boxOverflowPop($player);
		// 增加一个宝箱
		petManager_addBox($player, $data->id, $boxUpdate);
	}

}

/*
 * 触发合成触发广告机制
 * @param $player
 * @param $level 当前合成的宠物等级
 */
function petManager_touchUpAD( $player, $level ){
	$data = petManager_getData($player);
	$config = petManager_getUpADConfigByLevel($level);
	if ( empty($config) ){
		getLog()->error("upAD 配置表有错误");
		return false;
	}
	$adLimit = $config->limit;
	if ( $level + $adLimit > $data->maxLevel ){
		// 不符合条件
		return false;
	}
	$adWeight = $config->adWeight;
	// 符合条件，是否触发
	if ( mt_rand(1,10000) > $adWeight ) {
		// 没有触发
		return false;
	}
	return true;
}

/*
 * 通过等级去获得合成触发的配置
 */
function petManager_getUpADConfigByLevel ($level) {
	$configs = configManager_getConfigs('upAD');
	foreach ( $configs as $k => $v ){
		if ( $level >= $v->min && $level <= $v->max){
			return $v;
		}
	}
	return null;
}


/*
 * 记录上次合成的数据
 * @param $player
 * @param $site 位置
 */
function petManager_saveLastUpSite( $player, $site, $upLevel ){
	$player->pet->lastUp->site = $site;
	$player->pet->lastUp->upLevel = $upLevel;
	playerDataSync_generalUpdate($player, 'pet', 'lastUp');
}

/*
 * 获取上次合成的位置
 * @param $player
 */
function petManager_getLastUpSite( $player ){
	return $player->pet->lastUp ;
}

/*
 * 清理上次的合成记录
 * @param $player
 */
function petManager_clearLastUpSite( $player ){
	$player->pet->lastUp->site = -1;
	$player->pet->lastUp->upLevel = 0;
	playerDataSync_generalUpdate($player, 'pet', 'lastUp');
}

/**
 * 根据权重随机宠物升级的等级
 * @param $player
 */
function petManager_ranOnePetUpLevel( $level ){
	$config = petManager_getUpADConfigByLevel($level);
	// 根据权重去获得升级宠物的等级
	$upWeights = $config->upWeights;
	$allWeight = -1;
	foreach ( $upWeights as $k => $v ){
		$allWeight += $v;
	}
	$randVal = mt_rand(0,$allWeight);
	$tempWeight = 0;
	foreach ( $upWeights as $k => $v ){
		$tempWeight += (int)$v;
		if ( $randVal < $tempWeight ){
			return $k;
		}
	}
	return 0;
}

/*
 * 获取上次合成的位置
 * @param $player
 */
function petManager_upADRewardTouch( $player, $site, $upLevel ){
	$data = petManager_getData($player);
	$type = getSysConfig('POSITION_TYPE');
	$data->list[$site]->level = (int)$data->list[$site]->level+(int)$upLevel;
	$data->list[$site]->id = $data->list[$site]->level;
	$data->list[$site]->type = $type["PET"];
	playerDataSync_generalUpdate($player, 'pet', 'list');
}

/*
 * 合成触发获取红包数值
 * @param $player
 */
function petManager_getHongbaoByLevelAndUpLevel( $level, $upLevel ){
	$config = petManager_getUpADConfigByLevel($level);
	$hb = $config->hb->$upLevel;
	if (empty($hb) || !is_numeric($hb)){
		$hb = 0;
	}
	return $hb;
}
