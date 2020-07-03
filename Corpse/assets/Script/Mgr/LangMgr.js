/**
  * 文本管理器 用于语言切换
  * 
  */
var LangMgr = cc.Class({ 
    ctor(){
        this.allCofnig = null
        this.isComplete = false;
        this.init(); 
    }, 
    init(config){ 
        if(true){ 
                    //配置数据
            config = { 
                10:"更新出错,请退出后重试",
                11:"当前版本太低,请更新至最新版本",
                1001:"获得金币X{0}",
                1002:"金额 {0}",
                1003:"没有可撤销操作",
                1004:"暂未开启该功能", 
                1005:"金币不足",
                1006:"恭喜你获得{0}{1}",
                1007:"次数不足,明天再来吧!",
                1008:"没有空位了",
                1009:"{0}秒内植物自动合并",
                1010:"剩余时间: {0}",
                1011:"免费次数{0}/{1}",
                1012:"下一次转盘奖励{0}", 
                1013:"{0}分钟",
                1014:"暂未开始工作",
                1015:"次数不足",
                1016:"(已绑定)",
                1017:"选择提现金额",
                1018:"免费次数已达上限",
                1019:"当前正在加速中", 
                1020:"拖动植物到出售按钮上！",
                1021:"正在转动中。。。",
                1022:"购买成功!",
                1023:"第{0}期红包活动",
                1024:"余额不足",
                1025:"提现条件不满足",
                1026:"{0}开放!"
            }
        } 
        this.allCofnig = config;
    },

    getText(code){ 
        let config = _G.CfgMgr.getConfig("error",code);
        if(config){
            return config.explain;
        }
        if(this.allCofnig[code]){
            return this.allCofnig[code];
        }
        return  "";
    }, 

}) 

module.exports = LangMgr;  