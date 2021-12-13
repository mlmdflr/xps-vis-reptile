import { HandlerDetails, ipcMain } from "electron";
import Window from "../modular/window";
import { deepCopy, isNull, ranDom } from "@/lib/util";
import { snowflake } from "@/lib/util/snowflake";
import { JSDOM } from "jsdom";
import { Global } from "../modular/general/global";
import { readFile } from "../modular/general/file";

export function init(wid: number | bigint, rid: number | bigint) {
    const w = Window.get(wid)
    w.webContents.on('did-finish-load', async () => {

        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('net.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('path.fs.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('snowflake.js'))}`)
        w.webContents.executeJavaScript(`${await readFile(Global.getInstance().getInsidePath('core.js'))}`)
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
            ${inje_get_example(wid, rid)}
        `)
    })
    w.webContents.on('did-navigate-in-page', () => {
        inje(wid, inje_get_example(wid, rid))
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

function inje_get_example(wid: number | bigint, rid: number | bigint) {
    let rd = new snowflake(1n, 1n).nextId()
    return `
        let tit${rd} = document.title
        let url${rd} = document.URL
        let hisLength${rd} = window.history.length
        let imgLength${rd} = document.images.length
        let imgUrls${rd} = []
        for (let index = 0; index < document.images.length; index++) {
            imgUrls${rd}.push(document.images[index].src)
        }
        windowMessageSend('inje-get-example',{
            title:tit${rd},
            url:url${rd} ,
            hisLength:hisLength${rd},
            imgUrls:imgUrls${rd},
            body:document.body.innerHTML
        },false,[${rid}])
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
        Window.get(args.wid).loadURL(args.url)
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
        for (const s of args.select) {
            body.window.document.querySelectorAll(s).forEach(x => {
                for (const a of args.attributes) {
                    if (x[a]) {
                        data.push(x[a])
                    }
                }
            })
        }
        return data
    })
    ipcMain.handle('inje-get-example', (event, args) => inje_get_example(args.wid, args.rid))
}
