package com.lz.yhdjs.ttapi;

import android.content.Context;
import android.util.Log;

import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdManager;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTRewardVideoAd;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.javascript.Constants;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class TTGameRewardVideo {
    public static final String TAG = "TTRewardVideo";
    public static TTRewardVideoAd mttRewardVideoAd;
    public static TTAdNative mTTAdNative;
    public static boolean mHasShowDownloadActive = false;
    public static boolean mIsExpress = false; //是否请求模板广告
    public static AppActivity activity ;
    public static int orientation = TTAdConstant.VERTICAL; //必填参数，期望视频的播放方向：TTAdConstant.HORIZONTAL 或 TTAdConstant.VERTICAL

    //视频广告发送奖励
    private static void sendReward(final int code){
        TTGameRewardVideo.activity.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                //自己游戏奖励
                Cocos2dxJavascriptJavaBridge.evalString(String.format("SDKMgr.androidVideoFinish(%s)",String.valueOf( code )));
            }
        });
    }

    public static void init(Context content){
        TTGameRewardVideo.activity = (AppActivity) content;
        //step1:初始化sdk
        TTAdManager ttAdManager = TTAdManagerHolder.get();
        //step2:(可选，强烈建议在合适的时机调用):申请部分权限，如read_phone_state,防止获取不了imei时候，下载类广告没有填充的问题。
        ttAdManager.requestPermissionIfNecessary(content);
        //step3:创建TTAdNative对象,用于调用广告请求接口
        System.out.println("SDK Version"+ ttAdManager.getSDKVersion() );
        TTGameRewardVideo.mTTAdNative = ttAdManager.createAdNative(content.getApplicationContext());
        TTGameRewardVideo.onLoadAD();
    }

    public static void loadAd( String codeId, int orientation) {
        //step4:创建广告请求参数AdSlot,具体参数含义参考文档
        AdSlot adSlot;
        if (TTGameRewardVideo.mIsExpress) {
            //个性化模板广告需要传入期望广告view的宽、高，单位dp，
            adSlot = new AdSlot.Builder()
                    .setCodeId(codeId)
                    .setSupportDeepLink(true)
                    .setRewardName("金币") //奖励的名称
                    .setRewardAmount(3)  //奖励的数量
                    //模板广告需要设置期望个性化模板广告的大小,单位dp,激励视频场景，只要设置的值大于0即可
                    .setExpressViewAcceptedSize(500,500)
                    .setUserID("user123")//用户id,必传参数
                    .setMediaExtra("media_extra") //附加参数，可选
                    .setOrientation(orientation) //必填参数，期望视频的播放方向：TTAdConstant.HORIZONTAL 或 TTAdConstant.VERTICAL
                    .build();
        } else {
            //模板广告需要设置期望个性化模板广告的大小,单位dp,代码位是否属于个性化模板广告，请在穿山甲平台查看
            adSlot = new AdSlot.Builder()
                    .setCodeId(codeId)
                    .setSupportDeepLink(true)
                    .setRewardName("金币") //奖励的名称
                    .setRewardAmount(3)  //奖励的数量
                    .setUserID("user123")//用户id,必传参数
                    .setMediaExtra("media_extra") //附加参数，可选
                    .setOrientation(orientation) //必填参数，期望视频的播放方向：TTAdConstant.HORIZONTAL 或 TTAdConstant.VERTICAL
                    .build();
        }
        //step5:请求广告
        TTGameRewardVideo.mTTAdNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {
            @Override
            public void onError(int code, String message) {
                Log.e(TAG, "onError: " + code + ", " + String.valueOf(message));
                System.out.println("onError: " + code + ", " + String.valueOf(message));
            }

            //视频广告加载后，视频资源缓存到本地的回调，在此回调后，播放本地视频，流畅不阻塞。
            @Override
            public void onRewardVideoCached() {
               // System.out.println("onRewardVideoCached");
            }

            //视频广告的素材加载完毕，比如视频url等，在此回调后，可以播放在线视频，网络不好可能出现加载缓冲，影响体验。
            @Override
            public void onRewardVideoAdLoad(TTRewardVideoAd ad) {
                Log.e(TAG, "onRewardVideoAdLoad");
                //System.out.println("onRewardVideoAdLoad");
                TTGameRewardVideo.mttRewardVideoAd = ad;
                TTGameRewardVideo.mttRewardVideoAd.setRewardAdInteractionListener(new TTRewardVideoAd.RewardAdInteractionListener() {
                    @Override
                    public void onAdShow() {
                       // System.out.println("onAdShow===>");
                       // TToast.show(RewardVideoActivity.this, "rewardVideoAd show");
                    }

                    @Override
                    public void onAdVideoBarClick() {
                       // TToast.show(RewardVideoActivity.this, "rewardVideoAd bar click");
                        TTGameRewardVideo.onLoadAD();
                    }

                    @Override
                    public void onAdClose() {
                        //System.out.println("onAdClose===>");
                        //TToast.show(RewardVideoActivity.this, "rewardVideoAd close");
                        TTGameRewardVideo.onLoadAD();
                    }

                    //视频播放完成回调
                    @Override
                    public void onVideoComplete() {
                        //TToast.show(RewardVideoActivity.this, "rewardVideoAd complete");
                        //System.out.println("onVideoComplete===>");
                        sendReward(1 );
                    }

                    @Override
                    public void onVideoError() {
                        System.out.println("onVideoError===>");
                        //TToast.show(RewardVideoActivity.this, "rewardVideoAd error");
                        sendReward(2 );
                    }

                    //视频播放完成后，奖励验证回调，rewardVerify：是否有效，rewardAmount：奖励梳理，rewardName：奖励名称
                    @Override
                    public void onRewardVerify(boolean rewardVerify, int rewardAmount, String rewardName) {
                        //TToast.show(RewardVideoActivity.this, "verify:" + rewardVerify + " amount:" + rewardAmount +
                         //       " name:" + rewardName);
                        //System.out.println("onRewardVerify===>"+rewardVerify);
                    }

                    @Override
                    public void onSkippedVideo() {
                        //TToast.show(RewardVideoActivity.this, "rewardVideoAd has onSkippedVideo");
                        sendReward(3 );
                    }
                });
                TTGameRewardVideo.mttRewardVideoAd.setDownloadListener(new TTAppDownloadListener() {
                    @Override
                    public void onIdle() {
                        TTGameRewardVideo.mHasShowDownloadActive = false;
                    }

                    @Override
                    public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                        Log.d("DML", "onDownloadActive==totalBytes=" + totalBytes + ",currBytes=" + currBytes + ",fileName=" + fileName + ",appName=" + appName);

                        if (!TTGameRewardVideo.mHasShowDownloadActive) {
                            TTGameRewardVideo.mHasShowDownloadActive = true;
                            //TToast.show(RewardVideoActivity.this, "下载中，点击下载区域暂停", Toast.LENGTH_LONG);
                        }
                    }

                    @Override
                    public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                        Log.d("DML", "onDownloadPaused===totalBytes=" + totalBytes + ",currBytes=" + currBytes + ",fileName=" + fileName + ",appName=" + appName);
                       // TToast.show(RewardVideoActivity.this, "下载暂停，点击下载区域继续", Toast.LENGTH_LONG);
                    }

                    @Override
                    public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                        Log.d("DML", "onDownloadFailed==totalBytes=" + totalBytes + ",currBytes=" + currBytes + ",fileName=" + fileName + ",appName=" + appName);
                      //  TToast.show(RewardVideoActivity.this, "下载失败，点击下载区域重新下载", Toast.LENGTH_LONG);
                    }

                    @Override
                    public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                        Log.d("DML", "onDownloadFinished==totalBytes=" + totalBytes + ",fileName=" + fileName + ",appName=" + appName);
                       // TToast.show(RewardVideoActivity.this, "下载完成，点击下载区域重新下载", Toast.LENGTH_LONG);
                    }

                    @Override
                    public void onInstalled(String fileName, String appName) {
                        Log.d("DML", "onInstalled==" + ",fileName=" + fileName + ",appName=" + appName);
                       // TToast.show(RewardVideoActivity.this, "安装完成，点击下载区域打开", Toast.LENGTH_LONG);
                    }
                });
            }
        });
    }

    public static void showRewardVideoAd(){
        TTGameRewardVideo.activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if(TTGameRewardVideo.mttRewardVideoAd != null){
                    TTGameRewardVideo.mttRewardVideoAd.showRewardVideoAd(TTGameRewardVideo.activity,TTAdConstant.RitScenes.CUSTOMIZE_SCENES,"scenes_test");
                    TTGameRewardVideo.mttRewardVideoAd = null;
                }else {
                    System.out.println("请先加载广告");
                    TTGameRewardVideo.onLoadAD();
                }
            }
        });
    }

    public static void initLoad(){
//        if (TTGameRewardVideo.mttRewardVideoAd != null) {
//            System.out.println("已经有加载了");
//            return;
//        }
//        System.out.println("初始化加载广告");
//        TTGameRewardVideo.loadAd(Constants.TT_BANNER_ID, TTAdConstant.VERTICAL);
    }

    public static  void onLoadAD(){
        TTGameRewardVideo.loadAd(Constants.TT_BANNER_ID, TTAdConstant.VERTICAL);
    }

}
