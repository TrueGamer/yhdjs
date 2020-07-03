<?php

    /**
     * 与客户端进行数据同步
     * @param $player
     */
    function roleManager_syncData( $player, $data ){
    	$tempList = [];
        if ( $data["money"] && $data["money"] > 0 ){
            $goodsType = getSysConfig('GOODS_TYPE');
            $itemIds = getSysConfig('ITEM_ID');
            // 增加金币
            roleManager_addGoods($player, $itemIds['MONEY'],$goodsType['MONEY'], $data["money"], $tempList);
        };
        if ( $data["ad"] && $data["ad"] > 0 ){
			$achievementType = getSysConfig('ACHIEVEMENT_TYPE');
			roleManager_disposeAchievementByType($player, $achievementType['WATCH_AD_NUMBER'], ["val"=>$data["ad"]]);
			$dailyType = getSysConfig('DAILY_TASK_TYPE');
			roleManager_disposeDailyTaskByType($player, $dailyType['WATCH_AD_NUMBER'], ["val"=>$data["ad"]]);

            roleManager_addRecordNumOfAD($player, $data["ad"]);
        }
		if ( $data["speed"] && $data["speed"] > 0 ){
			// 统计每日任务的加速
			$dailyType = getSysConfig('DAILY_TASK_TYPE');
			roleManager_disposeDailyTaskByType($player, $dailyType['SPEED_NUMBER'], ["val"=>$data["speed"]]);
		}
    }

    /**
     * 检测日重置
     * @param $player
     * @param $sync
     */
    function roleManager_checkDayReset( $player, $sync ){
        $curTime = time();

        // 更新上一次通信时间，用来计算离线收益
        roleManager_updateLastCommunicationTime($player, $curTime);

        // 检查红包档位是否失效
		roleManager_hongbaoFailureInspect($player);

        if (empty($sync)){
            $sync = true;
        }

        if (  $curTime > $player->nextResetTime ){
            //  日重置
            roleManager_dayReset($player, $curTime, $sync);
        }
    }

    /**
     * 登录处理
     * @param $player
     * @param $connObj
     */
    function roleManager_login( $player, $openId, $connObj ){
        // 登录处理成就数据
        roleManager_loginDisposeAchievement($player);

        // 登录处理每日任务的数据
        roleManager_loginDisposeDailyTask($player);

        // 对红包档位表进行矫正
		roleManager_adjustHongBaoRecord($player);

		// 登录时,纠正用户数据绑定的uid
		roleManager_adjustUserOpenId($player, $openId);

    }

    /**
     * 处理日重置
     * @param $player
     * @param $curTime
     * @param $sync
     */
    function roleManager_dayReset($player, $curTime, $sync )
    {

        // 每日任务重置
        roleManager_DailyTaskDayReset($player, $sync);
        // 收益加速重置
        roleManager_speedDayReset($player, $sync);
        // 抽奖券日重置
        roleManager_rollTicketDayReset($player, $sync);
        // 免费钻石的日重置
        roleManager_freeDiamondNumDayReset($player, $sync);
        // 免费金币日重置
		roleManager_freeMoneyNumDayReset($player, $sync);
		// 日重置升级奖励的红包次数
		roleManager_upLevelHbTimeDayReset($player, $sync);
		// 日重置广告宝箱红包奖励的次数
		roleManager_adBoxHbTimeTimeDayReset($player, $sync);

        $resetTime = configManager_getConfig('defingcfg',configManager_getSysMacro('DAY_RESET') )->value;
        // 重置下一次的日重置时间
        roleManager_setNextResetTime($player, figureResetTime( $curTime,  $resetTime ));
    }

    /**
     * 设置玩家下个重置时间
     * @param $player
     * @param $val
     */
    function roleManager_setNextResetTime($player, $val)
    {
        $player->nextResetTime = $val ;
        playerDataSync_generalUpdate($player, 'nextResetTime' );
    }


    /**
     * 增加角色的游戏币
     * @param $player
     * @param $val
     * @param $rewardList
     */
    function roleManager_addMoney($player, $val, &$rewardList)
    {
        $player->money += $val;
        $itemIds = getSysConfig('ITEM_ID');
        playerDataSync_generalUpdate($player, 'money' );
        // 添加到奖励列表中
        roleManager_addRewardListItem($rewardList, $itemIds['MONEY'], $val);
    }

    /**
     * 减少角色游戏币
     * @param $player
     * @param $val
     */
    function roleManager_expendMoney($player, $val)
    {
        $player->money -= $val;
        if ( $player->money < 0){
            $player->money = 0;
        }
        playerDataSync_generalUpdate($player, 'money' );
    }

    /**
     * 效验游戏币是否充足
     * @param $player
     * @param $val
     * @return bool
     */
    function roleManager_moneySufficient($player, $val)
    {
        return  $player->money >= $val ? true : false;
    }

    /**
     * 增加充值币
     * @param $player
     * @param $val
     * @param $rewardList
     */
    function roleManager_addDiamond($player, $val, &$rewardList)
    {
        $player->diamond += $val;
        playerDataSync_generalUpdate($player, 'diamond' );
        $itemIds = getSysConfig('ITEM_ID');
        // 添加到奖励列表中
        roleManager_addRewardListItem($rewardList, $itemIds['DIAMOND'], $val);
    }

    /**
     * 消耗充值币
     * @param $player
     * @param $val
     */
    function roleManager_expendDiamond($player, $val)
    {
        $player->diamond -= $val;
        if ( $player->diamond < 0){
            $player->diamond = 0;
        }
        playerDataSync_generalUpdate($player, 'diamond' );
    }

    /**
     * 充值币充足
    * @param $player
    * @param $val
    * @return bool
    */
    function roleManager_diamondSufficient($player, $val)
    {
        return  $player->diamond >= $val ? true : false;
    }

    /**
     * 增加红包
     * @param $player
     * @param $val
     * @param $rewardList
     */
    function roleManager_addHongBao($player, $val, &$rewardList)
    {
        $player->hongbao->val += $val;
        playerDataSync_generalUpdate($player, 'hongbao', 'val' );
        $itemIds = getSysConfig('ITEM_ID');
        // 添加到奖励列表中
        roleManager_addRewardListItem($rewardList, $itemIds['HONGBAO'], $val);
    }

    /**
     * 消耗红包
     * @param $player
     * @param $val
     */
    function roleManager_expendHongBao($player, $val)
    {
        $player->hongbao->val -= $val;
        if ( $player->hongbao->val < 0){
            $player->hongbao->val = 0;
        }
        playerDataSync_generalUpdate($player, 'hongbao', 'val' );
    }

    /**
     * 红包充足
     * @param $player
     * @param $val
     * @return bool
     */
    function roleManager_hongBaoSufficient($player, $val)
    {
        return  $player->hongbao->val >= $val ? true : false;
    }

    /**
     * 增加余额
     * @param $player
     * @param $val
     * @param $rewardList
     */
    function roleManager_addBalance($player, $val, &$rewardList)
    {
        $player->hongbao->balance += $val;
		//  对结果保留4位小数
		$player->hongbao->balance = floor($player->hongbao->balance*10000) / 10000;
        playerDataSync_generalUpdate($player, 'hongbao', 'balance' );
        $itemIds = getSysConfig('ITEM_ID');
        // 添加到奖励列表中
        roleManager_addRewardListItem($rewardList, $itemIds['BALANCE'], $val);
    }

    /**
     * 消耗余额
     * @param $player
     * @param $val
     */
    function roleManager_expendBalance($player, $val)
    {
        $player->hongbao->balance -= $val;
        if ( $player->hongbao->balance < 0){
            $player->hongbao->balance = 0;
        }
        playerDataSync_generalUpdate($player, 'hongbao', 'balance' );
    }

    /**
     * 余额充足
     * @param $player
     * @param $val
     * @return bool
     */
    function roleManager_balanceSufficient($player, $val)
    {
        return  $player->hongbao->balance >= $val ? true : false;
    }

    /**
     * 增加物品(对外接口)
     * @param $player
     * @param $itemId     	物品id
     * @param $itemTyp    	物品类型
     * @param $val        	增加数量
     * @param $rewardList 	奖励列表 (主要用户客户端弹窗显示)
     */
    function roleManager_addGoods($player, $itemId,  $itemTyp, $val, &$rewardList)
    {
        $goodsType = getSysConfig('GOODS_TYPE');
        // 做物品添加分流
        if ( $itemTyp == $goodsType['MONEY']  ){
            roleManager_addMoney( $player, $val, $rewardList );
        }else if($itemTyp == $goodsType['DIAMOND']){
            roleManager_addDiamond( $player, $val, $rewardList );
        }else if($itemTyp == $goodsType['HONGBAO']){
            roleManager_addHongBao( $player, $val, $rewardList );
        }else if($itemTyp == $goodsType['BALANCE']){
            roleManager_addBalance( $player, $val, $rewardList );
        }else {
            return ;
        }
    }

    /**
     * 物品充足效验(对外接口)
     * @param $player
     * @param $itemId  物品id
     * @param $itemTyp 物品类型
     * @param $val     效验数量
     * @return bool  true充足，false不足
     */
    function roleManager_goodsSufficient( $player, $itemId, $itemTyp, $val)
    {
        $isSufficient = false; // 充足标记
        $goodsType = getSysConfig('GOODS_TYPE');
        // 做物品添加分流
        if ( $itemTyp == $goodsType['MONEY']  ){
            $isSufficient = roleManager_moneySufficient( $player, $val );
//            // 金币不做效验
//            $isSufficient = true;
        }else if($itemTyp == $goodsType['DIAMOND']){
            $isSufficient= roleManager_diamondSufficient( $player, $val );
        }else if($itemTyp == $goodsType['HONGBAO']){
            $isSufficient= roleManager_hongBaoSufficient( $player, $val );
        }else if($itemTyp == $goodsType['BALANCE']){
            $isSufficient= roleManager_balanceSufficient( $player, $val );
        }
        return $isSufficient;
    }

    /**
     * 消耗物品（对外接口）
     * @param $player
     * @param $itemId
     * @param $itemTyp
     * @param $val
     */
    function roleManager_expendGoods( $player, $itemId, $itemTyp, $val)
    {
        if ( $val < 0 ){
            return ;
        }
        $goodsType = getSysConfig('GOODS_TYPE');
        // 做物品添加分流
        if ( $itemTyp == $goodsType['MONEY']  ){
            roleManager_expendMoney( $player, $val );
        }else if($itemTyp == $goodsType['DIAMOND']){
            roleManager_expendDiamond( $player, $val );
        }else if($itemTyp == $goodsType['HONGBAO']){
            roleManager_expendHongBao( $player, $val );
        }else if($itemTyp == $goodsType['BALANCE']){
            roleManager_expendBalance( $player, $val );
        }
    }

    /**
     * 将物品添加到奖励列表中
     * @param $rewardList 引用传值，奖励列表
     * @param $itemID     道具Id
     * @param $num        添加的数量
     */
    function roleManager_addRewardListItem(&$rewardList, $itemID, $num){
        $listLen = sizeof($rewardList);
		$isSucc = false;
        for ( $i = 0; $i < $listLen; $i++ ){
            $item = $rewardList[$i];
            if ($item->itemID == $itemID){
                $item->num += $num;
                $isSucc = true;
                break;
            }
        }
        // 未找到，则添加新道具
        if(!$isSucc){
            $temp = new stdClass();
            $temp->itemID = $itemID;
            $temp->num = $num;
            array_push($rewardList, $temp);
        }
    }

    // 更新最近一次通信时间
    function roleManager_updateLastCommunicationTime( $player, $time )
    {
        $player->lastCommunicationTime = $time;
        playerDataSync_generalUpdate($player, 'lastCommunicationTime' );
    }

    // 收益
    function roleManager_calculateEarnings( $player, &$rewardList ){
        $earnings = 0;
        $lastTime = $player->lastCommunicationTime;
        $curTime = time();
//      getLog()->debug('上次登录时间:' . $lastTime);
//      getLog()->debug('当前时间:' . $curTime);
        $differenceValue = $curTime - $lastTime;
        if($differenceValue<=0){
            return 0;
        }
        // 最大收益时间
        $earningsMaxTime =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('EARNINGS_MAX_TIME'))->value;
        if ($differenceValue > $earningsMaxTime){
            $differenceValue = $earningsMaxTime;
        }
        // 通过离线时间计算收益
        $earnings = roleManager_countEarning($player,$differenceValue);
        if($earnings>0){
            $goodsType = getSysConfig('GOODS_TYPE');
            $itemIds = getSysConfig('ITEM_ID');
            roleManager_addGoods($player, $itemIds['MONEY'],$goodsType['MONEY'], $earnings, $rewardList);
        }

        $earnings2 = roleManager_calculateSpeedEarnings($player);
//        getLog()->debug('基本收益是:' . $earnings);
//        getLog()->debug('加速收益是:' . $earnings2);
        // 更新通信时间
        roleManager_updateLastCommunicationTime($player, $curTime);

        $ret = [
            'time'=> $differenceValue,
            'money'=> $earnings+$earnings2,
			'hb' => 0
        ];

		// 计算离线红包收益
		if (roleManager_triggerOffHoneBao($player, $differenceValue)){
//			 触发离线红包奖励
			$configs = configManager_getConfigs('level');
			$rank = $player->rank;
			$config = $configs->$rank;
			$maxHb = $config->maxHb;
			$hb = floor(( $maxHb / $earningsMaxTime) * $differenceValue );
//			$goodsType = getSysConfig('GOODS_TYPE');
//			$itemIds = getSysConfig('ITEM_ID');
//			roleManager_addGoods($player, $itemIds['HONGBAO'],$goodsType['HONGBAO'], $hb, $rewardList);
//			设置离线奖励的红包缓存值
			roleManager_setOffHb($player, $hb);
			$ret["hb"] = $hb;
		}

        return $ret;
    }


    // 触发离线红包奖励
    function roleManager_triggerOffHoneBao( $player, $offTime ){
		$limitTime =  configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('OFF_HB_REWARD_TIME_LIMIT'))->value;
		if ( $offTime > $limitTime ){
			return true;
		}
		return false;
	}


    // 计算离线收益(通过关卡计算)
    function roleManager_countEarning( $player, $timeDuration){
        $configs = configManager_getConfigs('level');
        // 当前的关卡(--TODO 当前游戏内设计是关卡和段位是相对等的)
        $rank = $player->rank;
        $config = $configs->$rank;
        $unitEarning = (int)$config->onlineCoin;
        return round($timeDuration * $unitEarning, 0);
    }

    /**
     * 是否已经签到
     * @param $player
     * @return bool
     */
    function roleManager_alreadySign( $player ){
        if ($player->signIn->lastTime == 0){
            return false;
        }
        $firstSeconds = strtotime(date("Y-m-d 00:00:00"));
        if($player->signIn->lastTime < $firstSeconds){
            // 跨天,运行签到
            return false;
        }
        return true;
    }

    // 签到
    function roleManager_sign( $player, $multi, &$rewardList ){
        $config = configManager_getConfigs('checkIn');
        $val = $player->signIn->timer%7 + 1;
        $award = (int)$config->$val->count;
        $goodsType = getSysConfig('GOODS_TYPE');
        $itemIds = getSysConfig('ITEM_ID');
        $realityAward = $award*$multi;
        roleManager_addGoods($player, $itemIds['DIAMOND'],$goodsType['DIAMOND'], $realityAward, $rewardList);
        // 更新上次签到时间
        $time = time();
        $player->signIn->lastTime=$time;
        // 签到次数加1
        $player->signIn->timer++;
        playerDataSync_generalUpdate($player, 'signIn' );
    }

    // 有充足的抽奖券
    function roleManager_rollTicketIsEnough( $player ){
        if($player->roll->ticket <= 0 ){
            return false;
        }
        return true;
    }

	// 符合抽奖的间隔规则
	function roleManager_conformRollRule( $player ){
    	// 总的次数
		$allTime = configManager_getConfig('defingcfg',configManager_getSysMacro('EVERYDAY_ROLL_MAX_NUM') )->value;
		if ( empty($allTime) ){
			return false;
		}
		// 免费次数
		$freeTime = configManager_getConfig('defingcfg',configManager_getSysMacro('FREE_ROLL_NUM') )->value;
		if ( empty($freeTime) ){
			return false;
		}
		// 当前拥有的票
		$selfTicket = $player->roll->ticket;
		if ( $selfTicket > $allTime - $freeTime ){
			// 当前均属于免费的转盘
			return true;
		}
		// 查看间隔是否符合
		$lastTime =  roleManager_getLastRollTime($player);
		$curTime = time();
		$interval = $curTime - $lastTime;
		// 间隔时间规则
		$intervalRule = configManager_getConfig('defingcfg',configManager_getSysMacro('ROLL_USE_INTERVAL') )->value;
		if($interval > $intervalRule ){
			return true;
		}
		return true;
	}

    // 抽奖券日重置
    function roleManager_rollTicketDayReset( $player, $sync ){
        $player->roll->ticket = configManager_getConfig('defingcfg',configManager_getSysMacro('EVERYDAY_ROLL_MAX_NUM') )->value;
        if ($sync){
            playerDataSync_generalUpdate($player, 'roll', "ticket" );
        }
    }

    // 抽奖
    function roleManager_roll(){
        $config = configManager_getConfigs('roll');
        // 算出权重总值
        $allWeight = 0;
        foreach ($config as $key => $value){
            $allWeight += $value->weight;
        }
        //随机值
        $randPro = randomByMinAndMax(0,$allWeight);
        $sumPro = 0;
        $trigger = 0;
        foreach ($config as $key => $value){
            $sumPro += $value->weight;
            if( $randPro < $sumPro ){
                $trigger = $key;
                break;
            }
        }
        return $trigger;
    }

    // 抽奖奖励
    function roleManager_rollReward( $player, $trigger, &$rewardList ){
        $config = configManager_getConfigs('roll');
        $rollType = getSysConfig('ROLL_TYPE');
        $val = $config->$trigger->value;
        $rate = $player->roll->addJiaBei;
        roleManager_setLastRollRate($player, 1);
        for ($i = 0; $i < $rate; $i++){
            // 根据类型发奖
            if ( $config->$trigger->type == $rollType['TYPE1'] ){
                // 钻石
                $goodsType = getSysConfig('GOODS_TYPE');
                $itemIds = getSysConfig('ITEM_ID');
                roleManager_addGoods($player, $itemIds['DIAMOND'],$goodsType['DIAMOND'], $val, $rewardList);
            }elseif($config->$trigger->type == $rollType['TYPE2']){
                // 计算这个时间的收益值
                roleManager_calculatePetEarningsByTime($player, $val, $rewardList);
            }elseif($config->$trigger->type == $rollType['TYPE3']){
                roleManager_setLastRollRate($player, $val);
            }
        }
        return $rate;
    }

    // 扣除门票
    function roleManager_deductRollTicket( $player, $trigger ){
        $config = configManager_getConfigs('roll');
        $ticketVal = $config->$trigger->ticket;
        // 扣除门票
        $player->roll->ticket -= $ticketVal;
        if ($player->roll->ticket < 0 ) {
            $player->roll->ticket = 0;
        }
        playerDataSync_generalUpdate($player, 'roll', "ticket" );
    }

	// 更新使用转盘的时间
	function roleManager_updateLastRollTime( $player ){
		$player->roll->lastTime = time();
		playerDataSync_generalUpdate($player, "roll", "lastTime" );
	}

	// 获取使用转盘的时间
	function roleManager_getLastRollTime( $player ){
		return $player->roll->lastTime;
	}

    // 设置下次转盘倍率
    function roleManager_setLastRollRate( $player, $rate ){
        $player->roll->addJiaBei = $rate;
        playerDataSync_generalUpdate($player, 'roll', "addJiaBei" );
    }

    // 设置上一次转盘的抽奖奖励
    function roleManager_setLastRollTrigger( $player, $trigger ){
        $player->roll->lastTrigger = $trigger;
        playerDataSync_generalUpdate($player, 'roll', "lastTrigger" );
    }

    // 设置上一次转盘的抽奖奖励
    function roleManager_getLastRollTrigger( $player ){
        return $player->roll->lastTrigger;
    }

    // 运行领取上次转盘的奖励
    function roleManager_allowLastRoll( $player ){
        $trigger = roleManager_getLastRollTrigger($player);
        if ( $trigger > 0 ){
            return true;
        }else{
            return false;
        }

    }

    // 根据类型处理每日任务
    // 当处理的是PET_COMPOUND_RECORD类型时，需要设置data['level']
    function roleManager_disposeDailyTaskByType( $player, $type, $data ){
        $dailyType = getSysConfig('DAILY_TASK_TYPE');
        $dailyTask = $player->dailyTask;
		if ( empty($data['val'])){
			$data['val'] = 1;
		}
        if ($type == $dailyType['COMPOUND_NUMBER'] ||
			$type == $dailyType['LOGIN_NUMBER'] ||
			$type == $dailyType['WATCH_AD_NUMBER'] ||
			$type == $dailyType['ROTARY_NUMBER'] ||
			$type == $dailyType['SPEED_NUMBER']
			){
			if ( empty($dailyTask->$type) ){
				$dailyTask->$type = (int)$data['val'];
			}else{
				$dailyTask->$type += $data['val'];
			}
		}else if ($type == $dailyType['PET_COMPOUND_RECORD'] ){
        	$level = $data['level'];
			if ( empty($dailyTask->$type) ){
				$dailyTask->$type = new stdClass();
			}
			if (empty($dailyTask->$type->$level)){
				$dailyTask->$type->$level = (int)$data['val'];
			}else{
				$dailyTask->$type->$level += $data['val'];
			}
		}
        roleManager_checkADailyTask($player, $type);
        playerDataSync_generalUpdate($player, 'dailyTask', $type );
    }

    // 效验每日任务是否达到完成的条件
    function roleManager_checkDailyTaskComplete( $player, $id ){

        //     获得配置表数据
        $taskConfigs =  configManager_getConfigs('task');
        $taskConfig = $taskConfigs->$id;
        $type = $taskConfig->typ;

        $result = false;
        $dailyType = getSysConfig('DAILY_TASK_TYPE');
        $dailyTask = $player->dailyTask;
        if(empty($dailyTask->$type)){
            return $result;
        }
		if ($type == $dailyType['COMPOUND_NUMBER'] ||
			$type == $dailyType['LOGIN_NUMBER'] ||
			$type == $dailyType['WATCH_AD_NUMBER'] ||
			$type == $dailyType['ROTARY_NUMBER'] ||
			$type == $dailyType['SPEED_NUMBER']
		){
			if ( $dailyTask->$type >= $taskConfig->limit  ){
				$result = true;
			}
		}else if ($type == $dailyType['PET_COMPOUND_RECORD'] ){
			$level = $taskConfig->param->level;
			if (empty($dailyTask->$type->$level) || empty($taskConfig->limit)){
				return $result;
			}
			if ( $dailyTask->$type->$level >= $taskConfig->limit  ){
				$result = true;
			}
		}
		return $result;
    }

    // 根据类型处理成就
    // 当处理的是PET_COMPOUND_RECORD类型时，需要设置data['level']
    function roleManager_disposeAchievementByType( $player, $type, $data ){
        $achievementType = getSysConfig('ACHIEVEMENT_TYPE');
        $achievementTask = $player->achievement;
		if ( empty($data['val'])){
			$data['val'] = 1;
		}
		if ($type == $achievementType['COMPOUND_NUMBER'] ||
			$type == $achievementType['LOGIN_NUMBER'] ||
			$type == $achievementType['WATCH_AD_NUMBER'] ||
			$type == $achievementType['ROTARY_NUMBER'] ||
			$type == $achievementType['SPEED_NUMBER']
		){
			if ( empty($achievementTask->$type) ){
				$achievementTask->$type = (int)$data['val'];
			}else{
				$achievementTask->$type += $data['val'];
			}
		}else if($type == $achievementType['PET_COMPOUND_RECORD']){
			$level = $data['level'];
			if ( empty($achievementTask->$type) ){
				$achievementTask->$type = new stdClass();
			}
			if (empty($achievementTask->$type->$level)){
				$achievementTask->$type->$level = (int)$data['val'];
			}else{
				$achievementTask->$type->$level += $data['val'];
			}
		}
        roleManager_checkAchievement($player, $type);
        playerDataSync_generalUpdate($player, 'achievement', $type );
    }


    // 重复领取每日任务
    function roleManager_repeatGetDailyTask( $player, $id ){
        $dailyTaskRecord = $player->dailyTaskRecord;
		if (empty($dailyTaskRecord->$id)){
			return true;
		}
        $state = getSysConfig('ACHIEVEMENT_STATE');
        if ( $dailyTaskRecord->$id->state == $state['ALL_OVER'] ){
            return true;
        }
        return false;
    }

    // 设置每日任务领取记录
    function roleManager_setDailyTaskRecord( $player, $id ){
        $dailyTaskRecord = $player->dailyTaskRecord;
        $state = getSysConfig('ACHIEVEMENT_STATE');
        $dailyTaskRecord->$id->state = $state['ALL_OVER'];
        playerDataSync_generalUpdate($player, 'dailyTaskRecord', $id);
    }

    // 领取每日任务的奖励
    function roleManager_getDailyTaskReward( $player, $id, $awardBase, &$rewardList){
        //     获得配置表数据
        $taskConfigs =  configManager_getConfigs('task');
        $itemConfigs =  configManager_getConfigs('item');
        $taskConfig = $taskConfigs->$id;
        $reward = $taskConfig->reward;
		$goodsType = getSysConfig('GOODS_TYPE');
        $dailyTaskAwardType = getSysConfig('DAILY_TASK_AWARD_TYPE');
		// 判断奖励类型
		if ( $taskConfig->rewardTyp == $dailyTaskAwardType['STANDARD'] ){
            // 基准类型
            foreach( $reward as $key => $val  ){
                $itemConfig = $itemConfigs->$key;
                if ( empty($itemConfig) ){
                    continue;
                };
                $realNum = 0;
                if ( $goodsType['MONEY'] == $itemConfig->typ ){
                    $realNum = round($awardBase['money'] * $val, 0);
					roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $realNum, $rewardList);
                }else{
                	// 暂时不做处理
					getLog()->error("working config is error id : " . $id );
				}
            }

        }else if ($taskConfig->rewardTyp == $dailyTaskAwardType['NUMERICAL']){
            foreach( $reward as $key => $val  ){
                $itemConfig = $itemConfigs->$key;
                if ( empty($itemConfig) ){
                    continue;
                }
                roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $val, $rewardList);

            }
        }
    }

    // 每日任务日重置
    function roleManager_DailyTaskDayReset( $player, $sync ){
        $player->dailyTask = new stdClass(); // 每日任务
        $player->dailyTaskRecord = new stdClass(); // 每日任务完成的进度
        // 重新初始化每日任务
        roleManager_loginDisposeDailyTask($player);
        if ($sync){
            playerDataSync_generalUpdate($player, 'dailyTask');
            playerDataSync_generalUpdate($player, 'dailyTaskRecord');
        }
    }

    // 登录处理成就数据
    function roleManager_loginDisposeAchievement( $player ){
        $achievementRecord = $player->achievementRecord;
        $achieveConfigs =  configManager_getConfigs('achieve');
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        foreach ( $achieveConfigs as $key => $val ){
            $config = $achieveConfigs->$key;
            if ( $config->sor != 1 ){
                continue;
            }
            $type = $config->typ;
            if( empty($achievementRecord->$type) ){
                // 如果是空，则进行初始化
                $achievementRecord->$type= new stdClass();
                $achievementRecord->$type->id = $key;
                $achievementRecord->$type->state = $achievementState['UNDER_WAY'];
            }else{
                // 非空，则效验是否需要更新
                if ($achievementRecord->$type->state != $achievementState['ALL_OVER']){
                    continue;
                }
                // 该系列任务是全部完成的，则效验是否需要更新
                $endId = $achievementRecord->$type->id;
                $endIdConfig = $achieveConfigs->$endId;
                if( empty($endIdConfig->next) ){
                    //endIdConfig->next还是等于0，则无需更新
                    continue;
                }
                $nextId = $endIdConfig->next;
                $nextConfig = $achieveConfigs->$nextId;
                if( $nextConfig->typ != $endIdConfig->typ ){
                    // 类型不相同，直接continue，防止配置表配置失误
                    continue;
                }
                $achievementRecord->$type->id = $nextId;
                $achievementRecord->$type->state = $achievementState['UNDER_WAY'];
            }
        }
    }

    // 重复完成成就
    function roleManager_repeatCompleteAchievement( $player, $id ){
        $achievementRecord = $player->achievementRecord;
        $achieveConfigs =  configManager_getConfigs('achieve');
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        $achieveConfig =  $achieveConfigs->$id;
        $type = $achieveConfig->typ;
        if (empty($achievementRecord->$type)){
            return false;
        }
        if ($achievementRecord->$type->id != $id ){
            return false;
        }

        if ($achievementRecord->$type->state != $achievementState['COMPLETE'] ){
            return false;
        }
        return true;
    }

    // 效验成就是否达到完成的要求 true 达到领取要求
    function roleManager_achievementCompleteAsk( $player, $id ){
        $achieveConfigs =  configManager_getConfigs('achieve');
        $achieveConfig =  $achieveConfigs->$id;
        $achievement = $player->achievement;
        $type = $achieveConfig->typ;
        $result= false;
        if(empty($achievement->$type)){
            return $result;
        }
        $achievementType = getSysConfig('ACHIEVEMENT_TYPE');
		if ($type == $achievementType['COMPOUND_NUMBER'] ||
			$type == $achievementType['LOGIN_NUMBER'] ||
			$type == $achievementType['WATCH_AD_NUMBER'] ||
			$type == $achievementType['ROTARY_NUMBER'] ||
			$type == $achievementType['SPEED_NUMBER']){
			if ( $achievement->$type >= $achieveConfig->limit  ){
				$result = true;
			}
		}else if ($type == $achievementType['PET_COMPOUND_RECORD']){
			$level = $achieveConfig->param->level;
			if (empty($achievement->$type->$level) || empty($achieveConfig->limit)){
				return $result;
			}
			if ( $achievement->$type->$level >= $achieveConfig->limit  ){
				$result = true;
			}
		}
		return $result;
    }

    // 设置成就记录
    function roleManager_setAchievementRecord( $player, $id ){
        $achievementRecord = $player->achievementRecord;
        $achieveConfigs =  configManager_getConfigs('achieve');
        $achieveConfig =  $achieveConfigs->$id;
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        $type = $achieveConfig->typ;
        if ( empty($achieveConfig->next)){
            $achievementRecord->$type->state = $achievementState['ALL_OVER'];
        }else{
            $achievementRecord->$type->id = $achieveConfig->next;
            $achievementRecord->$type->state = $achievementState['UNDER_WAY'];
        }
        roleManager_checkAchievement($player, $type);
        playerDataSync_generalUpdate($player, 'achievementRecord', $type);
    }

    // 领取成就奖励
    function roleManager_getAchievementReward( $player, $id , $connObj, &$rewardList){
        $achieveConfigs =  configManager_getConfigs('achieve');
        $achieveConfig =  $achieveConfigs->$id;
        $itemConfigs =  configManager_getConfigs('item');
        $reward = $achieveConfig->reward;
		$goodsType = getSysConfig('GOODS_TYPE');
        foreach( $reward as $key => $val  ){
            $itemConfig = $itemConfigs->$key;
            if ( empty($itemConfig) ){
                continue;
            }
            roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $val, $rewardList);
        }
    }

    // 登录处理每日任务数据
    function roleManager_loginDisposeDailyTask( $player ){
        //     获得配置表数据
        $taskConfigs =  configManager_getConfigs('task');
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        if (empty($taskConfigs)){
            return;
        }
        $dailyTaskRecord = $player->dailyTaskRecord;
        foreach( $taskConfigs as $key => $val ){
            if (isset($dailyTaskRecord->$key)){
                continue;
            }
            $dailyTaskRecord->$key = new stdClass();
            $dailyTaskRecord->$key->id = $key;
            $dailyTaskRecord->$key->type = $val->typ;
            $dailyTaskRecord->$key->state = $achievementState['UNDER_WAY'];
        }
    }

    // 检测成就
    function roleManager_checkAchievement( $player, $type ){
        $achievementRecord = $player->achievementRecord;
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        if (empty($achievementRecord->$type)){
            return ;
        }
        if ($achievementRecord->$type->state != $achievementState['UNDER_WAY']){
            return ;
        }
        $curId = $achievementRecord->$type->id;
        if(roleManager_achievementCompleteAsk($player, $curId)){
            // 表示当前成就可以领取
            $achievementRecord->$type->state = $achievementState['COMPLETE'];
            playerDataSync_generalUpdate($player, 'achievementRecord', $type);
        }
    }

    // 检测每日任务
    function roleManager_checkADailyTask( $player, $type ){
        $dailyTaskRecord = $player->dailyTaskRecord;
        $achievementState = getSysConfig('ACHIEVEMENT_STATE');
        foreach ( $dailyTaskRecord as $key => $val  ){
            if ( $val->type != $type ){
                continue;
            }
            if ( $val->state != $achievementState['UNDER_WAY']  ){
                continue;
            }
            if(roleManager_checkDailyTaskComplete($player, $val->id)){
                $val->state = $achievementState['COMPLETE'];
				playerDataSync_generalUpdate($player, 'dailyTaskRecord', $val->id);
            };
        }
    }

    // 根据时间计算收益
    function roleManager_calculatePetEarningsByTime( $player, $time, &$rewardList ){
        $earnings = roleManager_countEarning($player, $time);
        if($earnings > 0){
            $goodsType = getSysConfig('GOODS_TYPE');
            $itemIds = getSysConfig('ITEM_ID');
            roleManager_addGoods($player, $itemIds['MONEY'],$goodsType['MONEY'], $earnings, $rewardList);
        }
        return $earnings;
    }

    // 设置收益加速
    function roleManager_setEarningsSpeed( $player, $id ){
        $speed = $player->speed;
        if ( isset($speed->mark )){
            return ;
        }
        $speedConfigs =  configManager_getConfigs('speed');
        $speedConfig = $speedConfigs->$id;
        $speed->mark = true;
        $speed->endTime = time()+$speedConfig->time;
        $speed->surplusTime = $speedConfig->time;
        $speed->rate = $speedConfig->rate;
        if (empty($speed->limit->$id)){
            $speed->limit->$id = 0;
        }
        $speed->limit->$id++;

        // 扣除加速的消耗
        $expend = $speedConfig->expend;
        $itemConfigs =  configManager_getConfigs('item');
        foreach ( $expend as $key => $val ){
            $itemConfig = $itemConfigs->$key;
            if ( empty($itemConfig) ){
                continue;
            }
            roleManager_expendGoods($player, $itemConfig->id, $itemConfig->typ, $val);
        }
        playerDataSync_generalUpdate($player, 'speed');
    }

    // 计算加速收益
    function roleManager_calculateSpeedEarnings( $player ){
        $ret = 0;
        $speed = $player->speed;
        if ( !$speed->mark ){
            return $ret;
        }
        $endTime = $speed->endTime;
        $rate = $speed->rate;
        $curTime = time();
        $time = 0;
        if ($curTime >= $endTime ){
            $time = $speed->surplusTime;

            $speed->surplusTime = 0;
            $speed->endTime = 0;
            $speed->mark = false;
            $speed->rate = 0;
        }else{
            $temp = $endTime - $curTime;
            $time = $speed->surplusTime - $temp;

            $speed->surplusTime = $temp;
        }
        $param = ($time*$rate);
        // 计算收益
        $ret = roleManager_calculatePetEarningsByTime($player, $param, $rewardList );
        return $ret;
    }

    // 允许加速
    function roleManager_allowSpeed( $player ){
        if( isset($player->speed->mark) ){
            return false;
        }
        return true;
    }

    // 加速次数达到上限
    function roleManager_speedLimit( $player, $id ){
        if( empty($player->speed->limit->$id) ){
            return false;
        }
        $speedConfigs =  configManager_getConfigs('speed');
        $speedConfig = $speedConfigs->$id;
        $limit = $speedConfig->limit;
        if( $player->speed->limit->$id >= $limit ){
            return true;
        }

        return false;
    }


// 加速数据日重置
function roleManager_speedDayReset( $player, $sync ){
    $speed = $player->speed;
    $speed->limit = new stdClass();
    if ($sync){
        playerDataSync_generalUpdate($player, 'speed');
    }
}

// 关卡控制
function roleManager_rankControl( $player, $rank ){
    $player->rank = $rank;
    playerDataSync_generalUpdate($player, 'rank' );
}

// 设置最大段位值,并且返回设置的最大值
function roleManager_setMaxRank( $player, $rank ){
    if ( $player->maxRank < $rank){
        $player->maxRank = $rank;
        playerDataSync_generalUpdate($player, 'maxRank' );
        return $player->maxRank;
    }
    return 0;
}

function roleManager_getMoneyBoxExpend( $player ){
    $rank = $player->rank;
    $configs = configManager_getConfigs('title');
    $config = $configs->$rank;
    return $config->bankUse;
}

// 更新存钱罐,返回实际增加的金钱
function roleManager_updateMoneyBox( $player, $val ){
    if (empty($player->moneyBox)){
        $player->moneyBox = 0;
    }
    $player->moneyBox += $val;
    $rank = $player->rank;
    $configs = configManager_getConfigs('title');
    $config = $configs->$rank;
    $maxMoney = $config->bankExp;
    $difference = $val;
    if ($player->moneyBox > $maxMoney){
        $temp = $player->moneyBox - $maxMoney;
        $difference = $val - $temp;
        $player->moneyBox = $maxMoney;
    }
    playerDataSync_generalUpdate($player, 'moneyBox' );
    return $difference;
}

// 获取存钱罐的值
function roleManager_getMoneyBox( $player ){
    return $player->moneyBox;
}

// 清空存钱罐
function roleManager_clearMoneyBox( $player ){
    $player->moneyBox = 0;
    playerDataSync_generalUpdate($player, 'moneyBox' );
}

// 根据称号发放通关奖励
function roleManager_grantUpAward( $player, $rank, $multi, &$rewardList ){
    $configs = configManager_getConfigs('title');
    $itemConfigs =  configManager_getConfigs('item');
    $config = $configs->$rank;
    $award = $config->upReward;
    foreach( $award as $key => $val  ){
        $itemConfig = $itemConfigs->$key;
        if ( empty($itemConfig) ){
            continue;
        }
        $num = (int)$val*$multi;
        roleManager_addGoods($player, $key, $itemConfig->typ, $num, $rewardList);
    }
}

// 设置段位提升领取标志
function roleManager_setUpAwardSign( $player, $val ){
    $player->upAwardSign = $val;
    playerDataSync_generalUpdate($player, 'upAwardSign' );
}


// 获取段位提升领取标志
function roleManager_getUpAwardSign( $player ){
        return $player->upAwardSign;
}

// 运行领取多倍升级奖励
function roleManager_allowMultiUpAward( $player ){
    $trigger = roleManager_getUpAwardSign($player);
    if ( $trigger > 0 ){
        return true;
    }else{
        return false;
    }
}

// 设置工作数据
function roleManager_setWorkData( $player, $id ){
    $player->work->id = $id;
    $player->work->startTime = time();
    playerDataSync_generalUpdate($player, 'work' );
}

// 工作是有效
function roleManager_workValid( $player, $id ){
    $configs = configManager_getConfigs('working');
    if ( $configs && $configs->$id ){
        return true;
    }else{
        return false;
    }
}

// 工作没有开始
function roleManager_workNotStart( $player ){
    $id = $player->work->id;
    if ( $id ){
        return false;
    }
    return true;
}

// 工作完成
function roleManager_workAchieve( $player ){
    $configs = configManager_getConfigs('working');
    $id = $player->work->id;
    $config = $configs->$id;
    $startTime = $player->work->startTime;
    $curTime = time();
    if ( $startTime + $config->time  <=  $curTime){
        return true;
    }
    return false;
}

// 领取工作奖励
function roleManager_getWorkReward( $player, $awardBase, &$rewardList){
    $workConfigs = configManager_getConfigs('working');
    $id = $player->work->id;
    $workConfig = $workConfigs->$id;
    $reward = $workConfig->reward;
    $goodsType = getSysConfig('GOODS_TYPE');
    $dailyTaskAwardType = getSysConfig('DAILY_TASK_AWARD_TYPE');
    $itemConfigs =  configManager_getConfigs('item');
    // 判断奖励类型
    if ( $workConfig->rewardTyp == $dailyTaskAwardType['STANDARD'] ){
        // 基准类型
        foreach( $reward as $key => $val  ){
            $itemConfig = $itemConfigs->$key;
            if ( empty($itemConfig) ){
                continue;
            }
            $realNum = 0;
            if ( $goodsType['MONEY'] == $itemConfig->typ ){
                $realNum = round($awardBase['money'] * $val, 0);
                // --TODO 这里现在只处理金币，其余的类型均丢弃
				roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $realNum, $rewardList);
            }else {
				// --暂时不做处理
				getLog()->error("working config is error id : " . $id );
            }
        }

    }else if ($workConfig->rewardTyp == $dailyTaskAwardType['NUMERICAL']){
        foreach( $reward as $key => $val  ){
            $itemConfig = $itemConfigs->$key;
            if ( empty($itemConfig) ){
                continue;
            }
            roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $val, $rewardList);
        }
    }
}

// 清理工作数据
function roleManager_clearWorkData( $player ){
    $player->work->id = 0;
    $player->work->startTime = 0;
    playerDataSync_generalUpdate($player, 'work' );
}

// 增加广告次数
function roleManager_addRecordNumOfAD( $player, $val ){
    $player->hongbao->ADNum += $val;

    playerDataSync_generalUpdate($player, 'hongbao', 'ADNum' );
}

// 增加免费领取钻石的次数
function roleManager_addFreeDiamondNum( $player, $val ){
    $player->freeDiamondNum += $val;
    playerDataSync_generalUpdate($player, 'freeDiamondNum' );
}

// 免费钻石的次数日重置
function roleManager_freeDiamondNumDayReset( $player, $sync ){
    $player->freeDiamondNum = 0;
    if ($sync){
        playerDataSync_generalUpdate($player, 'freeDiamondNum' );
    }
}

// 免费钻石次数已满
function roleManager_freeDiamondNumFull( $player ){
    $maxNum = configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('FREE_DIAMOND_MAX_NUM'))->value;
    return $player->freeDiamondNum >= $maxNum;
}

// 免费钻石奖励
function roleManager_freeDiamondNumReward( $player, $id, &$rewardList ){
    $configs = configManager_getConfigs('freeZS');
    $itemConfigs =  configManager_getConfigs('item');
    $config = $configs->$id;
    $award = $config->reward;
    foreach( $award as $key => $val  ){
        $itemConfig = $itemConfigs->$key;
        if ( empty($itemConfig) ){
            continue;
        }
        roleManager_addGoods($player, $key, $itemConfig->typ, $val, $rewardList);
    }
}

// 红包结算(每日第一次登录进行一次)
function roleManager_hongbaoSettle( $player ){
	$tempList = [];
	$curTime = time();
    if ( $player->hongbao->time > $curTime ){
		// 已经结算了
//		getLog()->debug("已经结算了");
    	return ;
    }
    // 失效标记
	// -TODO 2020 05 20 版本修改，一旦当任务激活后直接失效, $failureMark = false 改成 true
	$failureMark = true;

    // 间隔时间超过一天
    if ( $curTime - $player->hongbao->time >= 86400 ){
//		getLog()->debug("间隔时间超过一天");
		$failureMark = true;
	}

	// 红包转换为余额
    if ( $player->hongbao->val > 0 ){
		$hongbaoToBalance = (int)configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('HONGBAO_TO_BALANCE'))->value;
//		getLog()->error($player->hongbao->val);
//		getLog()->error($hongbaoToBalance);
		$tempVal = floor(($player->hongbao->val / $hongbaoToBalance)*10000 );
		$val  =   $tempVal / 10000;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		// 增加余额
		roleManager_addGoods($player, $itemIds['BALANCE'],$goodsType['BALANCE'], $val, $tempList);
		// 清空红包
		roleManager_expendGoods($player, $itemIds['HONGBAO'],$goodsType['HONGBAO'], $player->hongbao->val);
	}
	$state = getSysConfig('HONGBAO_STATE');
    // 激活余额提现
	$hongbaoRecord = $player->hongbao->record;
	$configs = configManager_getConfigs('hongbao');
	foreach ( $hongbaoRecord as $id => $data  ){
		$config =  $configs->$id;
		$openLimit = $config->openLimit;
		getLog()->error($config);
		getLog()->error($openLimit);
		if ( $data->state != $state['AWAIT_ACTIVE'] ){
			continue;
		}
		if ( $player->hongbao->ADNum >= $openLimit ){
			roleManager_setHongbaoActive($player, $id);
			// 已经隔了一天，直接失效
			if ( $failureMark ){
				roleManager_setHongbaoFailure($player, $id);
			}

		}
	}
	// 更新红包结算时间
	$player->hongbao->time= strtotime(date("Y-m-d 23:59:59"));
	playerDataSync_generalUpdate($player, 'hongbao', 'time' );
}

// 矫正红包化档位记录
function roleManager_adjustHongBaoRecord( $player ){
	$configs = configManager_getConfigs('hongbao');
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	foreach ( $configs as $id => $data  ){
		if ( empty($hongbaoRecord->$id) ){
			$hongbaoRecord->$id = new stdClass();
			$hongbaoRecord->$id->state = $state["AWAIT_ACTIVE"]; // 状态
			$hongbaoRecord->$id->activeTime = 0; 				 // 激活的时间
		}
	}
}

// 纠正用户绑定的openId
function roleManager_adjustUserOpenId($player, $openId){
	$player->openId = $openId;
}

// 设置红包档位激活
function roleManager_setHongbaoActive( $player, $id ){
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	$hongbaoRecord->$id->state = $state["ACTIVE"];
	$hongbaoRecord->$id->activeTime = $player->hongbao->time+1 ;
	playerDataSync_generalUpdate($player, 'hongbao', 'record' );
}

// 设置红包档位失效
function roleManager_setHongbaoFailure( $player, $id ){
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	$hongbaoRecord->$id->state = $state["FAILURE"];
	playerDataSync_generalUpdate($player, 'hongbao', 'record' );
}

// 设置红包档位失效
function roleManager_setHongbaoComplete( $player, $id ){
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	$hongbaoRecord->$id->state = $state["SUCC_DRAW"];
	playerDataSync_generalUpdate($player, 'hongbao', 'record' );
}

// 红包失效
function roleManager_hongbaoIsFailure( $player, $id ){
	$configs = configManager_getConfigs('hongbao');
	$config = $configs->$id;
	$activeTime = $config->time;
	$hongbaoRecord = $player->hongbao->record;
	$time = time();
	$continueTime = $time -  $hongbaoRecord->$id->activeTime;
	if ( $continueTime > $activeTime  ){
		return true;
	}
	return false;
}

// 失效检查
function roleManager_hongbaoFailureInspect( $player ){
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	foreach ( $hongbaoRecord as $id => $data  ){
		if ( $data->state != $state['ACTIVE'] ){
			continue;
		}
		if (roleManager_hongbaoIsFailure($player, $id)){
			roleManager_setHongbaoFailure($player, $id);
		}
	}
}

// 根据id获取红包数据
function roleManager_getHongbaoDataById( $player, $id ){
	$hongbaoRecord = $player->hongbao->record;
	return  $hongbaoRecord->$id;
}

// 该红包档位是否激活
function roleManager_hongbaoIsActive( $player, $goodsId ){
	$hongbaoRecord = $player->hongbao->record;
	$data = $hongbaoRecord->$goodsId;
	$state = getSysConfig('HONGBAO_STATE');
	if ( $data->state != $state['ACTIVE'] ){
		return false;
	}
	return true;
}

// 设置上一次的离线收益
function roleManager_setLastOffEarnings( $player, $val ){
	$player->lastOffEarnings = $val;
	playerDataSync_generalUpdate($player, 'lastOffEarnings' );
}

// 获取上一次的离线收益
function roleManager_getLastOffEarnings( $player ){
	return $player->lastOffEarnings;
}

// 清空上一次的离线收益
function roleManager_clearLastOffEarnings( $player ){
	$player->lastOffEarnings = 0;
	playerDataSync_generalUpdate($player, 'lastOffEarnings' );
}

// 更新强制引导步数
function roleManager_updateGuide( $player, $guide ){
	$player->guide = $guide;
	playerDataSync_generalUpdate($player, 'guide' );
}

// 增加免费金币的次数
function roleManager_addFreeMoneyNum( $player ){
    $player->freeMoneyNum++;
	playerDataSync_generalUpdate($player, 'freeMoneyNum' );
	return $player->freeMoneyNum;
}
// 获取免费金币的次数
function roleManager_getFreeMoneyNum( $player ){
	return $player->freeMoneyNum;
}

// 是否超过最大次数限制
function roleManager_freeMoneyNumOverOnLimit( $player ){
	$configs = configManager_getConfigs('freeSun');
	if ( empty($configs) ){
		return true;
	}
	$maxNum = 0;
	foreach ($configs as $k => $v){
		$maxNum++;
	}
	$curNum = roleManager_getFreeMoneyNum($player);
	if ( $curNum >= $maxNum ){
		return true;
	}
	return false;
}

// 免费领取阳光在冷却
function roleManager_freeMoneyNumIsCooling( $player, $id ){
	$configs = configManager_getConfigs('freeSun');
	if ( empty($configs) ){
		return true;
	}
	$config = $configs->$id;
	if (empty($config)){
		return true;
	}
	$interval = $config->gapTime;
	if ( empty($interval) ){
		$interval = 0;
	}
	$curTime = time();
	// 上次领取的时间
	$lastTime = roleManager_getFreeMoneyTime($player);
	if ( $lastTime + $interval >= $curTime ) {
		return true;
	}
	return false;
}

// 日重置免费金币次数
function roleManager_freeMoneyNumDayReset( $player, $sync ){
	$player->freeMoneyNum = 0;
	if ($sync){
		playerDataSync_generalUpdate($player, 'freeMoneyNum' );
	}
}


// 设置免费金币的上次的时间
function roleManager_setFreeMoneyTime( $player ){
	$player->freeMoneyLastTime = time();
	playerDataSync_generalUpdate($player, 'freeMoneyLastTime' );
}

// 获取免费金币的上次的时间
function roleManager_getFreeMoneyTime( $player ){
	return $player->freeMoneyLastTime;
}

// 免费阳光奖励派发
function roleManager_freeMoneyReward( $player, $id, $awardBase, &$rewardList ){
	$configs = configManager_getConfigs('freeSun');
	$itemConfigs =  configManager_getConfigs('item');
	$goodsType = getSysConfig('GOODS_TYPE');
	$config = $configs->$id;
	$reward = $config->reward;
	$dailyTaskAwardType = getSysConfig('DAILY_TASK_AWARD_TYPE');
	$result = 0;
	// 判断奖励类型
	if ( $config->rewardTyp == $dailyTaskAwardType['STANDARD'] ){
		foreach ( $reward as $k => $v ) {
			$itemConfig = $itemConfigs->$k;
			if ( empty($itemConfig) ){
				continue;
			};
			if ( $goodsType['MONEY'] == $itemConfig->typ ){
				$realNum = round($awardBase['money'] * $v, 0);
				roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $realNum, $rewardList);
				$result += $realNum;
			}else{
				// 暂时不做处理
				getLog()->error("working config is error id : " . $id );
			}
		}
	}else if ($config->rewardTyp == $dailyTaskAwardType['NUMERICAL']){
		foreach( $reward as $key => $val  ){
			$itemConfig = $itemConfigs->$key;
			if ( empty($itemConfig) ){
				continue;
			}
			roleManager_addGoods($player, $itemConfig->id, $itemConfig->typ, $val, $rewardList);
		}
	}
	return $result;
}

// 数据修复
function roleManager_dataRepair($player){
	//	20200515修复 未激活的红包档位失效的BUG
	roleManager_repairHongBaoFailure($player);
}

//	20200515修复 未激活的红包档位失效的BUG
function roleManager_repairHongBaoFailure ($player){
	$hongbaoRecord = $player->hongbao->record;
	$state = getSysConfig('HONGBAO_STATE');
	foreach ( $hongbaoRecord as $k => $v ){
		if (empty($v->activeTime) && $v->state == $state["FAILURE"]){
			$v->state = $state["AWAIT_ACTIVE"];
		}
	}
}

//	设置升级奖励的红包值次数
function roleManager_addUpLevelHbTime($player, $val){
	$player->hongbao->upLevelHbTime += $val;
	playerDataSync_generalUpdate($player, 'hongbao', "upLevelHbTime" );
}

//	获取升级奖励的红包值次数
function roleManager_getUpLevelHbTime($player){
	return $player->hongbao->upLevelHbTime;
}

// 日重置升级奖励的红包值次数
function roleManager_upLevelHbTimeDayReset( $player, $sync ){
	$player->hongbao->upLevelHbTime = 0;
	if ($sync){
		playerDataSync_generalUpdate($player, 'hongbao', 'upLevelHbTime' );
	}
}

//	增加广告宝箱红包奖励次数
function roleManager_addAdBoxHbTime($player, $val){
	$player->hongbao->adBoxHbTime += $val;
	playerDataSync_generalUpdate($player, 'hongbao', "adBoxHbTime" );
}

//	获取广告宝箱红包奖励次数
function roleManager_getAdBoxHbTime($player){
	return $player->hongbao->adBoxHbTime;
}

// 日重置广告宝箱红包奖励的次数
function roleManager_adBoxHbTimeTimeDayReset( $player, $sync ){
	$player->hongbao->adBoxHbTime = 0;
	if ($sync){
		playerDataSync_generalUpdate($player, 'hongbao', 'adBoxHbTime' );
	}
}

//	设置离线红包奖励的红包缓存值
function roleManager_setOffHb($player, $val){
	$player->hongbao->offHb = $val;
	playerDataSync_generalUpdate($player, 'hongbao', "offHb" );
}

//	获取离线红包奖励的红包缓存值
function roleManager_getOffHb($player){
	return $player->hongbao->offHb;
}


//	设置广告奖励的红包值缓存值
function roleManager_setAdBoxHb($player, $val){
	$player->hongbao->adBoxHb = $val;
	playerDataSync_generalUpdate($player, 'hongbao', "adBoxHb" );
}

//	获取广告奖励的红包值缓存值
function roleManager_getAdBoxHb($player){
	return $player->hongbao->adBoxHb;
}

//	设置升级奖励的红包值
function roleManager_setUpLevelHb($player, $val){
	$player->hongbao->upLevelHb = $val;
	playerDataSync_generalUpdate($player, 'hongbao', "upLevelHb" );
}

//	获取升级奖励的红包值
function roleManager_getUpLevelHb($player){
	return $player->hongbao->upLevelHb;
}

//	更新新用户的红包表示
function roleManager_updateNewUserHb($player, $val){
	$player->hongbao->newUserHb = $val;
	playerDataSync_generalUpdate($player, 'hongbao', "newUserHb" );
}

function roleManager_getNewUserHb($player){
	return $player->hongbao->newUserHb ;
}

//	获取红包参数检测
function roleManager_getHongbaoParamsCheck($player, $handler, $param){
	$handlerType = getSysConfig('GET_HONGBAO_HANDLER');
	if ( $handlerType['UNLOCK_PET'] == $handler ) {
		if( empty($player->hongbao->lastUnlockMaxPet) ){
			return false;
		}
	}elseif ($handlerType['UP_LEVEL'] == $handler ){
		if( empty(roleManager_getUpLevelHb($player)) ){
			return false;
		}
	}elseif ($handlerType['AD_BOX'] == $handler ){
		if( empty(roleManager_getAdBoxHb($player)) ){
			return false;
		}
	}elseif ($handlerType['NEW_USER_HB'] == $handler ){
		if( roleManager_getNewUserHb($player) >= 0 ){
			return false;
		}
	}elseif ($handlerType['OFF_HB'] == $handler ){
		if( empty(roleManager_getOffHb($player)) ){
			return false;
		}
	}
	return true;
}

//	获取红包处理
function roleManager_getHongbaoDispose($player, $handler, $param, $multi, &$rewardList){
	$handlerType = getSysConfig('GET_HONGBAO_HANDLER');
	if ( $handlerType['UNLOCK_PET'] == $handler ) {
		// 解锁宠物
		$level = $player->hongbao->lastUnlockMaxPet;
		$player->hongbao->lastUnlockMaxPet = 0;
		$configs = configManager_getConfigs('petCombineReward');
		$config = $configs->$level;
		$hb = (int)$config->hb*$multi;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		roleManager_addGoods($player, $itemIds['HONGBAO'], $goodsType['HONGBAO'], $hb, $rewardList);
	}elseif ($handlerType['UP_LEVEL'] == $handler){
		// 升级宠物
		$hb = roleManager_getUpLevelHb($player);
		$addHb = $hb*$multi;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		roleManager_addGoods($player, $itemIds['HONGBAO'], $goodsType['HONGBAO'], $addHb, $rewardList);	// 增加领取次数
		// 增加次数
		roleManager_addUpLevelHbTime($player, 1);
		roleManager_setUpLevelHb($player,0);
	}elseif ($handlerType['AD_BOX'] == $handler){
		// 广告宝箱
		$hb = roleManager_getAdBoxHb($player);
		$addHb = $hb*$multi;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		roleManager_addGoods($player, $itemIds['HONGBAO'], $goodsType['HONGBAO'], $addHb, $rewardList);
		roleManager_setAdBoxHb($player,0);
	}elseif ($handlerType['NEW_USER_HB'] == $handler){
		// 新用户红包 直接：增加余额
		$hb = configManager_getConfig('defingcfg',configManager_getSysMacro('NEW_USER_HONGBAO_VALUE') )->value;
		$hongbaoToBalance = (int)configManager_getConfig( 'defingcfg' ,configManager_getSysMacro('HONGBAO_TO_BALANCE'))->value;
		$tempVal = floor(($hb / $hongbaoToBalance)*10000 );
		$addBalance  =   $tempVal / 10000;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		// 增加余额
		roleManager_addGoods($player, $itemIds['BALANCE'],$goodsType['BALANCE'], $addBalance, $rewardList);
		roleManager_updateNewUserHb($player, 1);
	}elseif ($handlerType['OFF_HB'] == $handler){
		// 离线红包
		$hb = roleManager_getOffHb($player);
		$addHb = $hb*$multi;
		$goodsType = getSysConfig('GOODS_TYPE');
		$itemIds = getSysConfig('ITEM_ID');
		roleManager_addGoods($player, $itemIds['HONGBAO'], $goodsType['HONGBAO'], $addHb, $rewardList);
		roleManager_setOffHb($player, 0);
	}
}
