module.exports = {
    name: '引导升级段位',
    debug: true,
    autorun: false,
    type:"danUp", 
    steps: [ 
        {   
            onStart(callback) {
                console.log("xxxxxx")
                whevent.onOnce('task2', () => { 
                    callback(); 
                });
            },
            desc: '下面开始升级段位吧',
            id:8, 
            rotaton:90,  
            command: { cmd: 'finger', args: 'topLayer/di-t/top-dik-t2/shegnjiduanwei'},
           
        },  
        {   
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 1000);
            },
            desc: '点击提升段位',
            id:9, 
            rotaton:90, 
            txtStyle:{y:-400},
            command: { cmd: 'finger', args: 'popLayer/popDan/kuang/bth2/bth_zi_jddw'},
           
        },  
    ]
}