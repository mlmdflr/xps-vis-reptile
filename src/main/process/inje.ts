import { HandlerDetails, ipcMain } from "electron";
import Window from "../modular/window";
import { deepCopy, isNull, random, ranDom } from "@/lib/util";
import { snowflake } from "@/lib/util/snowflake";
import { JSDOM } from "jsdom";
import { Global } from "../modular/general/global";
import { readFile } from "../modular/general/file";

export function init(wid: number | bigint, rid: number | bigint) {
    const w = Window.get(wid)
    w.webContents.on('did-finish-load', async () => {
        inje(0, `
        window.ipc.send('window-message-send', {
            channel:'start-loading',
            value:'',
            isback:true,
            acceptIds:[0,1,3],
            id: ${wid}
        });
    `)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('net.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('sleep.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('path.fs.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('snowflake.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('core.js'))}`)
        let main = inje_get_example(rid)
        let img = inje_get_example(3)

        w.webContents.executeJavaScript(`
        //发送消息给工具窗口
        function windowMessageSend(
            channel,
            value,
            isback,
            acceptIds
        ) {
            window.ipc.send('window-message-send', {
            channel,
            value,
            isback,
            acceptIds,
            id: ${wid}
            });
        }
        //窗口显示
            function windowShow(time) {
                setTimeout(() => window.ipc.send('window-func', { type: 'show', id:${wid} }), time);
            }
            //窗口隐藏
            function windowHide() {
                window.ipc.send('window-func', { type: 'hide', id:${wid}});
            }
            ${main}
            ${!Window.checkId(3) ? img : ''}
        `)
    })

    w.webContents.on('did-fail-load', () => {
        inje(0, `
        window.ipc.send('window-message-send', {
            channel:'fail-load',
            value:'',
            isback:true,
            acceptIds:[0,1,3],
            id: ${wid}
        });
    `)
    })


    w.webContents.setWindowOpenHandler((details: HandlerDetails): { action: "deny" } => {
        if (details.url.startsWith('https://') || details.url.startsWith('http://')) {
            w.webContents.loadURL(details.url);
        }
        return { action: "deny" }
    })
}

async function inje(wid: number | bigint, code: string) {
    return Window.get(wid).webContents.executeJavaScript(`
        ${code}
    `)
}

function inje_get_example(rid: number | bigint) {
    return `
        (function() {
            let imgUrls= []
            for (let index = 0; index < document.images.length; index++) {
                imgUrls.push(document.images[index].src)
            }
            windowMessageSend('inje-get-example',{
                title:document.title,
                url:document.URL ,
                hisLength:window.history.length ,
                imgUrls:imgUrls,
                body:document.body.innerHTML
            },false,[${rid}]);
        })();
    `
}


export function injeOn() {
    ipcMain.handle('inje', (event, args) => { return inje(args.wid, args.code) })
    ipcMain.handle('inje-back', (event, args) => inje(args.wid, `
        window.history.back()
    `))
    ipcMain.handle('inje-forward', (event, args) => inje(args.wid, `
        window.history.forward()
    `))
    ipcMain.handle('inje-windowShow', (event, args) => inje(args.wid, `
        windowShow(args.time)
    `))
    ipcMain.handle('inje-windowHide', (event, args) => inje(args.wid, `
        windowHide()
    `))
    ipcMain.handle('inje-load-url', (event, args) => {
        if (!Window.checkId(args.wid)) {
            Window.get(args.wid).loadURL(args.url, { userAgent: args.UserAgent })
        } else {
            Window.create(
                {
                    show: false,
                    customize: {
                        id: 0,
                        url: args.url,
                        isMainWin: true
                    },
                    frame: true
                }
            );
            init(0, 1)
        }
    })
    ipcMain.handle('inje-jsdom', (event, args) => {
        let data: any[] = []
        if (!args.select || args.select?.length === 0) {
            args.select = ['source', 'img', 'video']
        }
        if (!args.attributes || args.attributes?.length === 0) {
            args.attributes = ['src', 'href']
        }
        const body = new JSDOM(args.body)
        if (args.model === '2') {
            for (const s of args.select) {
                body.window.document.querySelectorAll(s).forEach((x: HTMLElement) => {
                    const htmlStr = x.outerHTML
                    for (const a of args.attributes) {
                        let re = new RegExp(a + "=(\"|\').+?(\"|\')", "gim");
                        const arr = re.exec(htmlStr)
                        if (arr) {
                            for (let it of arr) {
                                if (it.length > 4) {
                                    it = it.substring(it.indexOf('"') + 1)
                                    it = it.substring(0, it.lastIndexOf('"'))
                                    data.push(it)
                                }
                            }
                        }
                    }
                })
            }
        } else {
            for (const s of args.select) {
                body.window.document.querySelectorAll(s).forEach((x) => {
                    for (const a of args.attributes) {
                        if (x[a]) {
                            data.push(x[a])
                        }
                    }
                })
            }
        }
        return data
    })
    ipcMain.handle('inje-get-example', (event, args) => inje_get_example(args.rid))
}
