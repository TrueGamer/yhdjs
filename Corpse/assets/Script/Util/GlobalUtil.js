/*
* --获取全局唯一的id;
*/
var GlobalUtil = cc.Class({ 
    statics:{
        __id__ :10000,
        getUniqueID(){
            GlobalUtil.__id__ = GlobalUtil.__id__ + 1;
            return GlobalUtil.__id__;
        }, 
    }
});

module.exports = GlobalUtil;