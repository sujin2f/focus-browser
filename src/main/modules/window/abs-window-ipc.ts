import {
    ipcMain,
    net,
    type BaseWindowConstructorOptions,
    type IpcMainEvent,
    type ContextMenuParams,
} from 'electron'
/* Models */
import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'
import { Logger } from '@main/logger'
import { Status } from '@main/modules/store/status'
import { Anchors } from '@main/modules/store/anchors'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
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
    EMOJI,
} from '@src/common/constants'
/* Utils */
import { isBeta, isTest } from '@src/common/utils/common'
import {
    getCleanerSizes,
    removeIndexedDB,
} from '@src/child-process/entries/cleaner'
import {
    fetchCloudItems,
    removeCloudItem,
    uploadCloudItem,
} from '@src/child-process/entries/cloud'
/* T_Types */
import type {
    T_Bookmark,
    T_Status_Props,
    T_Cleaner,
    T_IPC_Status,
    T_IPC_Switch,
    T_IPC_Message,
    T_Cloud_Item,
    T_IPC_Data,
} from '@src/common/types'
import {
    modifyBookmark,
    responseBookmarks,
} from '@src/child-process/entries/bookmark'

/**
 * All starts with here
 */
export abstract class AbsWindowIPC extends AbsWindowMenu {
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        ipcMain.on(IPC_CHANNELS.STATUS, this.onStatus.bind(this))
        ipcMain.on(IPC_CHANNELS.SWITCH, this.onSwitch.bind(this))
        ipcMain.on(IPC_CHANNELS.HISTORY, this.onHistory.bind(this))
        ipcMain.on(IPC_CHANNELS.BOOKMARK, (_, handler, arg) => {
            this.onBookmarks(handler, arg)
        })
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
                Logger.getInstance().error(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.INFO:
                Logger.getInstance().info(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.LOG:
                Logger.getInstance().log(EMOJI.CENTRE, ' ', ...params)
                break
            case LogTypes.WARN:
                Logger.getInstance().warn(EMOJI.CENTRE, ' ', ...params)
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
        handler: REQUEST_HANDLER,
        args: T_IPC_Data<T_Bookmark>,
    ) {
        if (handler === REQUEST_HANDLER.REQUEST) {
            responseBookmarks(this.centre)
            return
        }

        modifyBookmark(handler, this.centre, args)
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
                switch (key) {
                    case 'cacheSize':
                        await this.browser.webContents.session.clearCache()
                        responseSuccess()
                        return
                    case 'indexedDB':
                        removeIndexedDB(this.centre)
                        return
                    case 'anchor': {
                        const anchors = new Anchors()
                        anchors.clear()
                        responseSuccess()
                        return
                    }
                    case 'history':
                        this.browser.webContents.navigationHistory.clear()
                        responseSuccess()
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
        const token = await this.getAccessToken()
        const user = await this.getUserInfo()
        if (!token || !user) {
            Logger.getInstance().error('The user is not logged in.')
            this.centre.send(
                IPC_CHANNELS.CLOUD,
                REQUEST_HANDLER.RESPONSE_FAIL,
                { message: 'You are not logged in.' },
            )
            return
        }
        const { email } = JSON.parse(user)

        switch (handler) {
            case REQUEST_HANDLER.REQUEST: {
                fetchCloudItems(this.centre, token, email)
                return
            }

            case REQUEST_HANDLER.PUT: {
                if (data.item) {
                    uploadCloudItem(this.centre, data.item, token)
                }
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
                removeCloudItem(this.centre, data.item._id, token)
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

    private async getRefreshToken(): Promise<string> {
        return await this.browser.webContents.session.cookies
            .get({
                name: 'sujinc.com/refresh',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => {
                const cookie = await this.verifyToken(cookies[0])
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
                const cookie = await this.verifyToken(cookies[0])
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

                await this.browser.webContents.session.cookies
                    .set({
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
                    .catch(async (e) => {
                        Logger.getInstance().error(
                            'Failed to set cookie for access token: ',
                            e.message,
                        )
                        await this.removeTokens()
                    })
                return access.token
            })
    }

    private async verifyToken(cookie?: Electron.Cookie) {
        if (cookie && cookie.value) {
            return await import('jwt-decode')
                .then((module) => {
                    const token = module.jwtDecode(cookie.value)
                    if (token && typeof token !== 'string' && token.exp) {
                        const now = new Date().getTime() / 1000
                        if (token.exp > now) {
                            return cookie
                        }
                    }
                    return
                })
                .catch(async (e) => {
                    Logger.getInstance().error(
                        'Failed to verify token',
                        e.message,
                    )
                })
        }
        return
    }

    private async removeTokens() {
        await this.browser.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/refresh')
            .catch(async (e) => {
                Logger.getInstance().error('Failed to remove cookie', e.message)
            })

        await this.browser.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/access')
            .catch(async (e) => {
                Logger.getInstance().error('Failed to remove cookie', e.message)
            })
        await this.browser.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/user-info')
            .catch(async (e) => {
                Logger.getInstance().error('Failed to remove cookie', e.message)
            })
    }

    /**
     * Request access token
     * @param refresh
     * @returns
     */
    private async refreshTokens(token: string) {
        const response = await net
            .fetch(`${SUJINC_URL}/auth/refresh`, {
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
            })
            .then((result) => {
                Logger.getInstance().log('refreshTokens() attempted')
                return result
            })
            .catch((e) => {
                Logger.getInstance().error(
                    'refreshTokens() failed: ',
                    e.message,
                )
                return { json: async () => ({ result: false }) }
            })
        return await response.json()
    }
}
