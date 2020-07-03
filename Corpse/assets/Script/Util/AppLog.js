/**
 * 日志系统
 */
var AppLog = {};
AppLog.OPENLOGFLAG = false;
AppLog.getDateString = function () {
    var d = new Date();
    var str = d.getHours();
    var timeStr = "";
    timeStr += (str.length==1? "0"+str : str) + ":";
    str = d.getMinutes();
    timeStr += (str.length==1? "0"+str : str) + ":";
    str = d.getSeconds();
    timeStr += (str.length==1? "0"+str : str) + ":";
    str = d.getMilliseconds();
    if( str.length==1 ) str = "00"+str;
    if( str.length==2 ) str = "0"+str;
    timeStr += str;

    timeStr = "[" + timeStr + "]";
    return timeStr;
}; 

AppLog.stack = function (index) {
    var e = new Error();
    var lines = e.stack.split("\n");
    lines.shift();
    var result = [];
    lines.forEach(function (line) {
        line = line.substring(7);
        var lineBreak = line.split(" ");
        if (lineBreak.length<2) {
            result.push(lineBreak[0]);
        } else {
            result.push({[lineBreak[0]] : lineBreak[1]});
        }
    });

    var list = [];
    if(index < result.length-1){
        for(var a in result[index]){
            list.push(a);
        }
    }
    if(!list[0]) return "";
    var splitList = list[0].split(".");
    return (splitList[0] + ".js->" + splitList[1] + ": ");
}


AppLog.log = function(){
    var backLog = console.log || cc.log || log;

    if(AppLog.OPENLOGFLAG){
        backLog.call(this,"%s%s"+cc.js.formatStr.apply(cc,arguments),this.stack(2),AppLog.getDateString());
    }
};

AppLog.info = function () {
    var backLog = console.log || cc.log || log;
    if(AppLog.OPENLOGFLAG){
        backLog.call(this,"%c%s:"+cc.js.formatStr.apply(cc,arguments),"color:#00CD00;",AppLog.getDateString());
    }
};

AppLog.warn = function(){
    var backLog = console.log || cc.log || log;
    if(AppLog.OPENLOGFLAG){
        backLog.call(this,"%c%s:"+cc.js.formatStr.apply(cc,arguments),"color:#ee7700;",AppLog.getDateString());
        //cc.warn
    }
};

AppLog.err = function(){
    var backLog = console.log || cc.log || log;
    if(AppLog.OPENLOGFLAG){
        backLog.call(this,"%c%s:"+cc.js.formatStr.apply(cc,arguments),"color:red",AppLog.getDateString());
    }
};

if(typeof module!=="undefined"){
    module.exports = AppLog;
}
window.AppLog = AppLog;