module.exports = {
    name: '初始化指引',
    debug: true,
    autorun: true,
    type:"mainGuide",
    steps: [
        {
            desc: '点击快速购买按钮购买一个植物',
            id:1,
            command: { cmd: 'finger', args: 'baseNode/menuLayer/mn_anniu12'},
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 300);
            },  
        },{
            desc: '我们再购买一个植物',
            id:2,
            command: { cmd: 'finger', args: 'baseNode/menuLayer/mn_anniu12'},
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 300);
            },
        },
        {
            desc: '通过移动合并升级植物',
            id:3,
            command: { cmd: 'movefinger', args: 'baseNode/posLayer/plant5,baseNode/posLayer/plant6'},
            onStart(callback) {
                setTimeout(() => { 
                    callback();
                }, 500);
            },
        }, 
        {
            desc: '很棒,已经解锁二级植物豌豆射手呐',
            id:4,
            command: { cmd: 'finger', args: 'popLayer/popUnLock/kuang/bth_g'}, 
            onStart(callback){  
                setTimeout(() => { 
                    callback();
                }, 1000); 
            }
        },
        {
            desc: '把植物放上炮塔位置,才能抵抗僵尸哦',
            id:5,
            command: { cmd: 'moveTurret', args: 'baseNode/posLayer',movefinger:true}, 
            onStart(callback){
                setTimeout(() => { 
                    callback();
                }, 10); 
            }
        },
        {
            desc: '一大波僵尸即将来袭，多购买点植物吧',
            id:6,
            command: { cmd: 'finger', args: 'baseNode/menuLayer/mn_anniu12'},
            onStart(callback) { 
                setTimeout(() => { 
                    callback();
                }, 100);
            },
        }, 
    ]
};