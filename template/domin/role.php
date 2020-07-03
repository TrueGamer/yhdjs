<?php

class Role
{
    var $info;
    // 定义构造函数
    function __construct($uid, $_openId, $name) {
        $curTime = time();
        $resetTime = configManager_getConfig('defingcfg',configManager_getSysMacro('DAY_RESET') )->value;
        $this->info = new stdClass();
		$this->info->name = $name;      // 玩家名字
        $this->info->uid = $uid; // 本地uid
        $this->info->openId = $_openId; // 第三方id
        $this->info->money = configManager_getConfig('defingcfg',configManager_getSysMacro('START_USER_MOMEY') )->value; // 金钱
        $this->info->diamond = 0;     // 充值币
        $this->info->level = 0;       // 玩家等级
        $this->info->rank = 1;        // 玩家段位
        $this->info->maxRank = 0;     // 玩家当前通过的最大段位
        $this->info->moneyBox  = 0;   // 存钱罐
        $this->info->freeDiamondNum  = 0; // 免费钻石的领取次数
		$this->info->freeMoneyNum  = 0;   // 免费金币的领取次数
		$this->info->freeMoneyLastTime  = 0;   // 免费金币上次领取的时间
        $this->info->upAwardSign  = -1;   // 段位提升奖励领取标志(用于多倍领取段位奖励)
		$this->info->lastOffEarnings  = 0;   // 上次的离线收益
        $this->info->nextResetTime = figureResetTime( $curTime,  $resetTime ); // 日重置时间
		$this->info->guide = 0; // 强制引导步数
        $this->info->createTime = $curTime; // 角色创建的时间
        $this->info->lastCommunicationTime = $curTime; // 上一次通信时间（最近一次通信时间）
        $this->info->version = 7 ; // 版本控制

        // 红包
        $this->info->hongbao = new stdClass();
        $this->info->hongbao->val = 0;                       // 红包值
        $this->info->hongbao->time = strtotime(date("Y-m-d 23:59:59"));  // 红包结算时间,记录的是当天的最后一秒,方便计算
        $this->info->hongbao->balance = 0;                   // 余额
        $this->info->hongbao->ADNum = 0;                     // 广告次数
        $this->info->hongbao->record = new stdClass();       // 档位记录

		$this->info->hongbao->lastUnlockMaxPet = 0;       // 上一次解锁的最大宠物等级

		$this->info->hongbao->upLevelHbTime = 0;       // 升级红包领取的次数
		$this->info->hongbao->upLevelHb = 0;       // 升级红包领取的数值
		$this->info->hongbao->adBoxHbTime = 0;       // 广告宝箱红包的领取次数
		$this->info->hongbao->adBoxHb = 0;       // 广告宝箱红包的缓存值
		$this->info->hongbao->offHb = 0;       // 离线红包缓存值
		$this->info->hongbao->newUserHb = -1;       // 新用户红包标识 -1为没有领取过新手红包, >0 领取过新手红包


        // 工作
        $this->info->work = new stdClass(); // 工作
        $this->info->work->id = 0; // 工作id
        $this->info->work->startTime = 0; // 工作开始时间

        // 收益加速
        $this->info->speed = new stdClass();
        $this->info->speed->mark = false;            // 是否加速标记
        $this->info->speed->endTime = 0;             // 加速结束时间
        $this->info->speed->surplusTime = 0;         // 加速结束时间
        $this->info->speed->rate = 0;                // 倍率
        $this->info->speed->limit = new stdClass();  // 加速限制

        // 每日任务和成就
        $this->info->dailyTask = new stdClass(); // 每日任务
        $this->info->dailyTaskRecord = new stdClass(); // 每日任务完成的进度
        $this->info->achievement = new stdClass(); // 成就
        $this->info->achievementRecord = new stdClass(); // 成就完成的进度

        // 宠物数据
        $this->info->pet  = new stdClass();
        $this->info->pet->list = [];   	   		// 地图宠物列表
		$this->info->pet->lastUp = new stdClass(); // 上次合成的数据
        $this->info->pet->maxLevel = 0;    		// 宠物最高等级
        $this->info->pet->maxLevelReward = 0;   // 当前允许领取的宠物最高等级合成奖励
        $this->info->pet->moneyBuyRecord = new stdClass(); // 金币购买宠物的记录
        $this->info->pet->diamondBuyRecord = new stdClass(); // 钻石购买宠物的记录
		$this->info->pet->qk = new stdClass(); //快速购买的数据
		$this->info->pet->killBoxRecord = 0; //击杀获得宝箱的记录数量
		$this->info->pet->boxOverflow = array();   // 宝箱溢出的列表

        // 签到数据
        $this->info->signIn = new stdClass();
        $this->info->signIn->lastTime = 0; // 上次签到时间
        $this->info->signIn->timer = 0; //次数

        // 转盘
        $this->info->roll = new stdClass();
        $this->info->roll->lastTime = 0; // 上次转转盘的时间
        $this->info->roll->ticket = configManager_getConfig('defingcfg',configManager_getSysMacro('EVERYDAY_ROLL_MAX_NUM') )->value;//票数
        $this->info->roll->addJiaBei = 1;// 多倍宝箱
        $this->info->roll->lastTrigger = 0;// 转盘上次的抽中目标

    }

    // 获取角色信息
    function get_roleInfo(){
        return $this->info;
    }
}



