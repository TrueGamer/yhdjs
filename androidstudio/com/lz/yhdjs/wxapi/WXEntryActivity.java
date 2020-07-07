package com.lz.yhdjs.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.modelmsg.ShowMessageFromWX;
import com.tencent.mm.opensdk.modelmsg.WXAppExtendObject;
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.javascript.Constants;
import org.cocos2dx.javascript.uikit.NetworkUtil;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.lang.ref.WeakReference;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler{
    private static String TAG = "WXEntryActivity";
    public static IWXAPI api = null;
    public  static AppActivity activity = null;
    public static  WXEntryActivity _wxActivity = null;
    public static String refreshToken;
    public static String openId;
    public static String accessToken;
    public static String scope;
    public static JSONObject tokenJosn = null;
    public static JSONObject userInfoJosn = null;
    public static String isBind ;


    private static MyHandler handler;
    private static class MyHandler extends Handler {
        private final WeakReference<WXEntryActivity> wxEntryActivityWeakReference;

        public MyHandler(WXEntryActivity wxEntryActivity){
            wxEntryActivityWeakReference = new WeakReference<WXEntryActivity>(wxEntryActivity);
        }

        @Override
        public void handleMessage(Message msg) {
            int tag = msg.what;
            Bundle data = msg.getData();
            JSONObject json = null;
            switch (tag) {
                //检查Token
                case NetworkUtil.CHECK_TOKEN: {
                    try {
                        json = new JSONObject(data.getString("result"));
                        int errcode = json.getInt("errcode");
                        if (errcode == 0) {
                            getUserMesg(WXEntryActivity.accessToken,WXEntryActivity.openId);
                        } else {
                            NetworkUtil.sendWxAPI(WXEntryActivity.handler, String.format("https://api.weixin.qq.com/sns/oauth2/refresh_token?" +
                                            "appid=%s&grant_type=refresh_token&refresh_token=%s", Constants.APP_ID, WXEntryActivity.refreshToken),
                                    NetworkUtil.REFRESH_TOKEN);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                }
                case NetworkUtil.REFRESH_TOKEN: {
                    try {
                        json = new JSONObject(data.getString("result"));
                        WXEntryActivity.openId = json.getString("openid");
                        WXEntryActivity.accessToken = json.getString("access_token");
                        WXEntryActivity.refreshToken = json.getString("refresh_token");
                        WXEntryActivity.scope = json.getString("scope");
                        getUserMesg(WXEntryActivity.accessToken,WXEntryActivity.openId);
                    } catch (JSONException e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                }
                case NetworkUtil.GET_TOKEN: {
                    try {
                        json = new JSONObject(data.getString("result"));
                        WXEntryActivity.tokenJosn = json;
                        String openId, accessToken, refreshToken, scope;
                        WXEntryActivity.openId = json.getString("openid");
                        WXEntryActivity.accessToken = json.getString("access_token");
                        WXEntryActivity.refreshToken = json.getString("refresh_token");
                        WXEntryActivity.scope = json.getString("scope");
                        //getUserMesg(WXEntryActivity.accessToken,WXEntryActivity.openId);
                        //一定要在GL线程中执行
                        activity.runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                if(WXEntryActivity.isBind == "bindWx"){
                                    Cocos2dxJavascriptJavaBridge.evalString(String.format("SDKMgr.notifyErrorBind(%s)",WXEntryActivity.tokenJosn.toString()));
                                }else{
                                    Cocos2dxJavascriptJavaBridge.evalString(String.format("SDKMgr.setWxInfo(%s)",WXEntryActivity.tokenJosn.toString()));
                                }
                            }
                        });

                    } catch (JSONException e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                }
                case NetworkUtil.GET_INFO: {
                    try {
                        json = new JSONObject(data.getString("result"));
                        String encode = getcode(json.getString("nickname"));
                        json.put("nickname",new String(json.getString("nickname").getBytes(encode), "utf-8"));
                        json.put("access_token",accessToken);
                        json.put("refresh_token",refreshToken);
                        WXEntryActivity.userInfoJosn = json;
                        //一定要在GL线程中执行
                        activity.runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(String.format("SDKMgr.setUserInfo(%s)",userInfoJosn.toString()));
                                wxEntryActivityWeakReference.get().finish();
                            }
                        });
                    } catch (JSONException e) {
                        Log.e(TAG, e.getMessage());
                    }catch (UnsupportedEncodingException e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                }
            }
        }
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        _wxActivity = this;
        WXEntryActivity.handler = new MyHandler(this);
        try {
            Intent intent = getIntent();
            api.handleIntent(intent, this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        api.handleIntent(intent,this);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        System.out.print("Actitive" + resultCode);
    }

    @Override
    public void onReq(BaseReq req) {
        switch (req.getType()) {
            case ConstantsAPI.COMMAND_GETMESSAGE_FROM_WX:
                //分享的
                break;
            case ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX:
                goToShowMsg((ShowMessageFromWX.Req) req);
                break;
            default:
                break;
        }
        finish();
    }

    @Override
    public void onResp(BaseResp resp) {
        int result = 0;
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                result = 1;
                break;
            case BaseResp.ErrCode.ERR_USER_CANCEL:
                Toast.makeText(activity,"取消登陆",Toast.LENGTH_LONG).show();
                result = 0;
                break;
            case BaseResp.ErrCode.ERR_AUTH_DENIED:
                Toast.makeText(activity,"授权被拒绝",Toast.LENGTH_LONG).show();
                result = 2;
                break;
            case BaseResp.ErrCode.ERR_UNSUPPORT:
                result = 3;
                Toast.makeText(activity,"不支持该版本",Toast.LENGTH_LONG).show();
                break;
            default:
                result = 4;
                break;
        }
        //处理登陆授权
        if (resp.getType() == ConstantsAPI.COMMAND_SENDAUTH) {
            SendAuth.Resp authResp = (SendAuth.Resp)resp;
            //final String code = authResp.code;
            this.getAccess_token(authResp);
        }
        finish();
    }

    //請求Token
    public void  getAccess_token(SendAuth.Resp resp){
        SendAuth.Resp authResp = resp;
        final String code = authResp.code;
        NetworkUtil.sendWxAPI(WXEntryActivity.handler, String.format("https://api.weixin.qq.com/sns/oauth2/access_token?" +
                        "appid=%s&secret=%s&code=%s&grant_type=authorization_code", Constants.APP_ID,
                Constants.APPSECRET, code), NetworkUtil.GET_TOKEN);
    }

    /**
     * 获取微信的个人信息
     *
     * @param access_token
     * @param openid
     */
    public static void getUserMesg(final String access_token, final String openid) {
        NetworkUtil.sendWxAPI(WXEntryActivity.handler, String.format("https://api.weixin.qq.com/sns/userinfo?" +
                "access_token=%s&openid=%s", access_token, openid), NetworkUtil.GET_INFO);
    }


    public static void Init(AppActivity activity){
        WXEntryActivity.activity  = activity;
        WXEntryActivity.api = WXAPIFactory.createWXAPI(WXEntryActivity.activity , Constants.APP_ID, true);

    }

    public static void RegisterAppId(String appId){
        WXEntryActivity.api.registerApp(Constants.APP_ID);
        System.out.println("RegisterAppId====>");
    }


    // handler对象，用来接收消息~
    /**
     * 检查Token
     */
    public static void  CheckToken(String accessToken,String openId,String refreshToken){

//		WXEntryActivity.accessToken = accessToken;
//		WXEntryActivity.openId = openId;
//		WXEntryActivity.refreshToken = refreshToken;
//		WXEntryActivity.myAppHandler = new AppActivity.MyAppHandler(WXEntryActivity.activity);
//		System.out.println("=========>accessToken:"+accessToken + " openId: "+openId +" refreshToken" +refreshToken);
//		NetworkUtil.sendWxAPI(WXEntryActivity.handler, String.format("https://api.weixin.qq.com/sns/auth?" +
//				"access_token=%s&openid=%s", WXEntryActivity.accessToken, WXEntryActivity.openId), NetworkUtil.CHECK_TOKEN);

    }
    //授权请求
    public static void SendAuthRequest(String scope,String state){
        final SendAuth.Req req = new SendAuth.Req();
        req.scope = scope;
        req.state = state;
        api.sendReq(req);
    }

    //绑定授权请求
    public static void bindSendAuthRequest(String scope,String state,String bindWx){
        isBind = bindWx;
        final SendAuth.Req req = new SendAuth.Req();
        req.scope = scope;
        req.state = state;
        api.sendReq(req);
    }

    public static String getcode (String str) {
        String[] encodelist ={"GB2312","ISO-8859-1","UTF-8","GBK","Big5","UTF-16LE","Shift_JIS","EUC-JP"};
        for(int i =0;i<encodelist.length;i++){
            try {
                if (str.equals(new String(str.getBytes(encodelist[i]),encodelist[i]))) {
                    return encodelist[i];
                }
            } catch (Exception e) {

            } finally{

            }
        } return "";
    }


    private void goToShowMsg(ShowMessageFromWX.Req showReq) {
        WXMediaMessage wxMsg = showReq.message;
        WXAppExtendObject obj = (WXAppExtendObject) wxMsg.mediaObject;
        StringBuffer msg = new StringBuffer();
        msg.append("description: ");
        msg.append(wxMsg.description);
        msg.append("\n");
        msg.append("extInfo: ");
        msg.append(obj.extInfo);
        msg.append("\n");
        msg.append("filePath: ");
        msg.append(obj.filePath);
        System.out.println(msg.toString());
        finish();
    }

}

