package com.lz.yhdjs.umapi;
import android.content.Context;

import com.umeng.analytics.MobclickAgent;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.commonsdk.statistics.common.DeviceConfig;
import com.umeng.commonsdk.utils.UMUtils;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.javascript.Constants;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class UmengApplication {
        private static AppActivity _context;
        public static void init(Context context){
            // 初始化SDK
            _context = (AppActivity)context;
            //UMConfigure.init(_context, Constants.UM_ID, "Umeng", UMConfigure.DEVICE_TYPE_PHONE, null);
            UMConfigure.init(_context, UMConfigure.DEVICE_TYPE_PHONE,"");
            UMConfigure.setLogEnabled(false);
            // 选用AUTO页面采集模式
            MobclickAgent.setPageCollectionMode(MobclickAgent.PageMode.AUTO);
            // 支持在子进程中统计自定义事件
            UMConfigure.setProcessEvent(false);

            MobclickAgent.setScenarioType(context, MobclickAgent.EScenarioType.E_UM_GAME );

            ///UmengApplication.getUmengChannel();
        }


    public static String[] getTestDeviceInfo(Context context){
        String[] deviceInfo = new String[2];
        try {
            if(context != null){
                deviceInfo[0] = DeviceConfig.getDeviceIdForGeneral(context);
                deviceInfo[1] = DeviceConfig.getMac(context);
            }
        } catch (Exception e){
        }
        return deviceInfo;
    }

        public static void onKillProcess(Context context){
            MobclickAgent.onKillProcess(context);
        }

    /**
     * 发送自定义事件（看视频）
     * @param info
     *   uid
     *   type
     *   time
     */
    public static void sendEvent(String info){
            try {
                JSONObject json = new JSONObject(info);
                String uid = json.getString("uid");//玩家uid
                String type = json.getString("type");//类型
                Map<String, Object> video = new HashMap<String, Object>();
                video.put("game_event", "video");//自定义参数：游戏类型，值：视频
                video.put("uid",uid );//自定义参数：游戏类型，值：视频
                video.put("type", type );//类型
                System.out.println("=============>"+type);
                MobclickAgent.onEventObject(_context, "game_video", video);
            }catch (JSONException e) {

            }
        }


    /**
     * 发送自定义事件（新手结束）
     * @param info
     *   uid
     *   type
     *   time
     */
    public static void sendGuideEvent(String info){
        try {
            JSONObject json = new JSONObject(info);
            String uid = json.getString("uid");//玩家uid
            String type = json.getString("type");//类型
            String time = json.getString("time");//时间
            Map<String, Object> guide = new HashMap<String, Object>();
            guide.put("game_event", "guide");//自定义参数：游戏类型，值：视频
            guide.put("uid",uid );//自定义参数：游戏类型，值：视频
            guide.put("type", type );//类型
            MobclickAgent.onEventObject(_context, "game_event", guide);
        }catch (JSONException e) {

        }
    }

    public static String getUmengChannel(){
        String channel = UMUtils.getChannel(_context);
        return channel;
    }

}
