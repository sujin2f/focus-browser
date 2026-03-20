import {
    ipcMain,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
    type ContextMenuParams,
} from 'electron'
/* Models */
import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'
import { Logger } from '@src/common/logger'
import { Status } from '@main/store/status'
import { PopupBlocker } from '@main/store/popup-blocker'
import { Shortcut } from '@main/store/shortcut'
import { Keystrokes } from '@main/store/keystrokes'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    REQUEST_HANDLER,
    BROWSER,
    LogTypes,
    MainEventTypes,
    CENTRE_PAGES,
    EMOJI,
} from '@src/common/constants'
/* Utils */
import { canLog } from '@src/common/utils/common'
import {
    getCleanerSizes,
    removeIndexedDB,
} from '@src/child-process/entries/cleaner'
import * as cloud from '@src/child-process/entries/cloud'
import { responseBookmarks } from '@src/child-process/entries/bookmark'
import { responseAnchors } from '@src/child-process/entries/anchor'
import { fetchAndSendFavicon } from '@src/child-process/entries/favicon'
/* T_Types */
import type { T_Status_Props, T_Cleaner, T_Cloud_Item } from '@src/common/types'
import type {
    T_IPC_Switch,
    T_IPC_Status,
    T_IPC_Message,
    T_IPC_Data,
    T_IPC_Context,
} from '@src/common/types/ipc'
import type { T_Bookmark } from '@src/common/types/store'

/**
 * All starts with here
 */
export abstract class AbsWindowIPC extends AbsWindowMenu {
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        ipcMain.on(IPC_CHANNELS.STATUS, this.onStatus.bind(this))
        ipcMain.on(IPC_CHANNELS.SWITCH, this.onSwitch.bind(this))
        ipcMain.on(IPC_CHANNELS.HISTORY, this.onHistory.bind(this))
        /**
         * @deprecated
         */
        ipcMain.on(IPC_CHANNELS.BOOKMARK, (_, handler) => {
            this.onBookmarks(handler)
        })
        ipcMain.on(IPC_CHANNELS.ANCHOR, this.onAnchors.bind(this))
        ipcMain.on(IPC_CHANNELS.POPUP_BLOCKER, this.onPopupBlocker.bind(this))
        ipcMain.on(IPC_CHANNELS.FIND, this.onFind.bind(this))
        ipcMain.on(IPC_CHANNELS.MAIN_PROCESS, this.onMainProcess.bind(this))
        ipcMain.on(IPC_CHANNELS.KEYSTROKES, this.onKeystrokes.bind(this))
        ipcMain.on(IPC_CHANNELS.SHORTCUTS, this.onShortcuts.bind(this))
        ipcMain.on(IPC_CHANNELS.CLEANER, this.onCleaner.bind(this))
        ipcMain.on(IPC_CHANNELS.CLOUD, this.onCloud.bind(this))
        ipcMain.on(IPC_CHANNELS.FAVICON, this.onFavicon.bind(this))
        ipcMain.on(IPC_CHANNELS.CONTEXT, this.onContext.bind(this))

        if (canLog()) {
            ipcMain.on(IPC_CHANNELS.LOG, this.onLog.bind(this))
        }
    }

    private onMainProcess(
        _: IpcMainEvent,
        type: MainEventTypes,
        ...params: unknown[]
    ) {
        Logger.init().log(`Main Process : ${type} ${JSON.stringify(params)}`)
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
                Logger.init().error(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.INFO:
                Logger.init().info(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.LOG:
                Logger.init().log(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.WARN:
                Logger.init().warn(EMOJI.CENTRE, ' ', ...params)
                break
        }
    }

    private onFind(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        {
            text,
            forward,
            stop,
            reset,
        }: { text: string; forward?: boolean; stop?: boolean; reset?: boolean },
    ) {
        if (handler === REQUEST_HANDLER.RESPONSE) return

        if (stop) {
            this.stopFindInPage()
            return
        }
        if (reset) {
            this.findInPage('', false, true)
            return
        }

        this.findInPage(text, Boolean(forward))
    }

    private async onStatus(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        request: T_IPC_Status,
    ) {
        Logger.init().info(
            `IPC onStatus: ${handler}, ${JSON.stringify(request)}`,
        )

        /**
         * Modifying status
         */
        if (handler === REQUEST_HANDLER.MODIFY && request.data) {
            const status = Status.getInstance()
            status.merge(request.data)
            status.save()

            // If adBlocker setting changed, reset.
            if (
                Object.prototype.hasOwnProperty.call(request.data, 'adBlocker')
            ) {
                Logger.init().log(
                    'adBlocker setting changed: ',
                    status.get('adBlocker'),
                )
                await this.browser.setAdBlocker()
            }
        }

        if (request.request) {
            await this.sendStatus(...request.request)
        }
    }

    private async onSwitch(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        request: T_IPC_Switch,
    ) {
        Logger.init().info(
            `IPC onSwitch: ${handler}, ${JSON.stringify(request)}`,
        )

        this.switch(request)
    }

    private onHistory(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        history: T_Bookmark[] | number,
    ) {
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                const response =
                    this.browser.webContents.navigationHistory.getAllEntries() as T_Bookmark[]
                this.centre.send(
                    IPC_CHANNELS.HISTORY,
                    REQUEST_HANDLER.RESPONSE,
                    response,
                )
                return
            }
            case REQUEST_HANDLER.EXECUTE:
                // 🤬 Invalid request
                if (typeof history !== 'number') return
                this.switch({ scene: BROWSER })
                this.browser.webContents.navigationHistory.goToIndex(history)
                return
        }
    }

    /**
     * @deprecated
     */
    private async onBookmarks(handler: REQUEST_HANDLER) {
        if (handler === REQUEST_HANDLER.REQUEST) responseBookmarks(this.centre)
    }

    /**
     * @deprecated
     */
    private onAnchors(_: IpcMainEvent, handler: REQUEST_HANDLER) {
        if (handler === REQUEST_HANDLER.REQUEST) responseAnchors(this.centre)
    }

    private onPopupBlocker(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        hosts: [string[]],
    ) {
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                this.sendPopupBlocker(REQUEST_HANDLER.RESPONSE)
                return
            }

            case REQUEST_HANDLER.MODIFY: {
                // TODO Fail
                const popupBlocker = PopupBlocker.getInstance()
                popupBlocker.toggle(hosts[0][0])
                popupBlocker.save()
                this.sendPopupBlocker(REQUEST_HANDLER.RESPONSE_SUCCESS)
                return
            }
        }
    }

    private sendPopupBlocker(handler: REQUEST_HANDLER) {
        const blocked = PopupBlocker.getInstance().get('blocked')
        const allowed = PopupBlocker.getInstance().get('allowed')
        Logger.init().log(
            'Popup blocker request: ',
            Array.from(blocked),
            Array.from(allowed),
        )
        this.centre.send(IPC_CHANNELS.POPUP_BLOCKER, handler, [
            Array.from(blocked),
            Array.from(allowed),
        ])
    }

    private async sendStatus(...requests: (keyof T_Status_Props)[]) {
        const response: T_Status_Props = {}
        const status = Status.getInstance()

        if (requests.includes('maxHistory')) {
            response.maxHistory = status.data.maxHistory
        }

        if (requests.includes('adBlocker')) {
            response.adBlocker = status.data.adBlocker
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
            response.searchEngine = status.data.searchEngine
        }

        if (requests.includes('userInfo')) {
            response.userInfo = await this.browser.getUserInfo().catch(() => '')
        }

        Logger.init().info('IPC sending: ', response)

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
                Logger.init().info('Keystroke modification accepted.')
                const host = Object.keys(keystrokes)[0]
                if (!host) {
                    Logger.init().error('Keystroke modification failed.')
                    this.sendResult(IPC_CHANNELS.KEYSTROKES, false)

                    return
                }
                const keystroke = Object.values(keystrokes)[0]
                Keystrokes.getInstance().update(host, keystroke)
                Keystrokes.getInstance().save()

                Logger.init().error('Keystroke modification done.')
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
                    store.getEditable(),
                )
                return
            }

            case REQUEST_HANDLER.MODIFY: {
                store.update(shortcuts)
                store.save()
                this.resetMenu()
                this.sendResult(IPC_CHANNELS.SHORTCUTS)
                // TODO Failed
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
        Logger.init().log(
            `${EMOJI.CLEANER} Cleaner request accepted. ${handler} ${key}`,
        )

        const responseSuccess = () => {
            this.centre.send(
                IPC_CHANNELS.CLEANER,
                REQUEST_HANDLER.RESPONSE_SUCCESS,
            )
        }
        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                getCleanerSizes(
                    this.browser,
                    this.centre,
                    REQUEST_HANDLER.RESPONSE,
                )
                return
            }
            case REQUEST_HANDLER.REMOVE:
                // TODO make them as enum
                switch (key) {
                    case 'cacheSize':
                        await this.browser.webContents.session.clearCache()
                        responseSuccess()
                        return
                    case 'history':
                        this.browser.webContents.navigationHistory.clear()
                        responseSuccess()
                        return
                    case 'indexedDB':
                        removeIndexedDB(this.centre)
                        return
                    case 'popups':
                        PopupBlocker.getInstance().clear()
                        responseSuccess()
                        return
                }
                return
        }
    }

    private async onCloud(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        data: T_IPC_Data<T_Cloud_Item>,
    ) {
        const token = await this.browser.getSafeAccessToken().catch((e) => {
            this.centre.send(
                IPC_CHANNELS.CLOUD,
                REQUEST_HANDLER.RESPONSE_FAIL,
                { message: 'You are not logged in.' },
            )
            throw e
        })
        const user = await this.browser.getUserInfo().catch((e) => {
            this.centre.send(
                IPC_CHANNELS.CLOUD,
                REQUEST_HANDLER.RESPONSE_FAIL,
                { message: 'You are not logged in.' },
            )
            throw e
        })
        const { email } = JSON.parse(user)

        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                cloud.fetchCloudItems(this.centre, token, email)
                return
            }

            case REQUEST_HANDLER.PUT: {
                if (data.item)
                    cloud.uploadCloudItem(this.centre, data.item, token)
                return
            }

            case REQUEST_HANDLER.REMOVE: {
                if (!data.item?._id) {
                    this.centre.send(
                        IPC_CHANNELS.CLOUD,
                        REQUEST_HANDLER.RESPONSE_FAIL,
                        { message: 'You are not logged in.' },
                    )
                    return
                }
                cloud.removeCloudItem(this.centre, data.item._id, token)
                return
            }
        }
    }

    private onFavicon(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        [url]: [string, string],
    ) {
        Logger.init().log('Got onFavicon request', handler, url)
        if (handler === REQUEST_HANDLER.RESPONSE_FAIL)
            fetchAndSendFavicon(this.centre, url)
    }

    private async onContext(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        value: T_IPC_Context<'bookmark' | 'anchor' | 'history' | 'cloud'>,
    ) {
        Logger.init().info('context menu', handler, value)
        const token = await this.browser.getSafeAccessToken().catch(() => '')
        this.showCentreContextMenu(value, token)
    }

    private sendResult(channel: IPC_CHANNELS, result = true) {
        this.centre.send(
            channel as keyof T_IPC_Message,
            result
                ? REQUEST_HANDLER.RESPONSE_SUCCESS
                : REQUEST_HANDLER.RESPONSE_FAIL,
        )
    }
}
