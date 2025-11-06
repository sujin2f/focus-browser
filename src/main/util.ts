import { app } from 'electron'
import * as path from 'path'

import { BrowserWindow } from '@main/modules/window/window'
import { Logger } from '@main/modules/logger'

export function resolveHtmlPath(htmlFileName: string) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212
        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export const preload = path.join(__dirname, '..', 'preload.js')
export const adBlockerPreload = path.join(
    __dirname,
    '..',
    'adblocker-preload.js',
)

export const getWindow = (): BrowserWindow => {
    for (const window of BrowserWindow.getAllWindows()) {
        if (window instanceof BrowserWindow) {
            return window
        }
    }

    // I cannot expect this case because getWindow is always from BrowserView
    Logger.getInstance().error(
        'Cannot find BrowserWindow from available windows.',
    )
    app.relaunch()
    app.exit()
}
