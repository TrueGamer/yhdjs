/**
 * 网络工具类
 */
var HttpUtils = cc.Class({ 
    statics: {
        /**
         * get 请求
         * @param {*} url 
         * @param {*} callback 
         */
        httpGets: function (url, callback,cbFail) {
            var xhr = cc.loader.getXMLHttpRequest();
            var flag = false;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) { 
                    var respone = JSON.parse(xhr.responseText);
                    callback(respone);
                }
            };
            xhr.open("GET", url, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
     
            // note: In Internet Explorer, the timeout property may be set only after calling the open()
            // method and before calling the send() method.
            xhr.timeout = 5000;// 5 seconds for timeout
            
            xhr.onerror = function () {
                if (!flag) {
                    flag = true;
                    cbFail(xhr.status, null);
                }
            }; 
            xhr.send();
        },
        /**
         * post 请求
         * @param {*} url 
         * @param {*} params 
         * @param {*} callback 
         */
        httpPost: function (url, params, callback,cbFail) {
            var xhr = cc.loader.getXMLHttpRequest(); 
            var flag = false;
            xhr.onreadystatechange = function () {
               // cc.log('xhr.readyState='+xhr.readyState+'  xhr.status='+xhr.status);
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {  
                    var respone = JSON.parse(xhr.responseText);
                    callback(respone);
                }else{
                    callback(-1);
                }
            };
            
            xhr.open("POST", url,true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8"); 
            }
            // note: In Internet Explorer, the timeout property may be set only after calling the open()
            // method and before calling the send() method.
            xhr.timeout = 5000;// 5 seconds for timeout   
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
          //  console.log(params)

            xhr.onerror = function () {
                if (!flag) {
                    flag = true;
                    cbFail(xhr.status, null);
                }
            }; 

            xhr.send(params);
        },
        /**
         * 下载
         * @param {*} url 
         * @param {*} path 
         * @param {*} params 
         * @param {*} callback 
         */
        downLoad(url, path, params, callback) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var requestURL = url + path;
            if (params) {
                requestURL = requestURL + "?" + params;
            }
    
            xhr.responseType = "arraybuffer";  
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept", "text/html");
                xhr.setRequestHeader("Accept-Charset", "utf-8");
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            }
    
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    var buffer = xhr.response;
                    var dataview = new DataView(buffer);
                    var ints = new Uint8Array(buffer.byteLength);
                    for (var i = 0; i < ints.length; i++) {
                        ints[i] = dataview.getUint8(i);
                    }
                    callback(null, ints);
                }
                else {
                    callback(xhr.readyState + ":" + xhr.status, null);
                }
            };
            xhr.send();
            return xhr;
        } 
    }, 
});

if (typeof module !== 'undefined') {
	module.exports = HttpUtils;
}