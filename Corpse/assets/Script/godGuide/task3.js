module.exports = {
    name: '引导钻石购买',
    debug: true,
    autorun: false,
    type:"diamondBuy",
    startId:10,
    steps: [  
        {   
            onStart(callback) {
                whevent.onOnce('task3', () => { 
                    PopMgr.closeAllPop();
                    callback(); 
                });
            },
            desc: '打开商店',
            id:10, 
            rotaton:0,  
            command: { cmd: 'finger', args: 'baseNode/menuLayer/mn_anniu13'},
           
        },   
        {    
            desc: '使用钻石购买一个植物',
            id:11, 
            rotaton:0,   
            txtStyle:{y:400},
            command: { cmd: 'buyfinger', args: 'popLayer/popShop/kuang/scrollView/view/content/shopItem{0}/btn_zuanshi'},
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 300);
            },
        },  
        {    
            desc: '钻石可以购买比阳光更高级的植物哦~~',
            id:12, 
            rotaton:270,    
            scaleX:-1, 
            txtStyle:{y:200},
            command: { cmd: 'finger', args: 'popLayer/popShop/kuang/close@2x'},
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 300);
            },
        },  
    ]
}