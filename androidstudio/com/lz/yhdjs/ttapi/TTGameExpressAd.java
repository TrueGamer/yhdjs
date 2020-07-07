package com.lz.yhdjs.ttapi;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.support.annotation.MainThread;
import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTSplashAd;
import com.bytedance.sdk.openadsdk.FilterWord;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdDislike;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTNativeExpressAd;
import com.lz.yhdjs.R;
import com.lz.yhdjs.dialog.DislikeDialog;
import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.javascript.Constants;
import org.cocos2dx.javascript.uikit.TToast;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import java.util.List;

public class TTGameExpressAd {
    public static final String TAG = "TTGameExpressAd";
    public static AppActivity activity ;
    private static TTAdNative mTTAdNative;
    private static FrameLayout mExpressContainer;
    private static TTNativeExpressAd mTTAd;
    private static long startTime = 0;
    private static boolean mHasShowDownloadActive = false;
    private static boolean isLoadedState = false; //加载广告状态
    private static boolean isAdShow = false;
    //视频广告发送奖励
    private static void sendReward(final int code){
        TTGameExpressAd.activity.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                //自己游戏奖励
                Cocos2dxJavascriptJavaBridge.evalString(String.format("SDKMgr.androidVideoFinish(%s)",String.valueOf( code )));
            }
        });
    }

    public static void init(Context content){
        activity = (AppActivity)content;
        //step2:创建TTAdNative对象，createAdNative(Context context) banner广告context需要传入Activity对象
        mTTAdNative = TTAdManagerHolder.get().createAdNative(content);
        //step3:(可选，强烈建议在合适的时机调用):申请部分权限，如read_phone_state,防止获取不了imei时候，下载类广告没有填充的问题。
        TTAdManagerHolder.get().requestPermissionIfNecessary(content);
        mExpressContainer = (FrameLayout) activity.findViewById(R.id.express_container);
    }

    public static void viewShow(){
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                //显示
                mExpressContainer.setVisibility(View.VISIBLE);
            }
        });
    }

    /**
     * 加载穿山甲开屏广告
     */
    public static void loadSplashAd() {
        Log.i("info", "loadSplashAd begin 1");
        //开屏广告参数
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(Constants.TT_SPLASH_ID)
                .setSupportDeepLink(true)
                .setImageAcceptedSize(1080, 1840)
                .build();
        //调用开屏广告异步请求接口
        Log.i("info", "loadSplashAd begin 2");
        mTTAdNative.loadSplashAd(adSlot, new TTAdNative.SplashAdListener() {
            @Override
            @MainThread
            public void onError(int code, String message) {
                Log.i("info", "loadSplashAd code="+code+",message="+message);
                onSplashEnd();
            }


            @Override
            @MainThread
            public void onTimeout() {
                Log.d("info", "loadSplashAd onTimeout");
                onSplashEnd();
            }

            @Override
            @MainThread
            public void onSplashAdLoad(TTSplashAd ad) {
                Log.i("info", "loadSplashAd 开屏广告请求成功");
                if (ad == null) {
                    return;
                }
                //获取SplashView
                View view = ad.getSplashView();
                mExpressContainer.removeAllViews();
                //把SplashView 添加到ViewGroup中
                mExpressContainer.addView(view);
                //设置不开启开屏广告倒计时功能以及不显示跳过按钮
                //ad.setNotAllowSdkCountdown();

                //设置SplashView的交互监听器
                ad.setSplashInteractionListener(new TTSplashAd.AdInteractionListener() {
                    @Override
                    public void onAdClicked(View view, int type) {
                        Log.d("info", "loadSplashAd onAdClicked");
                    }

                    @Override
                    public void onAdShow(View view, int type) {
                        Log.d("info", "loadSplashAd onAdShow");
                    }

                    @Override
                    public void onAdSkip() {
                        Log.d("info", "loadSplashAd onAdSkip");
                        onSplashEnd();
                    }

                    @Override
                    public void onAdTimeOver() {
                        Log.d("info", "loadSplashAd onAdTimeOver");
                        onSplashEnd();
                    }
                });
            }
        });
//        onSplashEnd();
    }

    public static void onSplashEnd(){
        Log.d("info", "onSplashEnd");
        String message = "";
        TTGameExpressAd.activity.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                //自己游戏奖励
                Cocos2dxJavascriptJavaBridge.evalString("SDKMgr.onSplashEnd()");
            }
        });
    }

    public static void loadExpressAd() {
        //step4:创建广告请求参数AdSlot,具体参数含义参考文档
        isLoadedState = false;
        isAdShow = true;
        System.out.println("loadExpressAd========>");
        float expressViewWidth = 350;
        float expressViewHeight = 290;
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(Constants.TT_FEED_ID) //广告位id
                .setSupportDeepLink(true)
                .setAdCount(1) //请求广告数量为1到3条
                .setExpressViewAcceptedSize(expressViewWidth,expressViewHeight) //期望模板广告view的size,单位dp
                .build();

        //step5:请求广告，对请求回调的广告作渲染处理
        mTTAdNative.loadNativeExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {
            @Override
            public void onError(int code, String message) {
                System.out.println("onError==============》" +code+"=---->"+message);
                //mExpressContainer.removeAllViews();
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0){
                    return;
                }
                System.out.println("loadExpressAd");
                mTTAd = ads.get(0);
                bindAdListener(mTTAd);
                mTTAd.render();
            }
        });
    }

    public static void bindAdListener(TTNativeExpressAd ad) {
        ad.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {
            @Override
            public void onAdClicked(View view, int type) {
                //TToast.show(mContext, "广告被点击");
            }

            @Override
            public void onAdShow(View view, int type) {
              //TToast.show(activity, "广告展示");
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                Log.e("ExpressView","render fail:"+(System.currentTimeMillis() - startTime));
                //TToast.show(activity, msg+" code:"+code);
            }

            @Override
            public void onRenderSuccess(final View view, float width, float height) {
                //返回view的宽高 单位 dp
                mExpressContainer.removeAllViews();
                activity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if(isAdShow){
                            mExpressContainer.addView(view);
                            viewShow();
                        }
                        isLoadedState = true;

                    }
                });
            }
        });
        //dislike设置
        bindDislike(ad, false);
        if (ad.getInteractionType() != TTAdConstant.INTERACTION_TYPE_DOWNLOAD){
            return;
        }
        ad.setDownloadListener(new TTAppDownloadListener() {
            @Override
            public void onIdle() {

                //TToast.show(activity, "点击开始下载", Toast.LENGTH_LONG );
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                if (!mHasShowDownloadActive) {
                    mHasShowDownloadActive = true;
                  //  TToast.show(activity, "下载中，点击暂停", Toast.LENGTH_LONG);
                }
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                //TToast.show(activity, "下载暂停，点击继续", Toast.LENGTH_LONG);
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
               // TToast.show(activity, "下载失败，点击重新下载", Toast.LENGTH_LONG);
            }

            @Override
            public void onInstalled(String fileName, String appName) {
              //  TToast.show(activity, "安装完成，点击图片打开", Toast.LENGTH_LONG);
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
               // TToast.show(activity, "点击安装", Toast.LENGTH_LONG);
            }
        });
    }

    /**
     * 设置广告的不喜欢，注意：强烈建议设置该逻辑，如果不设置dislike处理逻辑，则模板广告中的 dislike区域不响应dislike事件。
     * @param ad
     * @param customStyle 是否自定义样式，true:样式自定义
     */
    public static void bindDislike(TTNativeExpressAd ad, boolean customStyle) {
        if (customStyle) {
            //使用自定义样式
            List<FilterWord> words = ad.getFilterWords();
            if (words == null || words.isEmpty()) {
                return;
            }

            final DislikeDialog dislikeDialog = new DislikeDialog(activity, words);
            dislikeDialog.setOnDislikeItemClick(new DislikeDialog.OnDislikeItemClick() {
                @Override
                public void onItemClick(FilterWord filterWord) {
                    //用户选择不喜欢原因后，移除广告展示
                    System.out.println("setOnDislikeItemClick============>");
                    mExpressContainer.removeAllViews();
                }
            });
            ad.setDislikeDialog(dislikeDialog);
            return;
        }
        //使用默认模板中默认dislike弹出样式
        ad.setDislikeCallback(activity, new TTAdDislike.DislikeInteractionCallback() {
            @Override
            public void onSelected(int position, String value) {
               // TToast.show(mContext, "点击 " + value);
                //用户选择不喜欢原因后，移除广告展示
                System.out.println("onSelected============>");
                mExpressContainer.removeAllViews();
            }

            @Override
            public void onCancel() {
                //TToast.show(activity, "点击取消 ");
            }
        });
    }

    //装载成功
    public static boolean getAdLoaded(){
        return  isLoadedState ;
    }

    public static void onDestroyExpress() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                isAdShow = false;
                mExpressContainer.setVisibility(View.GONE);
            }
        });
    }

    public static void onDestroy() {
        if (mTTAd != null) {
            mTTAd.destroy();
        }
    }

}
