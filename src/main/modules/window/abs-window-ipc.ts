import { decode } from 'jsonwebtoken' // Or use jwt-decode
import {
    ipcMain,
    net,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
    type ContextMenuParams,
} from 'electron'

import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'
/* Models */
import { Logger } from '@src/common/logger'
import { Status } from '@main/modules/store/status'
import { Anchors } from '@main/modules/store/anchors'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { Bookmarks } from '@main/modules/store/bookmarks'
import { Shortcut } from '@main/modules/store/shortcut'
import { Keystrokes } from '@main/modules/store/keystrokes'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    REQUEST_HANDLER,
    BROWSER,
    LogTypes,
    MainEventTypes,
    CENTRE_PAGES,
    SUJINC_DOMAIN,
    SUJINC_URL,
} from '@src/common/constants'
/* Utils */
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
    T_Cloud_Item,
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
        ipcMain.on(IPC_CHANNELS.CLOUD, this.onCloud.bind(this))

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
            const status = Status.getInstance()
            status.merge(request.data)
            status.save()

            // If adBlocker setting changed, reset.
            if (
                Object.prototype.hasOwnProperty.call(request.data, 'adBlocker')
            ) {
                Logger.getInstance().log(
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
            case REQUEST_HANDLER.REQUEST: {
                const response = this.browser.initialized
                    ? (this.browser.webContents.navigationHistory.getAllEntries() as T_Bookmark[])
                    : []
                this.centre.send(
                    IPC_CHANNELS.HISTORY,
                    REQUEST_HANDLER.RESPONSE,
                    response,
                )
                return
            }

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

    private async onBookmarks(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        bookmarks: T_Bookmark[],
    ) {
        const storeBookmarks = new Bookmarks()

        switch (handler) {
            case REQUEST_HANDLER.REQUEST:
                this.sendBookmarks(
                    REQUEST_HANDLER.RESPONSE,
                    storeBookmarks.get(),
                )
                return
            case REQUEST_HANDLER.PUT: {
                const userInfo = await this.getUserInfo()
                if (!userInfo) {
                    this.sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL, [
                        { title: 'You are not logged in.' } as T_Bookmark,
                    ])
                    return
                }

                const bookmark = bookmarks[0]
                const os =
                    process.platform === 'darwin' ? 'mac' : process.platform
                const version = process.getSystemVersion()
                const message = Buffer.from(
                    JSON.stringify(bookmark),
                    'utf8',
                ).toString('base64')
                const access = await this.getAccessToken()

                const response = await net
                    .fetch(`${SUJINC_URL}/focus/bookmark`, {
                        body: JSON.stringify({
                            title: bookmark.title,
                            device: `${os}(${version})`,
                            key: bookmark.url,
                            message,
                            type: 'bookmark',
                        }),
                        method: 'PUT',
                        headers: { authorization: `Bearer ${access}` },
                    })
                    .catch((e) => {
                        Logger.getInstance().error(
                            'Failed to PUT bookmark',
                            e.message,
                        )
                        return { json: () => ({ result: false }) }
                    })

                const result = await response.json()
                if (result.result) {
                    this.sendBookmarks(REQUEST_HANDLER.PUT, [
                        {
                            title: 'Your bookmark is exported. Please import from other Focus browser.',
                        } as T_Bookmark,
                    ])
                    return
                }

                this.sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL, [
                    { title: 'Failed to export bookmark.' } as T_Bookmark,
                ])
                return
            }
            case REQUEST_HANDLER.ADD:
                storeBookmarks.push(bookmarks[0])
                storeBookmarks.save()
                this.sendBookmarks(
                    REQUEST_HANDLER.RESPONSE_SUCCESS,
                    storeBookmarks.get(),
                )
                return
            case REQUEST_HANDLER.MODIFY:
                storeBookmarks.update(bookmarks[0])
                storeBookmarks.save()
                this.sendBookmarks(
                    REQUEST_HANDLER.RESPONSE_SUCCESS,
                    storeBookmarks.get(),
                )
                return
            case REQUEST_HANDLER.REMOVE: {
                if (!bookmarks[0].id) {
                    this.sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL, [
                        { title: 'Failed to remove bookmark.' } as T_Bookmark,
                    ])
                    return
                }
                const result = storeBookmarks.remove(bookmarks[0].id)
                if (result) {
                    storeBookmarks.save()
                    this.sendBookmarks(
                        REQUEST_HANDLER.RESPONSE_SUCCESS,
                        storeBookmarks.get(),
                    )
                    return
                }
                this.sendBookmarks(REQUEST_HANDLER.RESPONSE_FAIL, [
                    { title: 'Failed to remove bookmark.' } as T_Bookmark,
                ])
                return
            }
        }
    }

    protected sendBookmarks(handler: REQUEST_HANDLER, bookmarks: T_Bookmark[]) {
        Logger.getInstance().info(`IPC sendBookmarks: ${bookmarks.length}`)
        this.centre.send(IPC_CHANNELS.BOOKMARK, handler, bookmarks)
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
        Logger.getInstance().log(
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
            response.userInfo = await this.getUserInfo()
        }

        Logger.getInstance().info('IPC sending: ', response)

        this.centre.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.RESPONSE, {
            data: response,
        })
    }

    private async getUserInfo(): Promise<undefined | string> {
        const refresh = this.getRefreshToken()
        if (!refresh) {
            return
        }

        return await this.browser.webContents.session.cookies
            .get({
                name: 'sujinc.com/user-info',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => {
                const userInfo = cookies[0]
                if (!userInfo) {
                    await this.removeTokens()
                    return
                }
                const value = decodeURIComponent(userInfo.value)
                return value
            })
    }

    private async getRefreshToken(): Promise<string> {
        return await this.browser.webContents.session.cookies
            .get({
                name: 'sujinc.com/refresh',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => {
                const cookie = this.verifyToken(cookies[0])
                if (cookie) {
                    return cookie.value
                }
                // If refresh token is expired, Clear!
                Logger.getInstance().log('Refresh token is expired.')
                await this.removeTokens()
                return ''
            })
    }

    private async getAccessToken(): Promise<string> {
        const now = new Date().getTime() / 1000
        return await this.browser.webContents.session.cookies
            .get({
                name: 'sujinc.com/access',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => {
                const cookie = this.verifyToken(cookies[0])
                if (cookie) {
                    return cookie.value
                }

                // If not available, try refresh token
                const refresh = await this.getRefreshToken()
                if (!refresh) {
                    return ''
                }
                const access = await this.refreshTokens(refresh)
                if (!access.result) {
                    await this.removeTokens()
                    return ''
                }

                await this.browser.webContents.session.cookies.set({
                    url: SUJINC_URL,
                    name: 'sujinc.com/access',
                    value: access.token,
                    domain: SUJINC_DOMAIN,
                    path: '/',
                    secure: true,
                    httpOnly: true,
                    expirationDate: now + 3 * 60 * 60,
                    sameSite: 'lax',
                })
                return access.token
            })
    }

    private verifyToken(cookie?: Electron.Cookie) {
        if (cookie && cookie.value) {
            const token = decode(cookie.value)
            if (token && typeof token !== 'string' && token.exp) {
                const now = new Date().getTime() / 1000
                if (token.exp > now) {
                    return cookie
                }
            }
        }
        return
    }

    private async removeTokens() {
        await this.browser.webContents.session.cookies.remove(
            SUJINC_URL,
            'sujinc.com/refresh',
        )
        await this.browser.webContents.session.cookies.remove(
            SUJINC_URL,
            'sujinc.com/access',
        )
        await this.browser.webContents.session.cookies.remove(
            SUJINC_URL,
            'sujinc.com/user-info',
        )
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

    private async onCloud(
        _: IpcMainEvent,
        handler: REQUEST_HANDLER,
        items: T_Cloud_Item[],
    ) {
        Logger.getInstance().log('onCloud')
        const token = await this.getAccessToken()
        const user = await this.getUserInfo()
        if (!token || !user) {
            this.centre.send(
                IPC_CHANNELS.CLOUD,
                REQUEST_HANDLER.RESPONSE_FAIL,
                [{ title: 'You are not logged in.' } as T_Cloud_Item],
            )
            return
        }
        const { email } = JSON.parse(user)

        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                const response = await net
                    .fetch(`${SUJINC_URL}/focus/bookmarks`, {
                        method: 'GET',
                        headers: { authorization: `Bearer ${token}`, email },
                    })
                    .catch((e) => {
                        Logger.getInstance().error(
                            `Error to get bookmarks`,
                            e.message,
                        )
                        return { json: () => [] as T_Bookmark[] }
                    })
                const result = await response.json()

                this.centre.send(
                    IPC_CHANNELS.CLOUD,
                    REQUEST_HANDLER.RESPONSE,
                    result,
                )
                return
            }

            case REQUEST_HANDLER.ADD: {
                const buffer = Buffer.from(items[0].message, 'base64').toString(
                    'utf-8',
                )

                const response = await net
                    .fetch(`${SUJINC_URL}/focus/bookmark`, {
                        method: 'DELETE',
                        body: JSON.stringify({ id: items[0]._id }),
                        headers: { authorization: `Bearer ${token}` },
                    })
                    .catch((e) => {
                        Logger.getInstance().error(
                            `Error to remove bookmarks`,
                            e.message,
                        )
                        return { json: () => [] as T_Bookmark[] }
                    })
                const result = await response.json()

                if (items[0].type === 'bookmark') {
                    const bookmark = JSON.parse(buffer)
                    const bookmarks = new Bookmarks()
                    bookmarks.push(bookmark)
                    bookmarks.save()
                }

                this.centre.send(
                    IPC_CHANNELS.CLOUD,
                    REQUEST_HANDLER.RESPONSE_SUCCESS,
                    result,
                )
                return
            }
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

    /**
     * Request access token
     * @param refresh
     * @returns
     */
    private async refreshTokens(token: string) {
        Logger.getInstance().log('refreshTokens')
        const response = await net
            .fetch(`${SUJINC_URL}/auth/refresh`, {
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
            })
            .catch((e) => {
                Logger.getInstance().error(
                    `Error to refresh access token`,
                    e.message,
                )
                return { json: () => ({ result: false }) }
            })
        return await response.json()
    }
}
