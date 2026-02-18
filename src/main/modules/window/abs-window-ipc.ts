import {
    ipcMain,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
    type ContextMenuParams,
} from 'electron'
import { Logger } from '@src/common/logger'
import {
    IPC_CHANNELS,
    RequestHandler,
    BROWSER,
    LogTypes,
    MainEventTypes,
    CENTRE_PAGES,
    NAVIGATION,
} from '@src/common/constants'

import { Status } from '@main/modules/store/status'
import { Anchors } from '@main/modules/store/anchors'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { Bookmarks } from '@main/modules/store/bookmarks'
import { Shortcut } from '@main/modules/store/shortcut'
import { Keystrokes } from '@main/modules/store/keystrokes'

import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'
import { isBeta, isTest } from '@src/common/utils'
import { getIndexedDBSize, removeIndexedDB } from '@src/main/utils'
/* T_Types */
import type { Scenes, T_Bookmark, Info, T_Cleaner } from '@src/common/types'

/**
 * All starts with here
 */
export abstract class AbsWindowIPC extends AbsWindowMenu {
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        ipcMain.on(IPC_CHANNELS.INFO, this.onInfo.bind(this))
        ipcMain.on(IPC_CHANNELS.SWITCH, this.onSwitch.bind(this))
        ipcMain.on(IPC_CHANNELS.HISTORY, this.onHistory.bind(this))
        ipcMain.on(IPC_CHANNELS.BOOKMARK, this.onBookmarks.bind(this))
        ipcMain.on(IPC_CHANNELS.ANCHOR, this.onAnchors.bind(this))
        ipcMain.on(IPC_CHANNELS.POPUP_BLOCKER, this.onPopupBlocker.bind(this))
        ipcMain.on(IPC_CHANNELS.FIND, this.onFind.bind(this))
        ipcMain.on(IPC_CHANNELS.MAIN_PROCESS, this.onMainProcess.bind(this))
        ipcMain.on(IPC_CHANNELS.KEYSTROKES, this.onKeystrokes.bind(this))
        ipcMain.on(IPC_CHANNELS.SHORTCUTS, this.onShortcuts.bind(this))
        ipcMain.on(IPC_CHANNELS.CLEANER, this.onCleaner.bind(this))

        if (isBeta() && !isTest()) {
            ipcMain.on(IPC_CHANNELS.LOG, this.onLog.bind(this))
        }
    }

    private onMainProcess(
        _: IpcMainEvent,
        type: MainEventTypes,
        ...params: unknown[]
    ) {
        Logger.getInstance().log(
            `Main Process : ${type} ${JSON.stringify(params)}`,
        )
        switch (type) {
            case MainEventTypes.CONTEXT_MENU:
                this.showContextMenu(params[0] as ContextMenuParams)
                return

            case MainEventTypes.SWITCH:
                this.switch(params[0] as CENTRE_PAGES)
                return

            case MainEventTypes.TITLE:
                this.title = params[0] as string
                return
        }
    }

    private onLog(_: IpcMainEvent, type: LogTypes, ...params: unknown[]) {
        switch (type) {
            case LogTypes.ERROR:
                Logger.getInstance().error(...params)
                break
            case LogTypes.INFO:
                Logger.getInstance().info(...params)
                break
            case LogTypes.LOG:
                Logger.getInstance().log(...params)
                break
            case LogTypes.WARN:
                Logger.getInstance().warn(...params)
                break
        }
    }

    private onFind(_: IpcMainEvent, handler: RequestHandler, text: string) {
        if (handler !== RequestHandler.REQUEST) {
            return
        }

        this.findText = text
        if (this.findText) {
            this.browser.webContents.findInPage(this.findText, {
                findNext: true,
            })
        }
    }

    private async onInfo(
        _: IpcMainEvent,
        handler: RequestHandler,
        data: Partial<Info>,
        ...requestKeys: (keyof Info)[]
    ) {
        /**
         * Modifying status
         */
        if (handler === RequestHandler.MODIFY) {
            const status = Status.getInstance()
            status.merge(data)
            status.save()

            // If adBlocker setting changed, reset.
            if (Object.prototype.hasOwnProperty.call(data, 'adBlocker')) {
                await this.browser.setAdBlocker()
            }

            this.sendResult(IPC_CHANNELS.INFO)
            return
        }

        if (handler === RequestHandler.REQUEST) {
            await this.sendInfo(data as string as keyof Info, ...requestKeys)
        }
    }

    private async onSwitch(
        _: IpcMainEvent,
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        // TODO callback
        if (handler === RequestHandler.REMOVE && address) {
            Anchors.getInstance().remove(address)
            Anchors.getInstance().save()
        }

        if (address) {
            this.browser.initialized = true
            this.title = 'Loading...'
            if (address === 'reload') {
                this.browser.reload()
            } else if (address === NAVIGATION.LAST_VISIT) {
                await this.browser.loadLastVisit()
            } else if (address === NAVIGATION.SEARCH_ENGINE) {
                this.browser.searchKeyword('')
            } else {
                this.browser.loadURL(address)
            }
        }
        this.switch(scene)
    }

    private onHistory(_: IpcMainEvent, handler: RequestHandler, index: number) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
                    IPC_CHANNELS.HISTORY,
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
                this.sendResult(IPC_CHANNELS.HISTORY)
                return
        }
    }

    private onBookmarks(
        _: IpcMainEvent,
        handler: RequestHandler,
        bookmark: T_Bookmark,
        index: number,
    ) {
        const bookmarks = Bookmarks.getInstance()
        const sendBookmarks = (updated: boolean = false) => {
            this.centre.webContents.send(
                IPC_CHANNELS.BOOKMARK,
                RequestHandler.RESPONSE,
                bookmarks.get(),
                updated,
            )
        }

        switch (handler) {
            case RequestHandler.REQUEST:
                sendBookmarks()
                return
            case RequestHandler.ADD:
                bookmarks.push(bookmark)
                bookmarks.save()
                sendBookmarks(true)
                return
            case RequestHandler.MODIFY:
                bookmarks.update(index, bookmark)
                bookmarks.save()
                sendBookmarks(true)
                return
            case RequestHandler.REMOVE:
                bookmarks.remove(index)
                bookmarks.save()
                sendBookmarks(true)
                return
        }
    }

    private onAnchors(_: IpcMainEvent, handler: RequestHandler, url: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
                    IPC_CHANNELS.ANCHOR,
                    RequestHandler.RESPONSE,
                    Anchors.getInstance().get(),
                )
                return

            case RequestHandler.REMOVE:
                Anchors.getInstance().remove(url)
                Anchors.getInstance().save()
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
                this.sendPopupBlocker()
                return
            }

            case RequestHandler.MODIFY: {
                const popupBlocker = PopupBlocker.getInstance()
                popupBlocker.toggle(host)
                popupBlocker.save()
                this.sendPopupBlocker()
                return
            }
        }
    }

    private sendPopupBlocker() {
        const blocked = PopupBlocker.getInstance().get('blocked')
        const allowed = PopupBlocker.getInstance().get('allowed')
        Logger.getInstance().log('Popup blocker request: ', blocked, allowed)
        this.centre.webContents.send(
            IPC_CHANNELS.POPUP_BLOCKER,
            RequestHandler.RESPONSE,
            Array.from(blocked),
            Array.from(allowed),
        )
    }

    private async sendInfo(...requests: (keyof Info)[]) {
        const info: Partial<Info> = {}
        const status = Status.getInstance().data

        if (requests.includes('maxHistory')) {
            info.maxHistory = status.maxHistory
        }

        if (requests.includes('adBlocker')) {
            info.adBlocker = status.adBlocker
        }

        if (requests.includes('adBlockerStatus')) {
            info.adBlockerStatus = this.browser.blocker && true
        }

        if (requests.includes('title')) {
            info.title = this.browser.webContents.getTitle()
        }

        if (requests.includes('url')) {
            info.url = this.browser.webContents.getURL()
        }

        if (requests.includes('searchEngine')) {
            info.searchEngine = status.searchEngine
        }

        Logger.getInstance().info(`IPC sending: ${JSON.stringify(info)}`)

        this.centre.webContents.send(
            IPC_CHANNELS.INFO,
            RequestHandler.RESPONSE,
            info,
        )
    }

    private async onKeystrokes(
        _: IpcMainEvent,
        handler: RequestHandler,
        keystrokes: Record<string, string>,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST: {
                this.centre.webContents.send(
                    IPC_CHANNELS.KEYSTROKES,
                    RequestHandler.RESPONSE,
                    Keystrokes.getInstance().getKeystrokes(),
                )

                return
            }

            case RequestHandler.MODIFY: {
                Logger.getInstance().info('Keystroke modification accepted.')
                const host = Object.keys(keystrokes)[0]
                if (!host) {
                    Logger.getInstance().error('Keystroke modification failed.')
                    this.sendResult(IPC_CHANNELS.KEYSTROKES, false)

                    return
                }
                const keystroke = Object.values(keystrokes)[0]
                Keystrokes.getInstance().update(host, keystroke)
                Keystrokes.getInstance().save()

                Logger.getInstance().error('Keystroke modification done.')
                this.sendResult(IPC_CHANNELS.KEYSTROKES)
                return
            }
        }
    }

    private async onShortcuts(
        _: IpcMainEvent,
        handler: RequestHandler,
        shortcuts: Record<string, string>,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST: {
                this.centre.webContents.send(
                    IPC_CHANNELS.SHORTCUTS,
                    RequestHandler.RESPONSE,
                    Shortcut.getInstance().getShortcuts(),
                )
                return
            }

            case RequestHandler.MODIFY: {
                Shortcut.getInstance().update(shortcuts)
                Shortcut.getInstance().save()
                this.resetMenu()
                this.sendResult(IPC_CHANNELS.SHORTCUTS)
                return
            }
        }
    }

    /**
     * Clear cache, indexedDB, anchor, history, and blocked popup info
     *
     * @param _
     * @param handler
     * @returns
     */
    private async onCleaner(
        _: IpcMainEvent,
        handler: RequestHandler,
        key: string,
    ) {
        const send = async (updated: boolean = false) => {
            const cacheSize =
                await this.browser.webContents.session.getCacheSize()
            const anchors = Object.keys(Anchors.getInstance().get()).length
            const history =
                this.browser.webContents.navigationHistory.getAllEntries()
                    .length
            const popup = PopupBlocker.getInstance().get('blocked')
            const indexedDB = getIndexedDBSize()

            this.centre.webContents.send(
                IPC_CHANNELS.CLEANER,
                RequestHandler.RESPONSE,
                {
                    cacheSize,
                    anchors,
                    history,
                    popup: Array.from(popup).length,
                    indexedDB,
                } satisfies T_Cleaner,
                updated,
            )
        }

        switch (handler) {
            case RequestHandler.REQUEST:
                send()
                return
            case RequestHandler.REMOVE:
                switch (key) {
                    case 'cacheSize':
                        await this.browser.webContents.session.clearCache()
                        send(true)
                        return

                    case 'indexedDB':
                        removeIndexedDB()
                        send(true)
                        return

                    case 'anchor':
                        Anchors.getInstance().clear()
                        send(true)
                        return

                    case 'history':
                        this.browser.webContents.navigationHistory.clear()
                        send(true)
                        return

                    case 'popups':
                        PopupBlocker.getInstance().clear()
                        send(true)
                        return
                }
                return
        }
    }

    private sendResult(channel: IPC_CHANNELS, result = true) {
        this.centre.webContents.send(channel, RequestHandler.RESULT, result)
    }
}
