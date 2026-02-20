import {
    ipcMain,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
    type ContextMenuParams,
} from 'electron'
import { Logger } from '@src/common/logger'
import {
    IPC_CHANNELS,
    REQUEST_HANDLER,
    BROWSER,
    LogTypes,
    MainEventTypes,
    CENTRE_PAGES,
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
import type {
    T_Bookmark,
    T_Status_Props,
    T_Cleaner,
    T_IPC_Status,
    T_IPC_Switch,
    T_IPC_Message,
} from '@src/common/types'

/**
 * All starts with here
 */
export abstract class AbsWindowIPC extends AbsWindowMenu {
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        ipcMain.on(IPC_CHANNELS.STATUS, this.onStatus.bind(this))
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
                this.switch({ scene: params[0] as CENTRE_PAGES })
                return

            case MainEventTypes.TITLE:
                this.title = params[0] as string
                return
        }
    }

    private onLog(
        _: IpcMainEvent,
        __: REQUEST_HANDLER,
        arg: [LogTypes, unknown[]],
    ) {
        const [type, params] = arg
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

    private onFind(_: IpcMainEvent, handler: REQUEST_HANDLER, text: string) {
        if (handler !== REQUEST_HANDLER.REQUEST) {
            return
        }

        this.findText = text
        if (this.findText) {
            this.browser.webContents.findInPage(this.findText, {
                findNext: true,
            })
        }
    }

    private async onStatus(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        request: T_IPC_Status,
    ) {
        Logger.getInstance().info(
            `IPC onStatus: ${handler}, ${JSON.stringify(request)}`,
        )

        /**
         * Modifying status
         */
        if (handler === REQUEST_HANDLER.MODIFY && request.data) {
            const status = new Status()
            status.merge(request.data)
            status.save()

            // If adBlocker setting changed, reset.
            if (
                Object.prototype.hasOwnProperty.call(request.data, 'adBlocker')
            ) {
                await this.browser.setAdBlocker()
            }

            this.sendResult(IPC_CHANNELS.STATUS)
            return
        }

        if (handler === REQUEST_HANDLER.REQUEST && request.request) {
            await this.sendStatus(...request.request)
        }
    }

    private async onSwitch(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        request: T_IPC_Switch,
    ) {
        Logger.getInstance().info(
            `IPC onSwitch: ${handler}, ${JSON.stringify(request)}`,
        )

        if (
            handler !== REQUEST_HANDLER.REMOVE &&
            handler !== REQUEST_HANDLER.EXECUTE
        ) {
            return
        }

        // Visit Anchor
        if (handler === REQUEST_HANDLER.REMOVE && request.address) {
            const anchors = new Anchors()
            anchors.remove(request.address)
            anchors.save()
        }

        this.switch(request)
    }

    private onHistory(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        history: T_Bookmark[],
    ) {
        switch (handler) {
            case REQUEST_HANDLER.REQUEST:
                this.centre.send(
                    IPC_CHANNELS.HISTORY,
                    REQUEST_HANDLER.RESPONSE,
                    this.browser.webContents.navigationHistory.getAllEntries() as T_Bookmark[],
                )
                return

            case REQUEST_HANDLER.EXECUTE:
                this.switch({ scene: BROWSER })
                this.browser.webContents.navigationHistory.goToIndex(
                    parseInt(history[0].id),
                )
                return

            case REQUEST_HANDLER.REMOVE:
                this.browser.webContents.navigationHistory.clear()
                this.sendResult(IPC_CHANNELS.HISTORY)
                return
        }
    }

    private onBookmarks(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        bookmarks: T_Bookmark[],
    ) {
        const store = new Bookmarks()
        const sendBookmarks = (handler: REQUEST_HANDLER) => {
            const bookmarks = store.get()
            Logger.getInstance().info(`IPC sendBookmarks: ${bookmarks.length}`)
            this.centre.send(IPC_CHANNELS.BOOKMARK, handler, bookmarks)
        }

        switch (handler) {
            case REQUEST_HANDLER.REQUEST:
                sendBookmarks(REQUEST_HANDLER.RESPONSE)
                return
            case REQUEST_HANDLER.ADD:
                store.push(bookmarks[0])
                store.save()
                sendBookmarks(REQUEST_HANDLER.RESPONSE_SUCCESS)
                return
            case REQUEST_HANDLER.MODIFY:
                store.update(bookmarks[0])
                store.save()
                sendBookmarks(REQUEST_HANDLER.RESPONSE_SUCCESS)
                return
            case REQUEST_HANDLER.REMOVE: {
                if (!bookmarks[0].id) {
                    sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL)
                    return
                }
                const result = store.remove(bookmarks[0].id)
                if (result) {
                    store.save()
                    sendBookmarks(REQUEST_HANDLER.RESPONSE_SUCCESS)
                    return
                }
                sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL)
                return
            }
        }
    }

    private onAnchors(_: IpcMainEvent, handler: REQUEST_HANDLER) {
        const anchors = new Anchors()
        switch (handler) {
            case REQUEST_HANDLER.REQUEST:
                this.centre.send(
                    IPC_CHANNELS.ANCHOR,
                    REQUEST_HANDLER.RESPONSE,
                    anchors.get(),
                )
                return
        }
    }

    private onPopupBlocker(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        hosts: [string[]],
    ) {
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                this.sendPopupBlocker()
                return
            }

            case REQUEST_HANDLER.MODIFY: {
                const popupBlocker = PopupBlocker.getInstance()
                popupBlocker.toggle(hosts[0][0])
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
        this.centre.send(IPC_CHANNELS.POPUP_BLOCKER, REQUEST_HANDLER.RESPONSE, [
            Array.from(blocked),
            Array.from(allowed),
        ])
    }

    private async sendStatus(...requests: (keyof T_Status_Props)[]) {
        const response: T_Status_Props = {}
        const status = new Status().data

        if (requests.includes('maxHistory')) {
            response.maxHistory = status.maxHistory
        }

        if (requests.includes('adBlocker')) {
            response.adBlocker = status.adBlocker
        }

        if (requests.includes('adBlockerStatus')) {
            response.adBlockerStatus = this.browser.blocker && true
        }

        if (requests.includes('title')) {
            response.title = this.browser.webContents.getTitle()
        }

        if (requests.includes('url')) {
            response.url = this.browser.webContents.getURL()
        }

        if (requests.includes('searchEngine')) {
            response.searchEngine = status.searchEngine
        }

        Logger.getInstance().info('IPC sending: ', response)

        this.centre.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.RESPONSE, {
            data: response,
        })
    }

    private async onKeystrokes(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        keystrokes: Record<string, string>,
    ) {
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                this.centre.send(
                    IPC_CHANNELS.KEYSTROKES,
                    REQUEST_HANDLER.RESPONSE,
                    Keystrokes.getInstance().getKeystrokes(),
                )

                return
            }

            case REQUEST_HANDLER.MODIFY: {
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
        handler: REQUEST_HANDLER,
        shortcuts: Record<string, string>,
    ) {
        const store = new Shortcut()
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                this.centre.send(
                    IPC_CHANNELS.SHORTCUTS,
                    REQUEST_HANDLER.RESPONSE,
                    store.getShortcuts(),
                )
                return
            }

            case REQUEST_HANDLER.MODIFY: {
                store.update(shortcuts)
                store.save()
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
        handler: REQUEST_HANDLER,
        { request: key }: T_Cleaner,
    ) {
        const send = async (updated: boolean = false) => {
            const cacheSize =
                await this.browser.webContents.session.getCacheSize()
            const anchors = Object.keys(new Anchors().get()).length
            const history =
                this.browser.webContents.navigationHistory.getAllEntries()
                    .length
            const popup = PopupBlocker.getInstance().get('blocked')
            const indexedDB = getIndexedDBSize()

            this.centre.send(
                IPC_CHANNELS.CLEANER,
                updated
                    ? REQUEST_HANDLER.RESPONSE_SUCCESS
                    : REQUEST_HANDLER.RESPONSE,
                {
                    response: {
                        cacheSize,
                        anchors,
                        history,
                        popup: Array.from(popup).length,
                        indexedDB,
                    },
                },
            )
        }

        switch (handler) {
            case REQUEST_HANDLER.REQUEST:
                send()
                return
            case REQUEST_HANDLER.REMOVE:
                switch (key) {
                    case 'cacheSize':
                        await this.browser.webContents.session.clearCache()
                        send(true)
                        return

                    case 'indexedDB':
                        removeIndexedDB()
                        send(true)
                        return

                    case 'anchor': {
                        const anchors = new Anchors()
                        anchors.clear()
                        send(true)
                        return
                    }

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
        // this.centre.send(channel, REQUEST_HANDLER.RESULT, result)
        this.centre.send(
            channel as keyof T_IPC_Message,
            result
                ? REQUEST_HANDLER.RESPONSE_SUCCESS
                : REQUEST_HANDLER.RESPONSE_FAIL,
        )
    }
}
