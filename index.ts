// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-05-11
// @description  try to take over the world!
// @author       You
// @match        scm.imuyuan.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=imuyuan.com
// @grant        none
// ==/UserScript==
"use strict"
window.$$ = s=>[...document.querySelectorAll(s)];
window.$ = s=>$$(s)[0];

window.addEventListener(
    "hashchange",
    main,
    false
);

let href = location.href
setInterval(()=>{
    if(href !== location.href){
        href = location.href
        main()
    }
}, 500)

function isHash(hash){
    return location.hash.split('?')[0] === hash
}

main()
async function main() {
    // 退出登录自动确定
    findDom(()=>$$('[aria-label="退出登录"] span').find(dom=>dom.innerText === '确定'))


    if(isHash('#/login')){
        // 登录同意
        findDom(()=>$(':has(>[aria-label="用户须知"])')?.style.display==='' && $$('[aria-label="用户须知"] span').find(dom=>dom.innerText === '同意'))

        // 自动跳转发货
        findDom(()=>$$('.menu-list a').find(dom=>dom.innerText === '合同管理'))
        findDom(()=>$$('.menu a').find(dom=>dom.innerText === '发货通知'))
    }


    if(isHash('#/contractMsg/sendTolist')){
        window.__f = async function (e={target:{innerText:''}}){
            await findDom(()=>$('[placeholder="关键字查询"]'), dom=>{
                dom.value = e.target.innerText.trim()
                dom.dispatchEvent(new Event('input'))
            })
            await findDom(()=>$('[placeholder="状态"]'))
            await findDom(()=>$$('li span').find(dom=>dom.innerText === '运输中'))
            findDom(()=>$$('button span').find(dom=>dom.innerText === '搜索'))
        }

        // 常用搜索
        findDom(()=>$('.searchLine'), dom=>{
            dom.insertAdjacentHTML('afterbegin', '<span onclick="__f(event)"> 范县 </span>');
            dom.insertAdjacentHTML('afterbegin', '<span onclick="__f(event)"> 清丰 </span>');
            dom.insertAdjacentHTML('afterbegin', '<span onclick="__f(event)"> 滑县 </span>');
            dom.insertAdjacentHTML('afterbegin', '<span onclick="__f(event)"> 莘县 </span>');
            dom.insertAdjacentHTML('afterbegin', '<span onclick="__f()"> 全部 </span>');
            //dom.insertAdjacentHTML('afterbegin', '<style>table :is(td,col,th):is(:nth-child(4),:nth-child(6)){display:none}</style>');
        })


        // 输入框输入 自动搜索
        findDom(()=>$('[placeholder="关键字查询"]'), dom=>{
            dom.oninput = ()=>{
                findDom(()=>$$('button span').find(dom=>dom.innerText === '搜索'))
            }
        })


        findDom(()=>$$('button span').find(dom=>dom.innerText === '搜索'), async dom=>{
            dom.onclick= ()=>{
                // 搜索结果着色
                setTimeout(()=>{
                    findDom(()=>$$('.cell'), doms=>doms.forEach(dom=>{if(dom.innerText==='玉米' || dom.innerText.includes('第三')){dom.style.color="red"}}))
                }, 500)
            }
            __f({target:{innerText:'内黄'}})
        })



        findDom(()=>$('.searchBox+div'), dom=>dom.style.height="600px")
        findDom(()=>$('.footer'),d=>d.remove())
    }

    if(isHash('#/contractMsg/sendTolistDetail')){
        findDom(()=>$$('button span').find(dom=>dom.innerText === '新增预约'), dom=>{
            dom.onclick = ()=>{
                // 质检
                findDom(()=>$('[for="isShowQualityTest"] ~ div label:nth-of-type(2)'))

                // 日期
                findDom(()=>$("[placeholder='选择日期'] + span i"))
                findDom(()=>$$('.el-picker-panel__content .available span').find(dom=>dom.innerText === new Date().toLocaleDateString().split('/').at(-1)))


                // 目的地
                findDom(()=>$("form thead th:nth-last-child(2)"), async dom=>{
                    window._select = async function select(q,w,e){
                        await findDom(()=>$$('[placeholder="请选择"]').at(-1))
                        await findDom(()=>$$('li span').find(dom=>dom.innerText === q))
                        await findDom(()=>$$('li span').find(dom=>dom.innerText === w))
                        await findDom(()=>$$('li span').find(dom=>dom.innerText === e))
                    }
                    _select('河北省', '邯郸市', '大名县')

                    dom.innerHTML = `
<div>
<span onclick="_select('河北省', '邯郸市', event.target.innerText)">邯郸县</span>
<span onclick="_select('河南省', '濮阳市', event.target.innerText)">濮阳县</span>
</div>`
                })
            }
            dom.click()
        })


        function sleep(t=3000) {
            return new Promise(q=>setTimeout(q, t))
        }
        window.add = async (txt)=>{
            const 车牌 = txt.match(/[冀豫].*/)?.[0]?.replaceAll(' ','')
            const 司机 = txt.match(/姓名[:：]?\s*([\u4e00-\u9fa5]+)/)?.[1];
            const 身份证 = txt.match(/身份证[号]?[:：]?(\d{17}[\dXx])/)?.[1];
            const 手机 = txt.match( /(?:手机|电话)[号]?[:：]?(.*)/)?.[1]
            const 吨数 = txt.match( /(?:吨数|净重|重量|装车数量)[:：]?(.*)/)?.[1]?.trim()?.replaceAll('吨','')

            if(车牌?.length !== 7) console.error({车牌})
            if(司机?.length >= 4) console.error({司机})
            if(身份证?.length !== 18) console.error({身份证})
            if(手机?.length !== 11) console.error({手机})
            console.log({车牌,司机,身份证,手机,吨数})

            const supplierName = JSON.parse(localStorage.USERINFOALL).name

            await post("https://scm.imuyuan.com/api/supply_chain/supplier/door/addOrUpdateCar",{
                supplierName,
                carNum: 车牌,
                "drivingLicense": "",
                "isShow": 3,
                "operateLicense": "",
                "fileList": [],
                "riceAuctionFlag": "2",
                "type": "车辆"
            })

            await post("https://scm.imuyuan.com/api/supply_chain/supplier/door/addOrUpdateDriver", {
                supplierName,
                "driverName": 司机,
                "driverIdentityCard": 身份证,
                "driverPhone": 手机,
                "driverLicense": "",
                "fileList": [],
                "riceAuctionFlag": "2"
            })

            await 填充车牌司机($('[for="vehicleLicensePlate"]+div input'), 车牌)
            await 填充车牌司机($('[for="driverName"]+div input'), 司机)


            if(吨数){
                $('[placeholder="发运数量"]').value = 吨数
                await sleep(100)
                $('[placeholder="发运数量"]').dispatchEvent(new Event('change'))
            }

            async function 填充车牌司机(dom, val) {
                dom.dispatchEvent(new Event('focus'))
                await sleep(100)
                dom.value = val
                await sleep(100)
                dom.dispatchEvent(new Event('input'))
                await sleep(100)

                return findDom(()=>$$('li span').find(e=>e.innerText.includes(val)))
            }
        }
    }
}


window.findDom = findDom
async function findDom(fn, fn2 = dom=>dom.click()){
    const {promise, resolve} = Promise.withResolvers()
    const timer = setInterval(()=>{
        const result = fn()
        if(result){
            resolve(result)
            clearInterval(timer)
            if(fn2) fn2(result)
        }else{
        }
    }, 100)
    return promise
}
const post = window.post = (url,o)=>fetch(url, {
    "headers": {
        "authorization": localStorage.getItem("user-token"),
        "content-type": "application/json",
    },
    "body": JSON.stringify(o),
    "method": "POST",
});
localStorage.clear = ()=>{
    Object.keys(localStorage).filter(e=>!e.startsWith('__')).forEach(k=>localStorage.removeItem(k))
}


const all = {
    "玉米": {
        "豫北区域": {
            "清丰二厂": "清丰第二仓库",
            "范县二厂": "范县第二仓库",
            "内黄三厂": "内黄第三仓库",
            "内黄二厂": "内黄第二仓库",
            "内黄": "内黄仓库",
            "滑县": "滑县仓库",
            "滑县三厂": "滑县第三仓库"
        },
        "山东及聊城区域": {
            "莘县二厂": "莘县第二仓库",
            "莘县三厂": "莘县第三仓库",
            "馆陶": "馆陶仓库",
            "临邑": "临邑仓库",
            "东明": "东明仓库",
            "曹县": "曹县仓库",
            "曹县二厂": "曹县第二仓库"
        },
        "河北区域": {
            "新河": "新河仓库",
            "冀州": "冀州第二仓库",
            "广宗": "广宗仓库",
            "宁晋": "宁晋第二仓库",
            "景县": "景县第二仓库",
            "房山": "房山第二仓库"
        }
    },
    "小麦": {
        "卸车都快 豫北区域": {
            "内黄大厂": "内黄仓库",
            "内黄三厂": "内黄第三仓库",
            "内黄二厂": "内黄第二仓库",
            "馆陶": "馆陶仓库",
            "范县": "范县第二仓库",
            "清丰": "清丰第二仓库",
            "滑县三厂": "滑县第三仓库",
            "滑县大厂": "滑县仓库"
        },
        "山东及聊城区域": {
            "东明": "东明仓库",
            "曹县": "曹县仓库",
            "曹县二厂": "曹县第二仓库",
            "莘县二厂": "莘县第二仓库",
            "莘县三厂": "莘县第三仓库"
        },
        "河北区域": {
            "新河": "新河仓库",
            "冀州": "冀州第二仓库",
            "广宗": "广宗仓库"
        }
    }
}

async function get每日价格(){
    const get = (product,areaName)=>post("https://scm.imuyuan.com/api/supply_chain/bidding/myAnnouncement/getAreaPurchaseList",{
        product,
        areaName,
    }).then(e=>e.json()).then(e=>e.data.rows[0].price)

    const result = JSON.parse(JSON.stringify(all))

    for(const 玉米小麦 in result){
        const 玉米小麦v = result[玉米小麦]
        for(const 区域 in 玉米小麦v){
            const 区域v = 玉米小麦v[区域]
            for(const 厂 in 区域v){
                const v = await get(玉米小麦, 区域v[厂])
                const 上次价格 = JSON.parse(localStorage.__上次价格)
                const 上次价格v = 上次价格[玉米小麦][区域][厂]
                区域v[厂] = v
                if(v > 上次价格v) 区域v[厂] = `${v} (+${v - 上次价格v})`
                if(v < 上次价格v) 区域v[厂] = `${v} (${v - 上次价格v})`
            }
        }
    }
    localStorage.__上次价格 = JSON.stringify(result)
    return JSON.stringify(result,null,4).replaceAll(/[{}:,"]/g,'')
}


Object.defineProperty(window, '每日价格', {async get(){
    const v = await get每日价格()
    console.log(v)
    return v
}})


// 不是真正的轮询
setInterval(async ()=>{
    const v = await get每日价格()
    //console.clear()
    if(v.includes('+') || v.includes('-')){
        console.log('轮询 发现价格差异', v)
        const t = new Date().toLocaleString()
        localStorage[`__${t}`] = v
    }else{
        console.log('轮询 未发现')
    }
}, 1000 * 60 * 30)



