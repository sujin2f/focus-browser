import { WebContents, ipcMain } from 'electron'
import * as path from 'path'
import { Channel } from '@src/types'

export function resolveHtmlPath(htmlFileName: string) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212
        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

export const preload = path.join(__dirname, '..', 'preload.js')
export const adBlockerPreload = path.join(
    __dirname,
    '..',
    'adblocker-preload.js',
)

export const message = {
    on: (channel: Channel, callback: (...args: unknown[]) => void) => {
        ipcMain.on(channel, async (_, ...args: unknown[]) => {
            callback(...args)
        })
    },
    send: (webContents: WebContents, channel: Channel, ...args: unknown[]) => {
        webContents.send(channel, ...args)
    },
}
