import {
    ipcMain,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
} from 'electron'
import { Logger } from '@main/modules/logger'

import type { Scenes, Bookmark, Info, Shortcuts } from '@src/types'
import {
    Channel,
    RequestHandler,
    BROWSER,
    CURRENT_PAGE_INFO,
} from '@src/constants'

import { Status } from '@main/modules/store/status'
import { Shortcut } from '@main/modules/store/shortcut'
import { Anchors } from '@main/modules/store/anchors'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { Bookmarks } from '@main/modules/store/bookmarks'

import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'

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
        /**
         * Modifying status
         */
        if (handler === RequestHandler.MODIFY) {
            // Clear cache
            if (
                Object.prototype.hasOwnProperty.call(data, 'cacheSize') &&
                isNaN(data.cacheSize)
            ) {
                await this.browser.webContents.session.clearCache()
                await this.sendInfo()
                return
            }

            // Reset adBlocker in case it fails in some reason
            if (Object.prototype.hasOwnProperty.call(data, 'adBlockerStatus')) {
                await this.browser.setAdBlocker()
                await this.sendInfo()
                return
            }

            Status.getInstance().merge(data)

            // If adBlocker setting changed, reset.
            if (Object.prototype.hasOwnProperty.call(data, 'adBlocker')) {
                await this.browser.setAdBlocker()
                await this.sendInfo()
            }
            return
        }

        if (handler === RequestHandler.REQUEST) {
            // Request current page info
            if ((data as string) === CURRENT_PAGE_INFO) {
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

            await this.sendInfo()
        }
    }

    private onSwitch(
        _: IpcMainEvent,
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        this.switch(scene)

        if (this.isBrowser && address) {
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
                this.switch(BROWSER)
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
                Bookmarks.getInstance().update(index, bookmark)
                return
            case RequestHandler.REMOVE:
                Bookmarks.getInstance().remove(index)
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
            case RequestHandler.REQUEST: {
                const blocked = PopupBlocker.getInstance().get('blocked')
                const allowed = PopupBlocker.getInstance().get('allowed')
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
            }

            case RequestHandler.MODIFY:
                PopupBlocker.getInstance().toggle(host)
                return
        }
    }

    private async sendInfo() {
        this.centre.webContents.send(Channel.INFO, RequestHandler.RESPONSE, {
            shortcuts: Shortcut.getInstance().get('shortcuts') as Shortcuts,
            cacheSize: await this.browser.webContents.session.getCacheSize(),
            adBlockerStatus: this.browser.blocker && true,
            ...Status.getInstance().data,
        } satisfies Info)
    }
}
