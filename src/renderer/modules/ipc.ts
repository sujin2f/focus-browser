import type { NavigationEntry } from 'electron'
import {
    Bookmark,
    PageType,
    TableAction,
    Channel,
    RequestHandler,
    Scenes,
} from '@src/types'
import { ipcRenderer } from '@home/util'
import Controller from '../controller'

export default class IPC {
    static instance: IPC
    static getInstance(): IPC {
        if (!IPC.instance) {
            IPC.instance = new IPC()
        }
        return IPC.instance
    }

    constructor() {
        this.init()
    }

    private init() {
        ipcRenderer.on(Channel.SWITCH, (scene: Scenes, url: Bookmark) => {
            Controller.getInstance().currentUrl = url

            if (scene === Scenes.HOME) {
                Controller.getInstance().switch(PageType.HOME)
            }
            if (scene === Scenes.ADDRESS) {
                Controller.getInstance().switch(PageType.ADDRESS)
            }
        })
    }

    public navigate(url?: string, anchorIndex?: number) {
        if (url) {
            ipcRenderer.send(Channel.SWITCH, Scenes.BROWSER, url, anchorIndex)
            return
        }

        ipcRenderer.send(Channel.SWITCH, Scenes.BROWSER)
    }

    public requestBookmarks() {
        ipcRenderer.send(Channel.BOOKMARK, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.BOOKMARK,
            (handler: RequestHandler.RESPONSE, bookmarks: Bookmark[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    PageType.BOOKMARK
                ) {
                    Controller.getInstance().currentPage.action(
                        TableAction.UPDATE,
                        bookmarks,
                    )
                }
            },
        )
    }

    public requestAnchors() {
        ipcRenderer.send(Channel.ANCHOR, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.ANCHOR,
            (handler: RequestHandler.RESPONSE, anchors: Bookmark[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    PageType.ANCHOR
                ) {
                    Controller.getInstance().currentPage.action(
                        TableAction.UPDATE,
                        anchors,
                    )
                }
            },
        )
    }

    public removeAnchor(index: number) {
        ipcRenderer.send(Channel.ANCHOR, RequestHandler.REMOVE, index)
    }

    public requestHistory() {
        ipcRenderer.send(Channel.HISTORY, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.HISTORY,
            (handler: RequestHandler.RESPONSE, history: NavigationEntry[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    PageType.HISTORY
                ) {
                    Controller.getInstance().currentPage.action(
                        TableAction.UPDATE,
                        history,
                    )
                }
            },
        )
    }

    public requestPopupBlocker() {
        ipcRenderer.send(Channel.POPUP_BLOCKER, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.POPUP_BLOCKER,
            (
                handler: RequestHandler.RESPONSE,
                blocked: string[],
                allowed: string[],
            ) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    PageType.POPUP_BLOCKER
                ) {
                    const data = [
                        ...allowed.map((host) => ({ host, allowed: true })),
                        ...blocked.map((host) => ({ host, allowed: false })),
                    ]
                    Controller.getInstance().currentPage.action(
                        TableAction.UPDATE,
                        data,
                    )
                }
            },
        )
    }

    public navigateHistory(index: number) {
        ipcRenderer.send(Channel.HISTORY, RequestHandler.EXECUTE, index)
    }

    public addBookmark(bookmark: Bookmark) {
        ipcRenderer.send(Channel.BOOKMARK, RequestHandler.ADD, bookmark)
    }

    public editBookmark(index: number, bookmark: Bookmark) {
        ipcRenderer.send(
            Channel.BOOKMARK,
            RequestHandler.MODIFY,
            bookmark,
            index,
        )
    }

    public removeBookmark(index: number) {
        ipcRenderer.send(Channel.BOOKMARK, RequestHandler.REMOVE, index)
    }

    public togglePopupBlocker(host: string) {
        ipcRenderer.send(Channel.POPUP_BLOCKER, RequestHandler.MODIFY, host)
    }
}
