import { ipcMain, type BaseWindowConstructorOptions } from 'electron'

import {
    Channel,
    RequestHandler,
    SceneBrowser,
    type Scenes,
    type Bookmark,
    type Info,
} from '@src/types'

import Status from '@main/modules/store/status'
import Bookmarks from '@main/modules/store/bookmarks'
import Anchors from '@main/modules/store/anchors'

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
    }

    private onInfo(
        _: Electron.IpcMainEvent,
        handler: RequestHandler,
        data: Partial<Info>,
    ) {
        if (handler === RequestHandler.MODIFY) {
            Status.getInstance().merge(data)
            return
        }

        if (handler === RequestHandler.REQUEST) {
            if (data) {
                this.centre.sendLocation(
                    this.browser.webContents.getTitle(),
                    this.browser.webContents.getURL(),
                )
                return
            }
            this.centre.sendInfo(
                this.browser.webContents.session.getCacheSize(),
            )
        }
    }

    private onSwitch(
        _: Electron.IpcMainEvent,
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        this.switch(scene)

        if (scene === SceneBrowser.BROWSER && address) {
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

    private onHistory(
        _: Electron.IpcMainEvent,
        handler: RequestHandler,
        index: number,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.sendHistory(
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
        _: Electron.IpcMainEvent,
        handler: RequestHandler,
        bookmark: Bookmark,
        index: number,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.sendBookmarks()
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
}
