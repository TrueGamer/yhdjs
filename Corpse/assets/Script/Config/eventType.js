/**
 * 自定义事件名
 */
let Tools = require("Tools");
var EVENT                   = {};
    EVENT.ADD_SPPED         = Tools.getGID();
    EVENT.AUTO_MERGE        = Tools.getGID();
    EVENT.UPDATE_PLANT      = Tools.getGID();
    EVENT.PLAY_OFFLINE_MC   = Tools.getGID();
    EVENT.CHECK_RED_DOT     = Tools.getGID();
    EVENT.GUIDE_PLANT_MOVE  = Tools.getGID();
    EVENT.UPDATE_WORK_STATE = Tools.getGID();
    EVENT.SHOWLOGIN         = Tools.getGID();
    EVENT.DROP_BOX          = Tools.getGID();
    EVENT.UPDATE_BIND_INFO  = Tools.getGID();
    EVENT.PAUSE_SPINE       = Tools.getGID();
    EVENT.RESUME_SPINE      = Tools.getGID();
    EVENT.RESUM_DRAG_ITEM   = Tools.getGID();
    EVENT.GUIDE_REDPACK     = Tools.getGID();
    EVENT.GUIDE_DAN         = Tools.getGID();
    EVENT.OPEN_DAN          = Tools.getGID();
    EVENT.OPEN_REDPACK      = Tools.getGID();
    EVENT.NET_FAIL          = Tools.getGID();
    EVENT.REMOVELISTENER    = Tools.getGID();
    EVENT.ERR_MEGER         = Tools.getGID();
    EVENT.GUIDE_CONTINUE    = Tools.getGID();
if (typeof module !== 'undefined') {
	module.exports = EVENT;
}