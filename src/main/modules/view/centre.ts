import {
    WebContentsView,
    type WebContentsViewConstructorOptions,
    type NavigationEntry,
    ipcMain,
} from 'electron'

import { Channel, RequestHandler } from '@src/types'
import Logger from '@main/modules/logger'

import Status from '@main/modules/store/status'
import Shortcut from '@main/modules/store/shortcut'
import Anchors from '@main/modules/store/anchors'
import Popup from '@main/modules/store/popup'
import Bookmarks from '@main/modules/store/bookmarks'

export class CentreView extends WebContentsView {
    constructor(options: WebContentsViewConstructorOptions) {
        super(options)
        ipcMain.on(Channel.ANCHOR, this.onAnchors.bind(this))
        ipcMain.on(Channel.POPUP_BLOCKER, this.onPopupBlocker.bind(this))
    }
    /**
     * IPC
     */
    public async sendInfo(cache: Promise<number>) {
        this.webContents.send(Channel.INFO, RequestHandler.RESPONSE, {
            shortcuts: Shortcut.getInstance().get('shortcuts'),
            cache: await cache,
            ...Status.getInstance().data,
        })
    }

    public async sendLocation(title: string, url: string) {
        this.webContents.send(Channel.INFO, RequestHandler.RESPONSE, {
            title,
            url,
        })
    }

    public sendHistory(entries: NavigationEntry[]) {
        this.webContents.send(Channel.HISTORY, RequestHandler.RESPONSE, entries)
    }

    public sendBookmarks() {
        this.webContents.send(
            Channel.BOOKMARK,
            RequestHandler.RESPONSE,
            Bookmarks.getInstance().get(),
        )
    }

    private onAnchors(handler: RequestHandler, url: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.webContents.send(
                    Channel.ANCHOR,
                    RequestHandler.RESPONSE,
                    Anchors.getInstance().get(),
                )
                return

            case RequestHandler.REMOVE:
                Anchors.getInstance().remove(url)
                return
        }
    }

    private onPopupBlocker(handler: RequestHandler, host: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                const blocked = Popup.getInstance().get('blocked')
                const allowed = Popup.getInstance().get('allowed')
                Logger.getInstance().log(
                    'Popup blocker request: ',
                    blocked,
                    allowed,
                )
                this.webContents.send(
                    Channel.POPUP_BLOCKER,
                    RequestHandler.RESPONSE,
                    Array.from(blocked as string[]),
                    Array.from(allowed as string[]),
                )
                return

            case RequestHandler.MODIFY:
                Popup.getInstance().toggle(host)
                return
        }
    }
}
