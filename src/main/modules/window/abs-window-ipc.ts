import {
    ipcMain,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
} from 'electron'
import Logger from '@main/modules/logger'

import {
    Channel,
    RequestHandler,
    SceneBrowser,
    type Scenes,
    type Bookmark,
    type Info,
} from '@src/types'

import Status from '@main/modules/store/status'
import Shortcut from '@main/modules/store/shortcut'
import Anchors from '@main/modules/store/anchors'
import Popup from '@main/modules/store/popup'
import Bookmarks from '@main/modules/store/bookmarks'

import { AbsWindowMenu } from './abs-window-menu'

/**
 * All starts with here
 */
export abstract class AbsWindowIPC extends AbsWindowMenu {
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        ipcMain.on(Channel.INFO, this.onInfo.bind(this))
        ipcMain.on(Channel.SWITCH, this.onSwitch.bind(this))
        ipcMain.on(Channel.HISTORY, this.onHistory.bind(this))
        ipcMain.on(Channel.BOOKMARK, this.onBookmarks.bind(this))
        ipcMain.on(Channel.ANCHOR, this.onAnchors.bind(this))
        ipcMain.on(Channel.POPUP_BLOCKER, this.onPopupBlocker.bind(this))
    }

    private async onInfo(
        _: IpcMainEvent,
        handler: RequestHandler,
        data: Partial<Info>,
    ) {
        if (handler === RequestHandler.MODIFY) {
            Status.getInstance().merge(data)
            return
        }

        if (handler === RequestHandler.REQUEST) {
            if (data) {
                this.centre.webContents.send(
                    Channel.INFO,
                    RequestHandler.RESPONSE,
                    {
                        title: this.browser.webContents.getTitle(),
                        url: this.browser.webContents.getURL(),
                    },
                )
                return
            }

            this.centre.webContents.send(
                Channel.INFO,
                RequestHandler.RESPONSE,
                {
                    shortcuts: Shortcut.getInstance().get('shortcuts'),
                    cache: await this.browser.webContents.session.getCacheSize(),
                    ...Status.getInstance().data,
                },
            )
        }
    }

    private onSwitch(
        _: IpcMainEvent,
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        this.switch(scene)

        if (scene === SceneBrowser.BROWSER && address) {
            this.title = 'Loading...'
            if (address === 'reload') {
                this.browser.reload()
                return
            }
            this.browser.loadURL(address)
        }

        if (handler === RequestHandler.REMOVE) {
            Anchors.getInstance().remove(address)
        }
    }

    private onHistory(_: IpcMainEvent, handler: RequestHandler, index: number) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
                    Channel.HISTORY,
                    RequestHandler.RESPONSE,
                    this.browser.webContents.navigationHistory.getAllEntries(),
                )
                return

            case RequestHandler.EXECUTE:
                this.switch(SceneBrowser.BROWSER)
                this.browser.webContents.navigationHistory.goToIndex(index)
                return

            case RequestHandler.REMOVE:
                this.browser.webContents.navigationHistory.clear()
                return
        }
    }

    private onBookmarks(
        _: IpcMainEvent,
        handler: RequestHandler,
        bookmark: Bookmark,
        index: number,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
                    Channel.BOOKMARK,
                    RequestHandler.RESPONSE,
                    Bookmarks.getInstance().get(),
                )
                return
            case RequestHandler.ADD:
                Bookmarks.getInstance().push(bookmark)
                return
            case RequestHandler.MODIFY:
                Bookmarks.getInstance().edit(index, bookmark)
                return
            case RequestHandler.REMOVE:
                Bookmarks.getInstance().remove(bookmark as unknown as number)
                return
        }
    }

    private onAnchors(_: IpcMainEvent, handler: RequestHandler, url: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
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

    private onPopupBlocker(
        _: IpcMainEvent,
        handler: RequestHandler,
        host: string,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST:
                const blocked = Popup.getInstance().get('blocked')
                const allowed = Popup.getInstance().get('allowed')
                Logger.getInstance().log(
                    'Popup blocker request: ',
                    blocked,
                    allowed,
                )
                this.centre.webContents.send(
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
