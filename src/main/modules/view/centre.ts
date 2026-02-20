import {
    WebContentsView,
    type WebContentsViewConstructorOptions,
} from 'electron'

import { CENTRE_PAGES, REQUEST_HANDLER } from '@src/common/constants'

import { resolveHtmlPath } from '@src/main/utils'
import { T_IPC_Message } from '@src/common/types'

export class CenterView extends WebContentsView {
    constructor(options: WebContentsViewConstructorOptions) {
        super(options)
        this.loadScene(CENTRE_PAGES.WELCOME)
    }

    public loadScene(scene: CENTRE_PAGES) {
        switch (scene) {
            case CENTRE_PAGES.WELCOME:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.WELCOME))
                return
            case CENTRE_PAGES.HOME:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.HOME))
                return
            case CENTRE_PAGES.ADDRESS:
                this.webContents.loadURL(
                    `${resolveHtmlPath(CENTRE_PAGES.HOME)}?address=true`,
                )
                return
            case CENTRE_PAGES.BOOKMARK:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.BOOKMARK))
                return
            case CENTRE_PAGES.ANCHOR:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.ANCHOR))
                return
            case CENTRE_PAGES.POPUP_BLOCKER:
                this.webContents.loadURL(
                    resolveHtmlPath(CENTRE_PAGES.POPUP_BLOCKER),
                )
                return
            case CENTRE_PAGES.FIND:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.FIND))
                return
            case CENTRE_PAGES.OFFLINE:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.OFFLINE))
                return
            default:
                this.webContents.loadURL(resolveHtmlPath(CENTRE_PAGES.HOME))
        }
    }

    public send<T extends keyof T_IPC_Message>(
        channel: T,
        handler: REQUEST_HANDLER,
        arg?: T_IPC_Message[T],
    ) {
        this.webContents.send(channel, handler, arg)
    }
}
