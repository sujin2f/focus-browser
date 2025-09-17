import type { NavigationEntry } from 'electron'
import {
    Bookmark,
    CC_Pages,
    CC_TableAction,
    IPC_Channels,
    IPC_RequestHandler,
    Scenes,
} from '@src/types'
import { message } from '@home/util'
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
        message.on(IPC_Channels.Switch, (scene: Scenes, url: Bookmark) => {
            Controller.getInstance().currentUrl = url

            if (scene === Scenes.Home) {
                Controller.getInstance().switch(CC_Pages.Home)
            }
            if (scene === Scenes.Address) {
                Controller.getInstance().switch(CC_Pages.Address)
            }
        })
    }

    public navigate(url?: string, anchorIndex?: number) {
        if (url) {
            message.send(IPC_Channels.Switch, Scenes.Browser, url, anchorIndex)
            return
        }

        message.send(IPC_Channels.Switch, Scenes.Browser)
    }

    public requestBookmarks() {
        message.send(IPC_Channels.Bookmarks, IPC_RequestHandler.Request)
        message.once(
            IPC_Channels.Bookmarks,
            (handler: IPC_RequestHandler.Response, bookmarks: Bookmark[]) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    CC_Pages.Bookmark
                ) {
                    Controller.getInstance().currentPage.action(
                        CC_TableAction.UPDATE,
                        bookmarks,
                    )
                }
            },
        )
    }

    public requestAnchors() {
        message.send(IPC_Channels.Anchors, IPC_RequestHandler.Request)
        message.once(
            IPC_Channels.Anchors,
            (handler: IPC_RequestHandler.Response, anchors: Bookmark[]) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    CC_Pages.Anchor
                ) {
                    Controller.getInstance().currentPage.action(
                        CC_TableAction.UPDATE,
                        anchors,
                    )
                }
            },
        )
    }

    public removeAnchor(index: number) {
        message.send(IPC_Channels.Anchors, IPC_RequestHandler.Remove, index)
    }

    public requestHistory() {
        message.send(IPC_Channels.History, IPC_RequestHandler.Request)
        message.once(
            IPC_Channels.History,
            (
                handler: IPC_RequestHandler.Response,
                history: NavigationEntry[],
            ) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    CC_Pages.History
                ) {
                    Controller.getInstance().currentPage.action(
                        CC_TableAction.UPDATE,
                        history,
                    )
                }
            },
        )
    }

    public requestPopupBlocker() {
        message.send(IPC_Channels.PopupBlocker, IPC_RequestHandler.Request)
        message.once(
            IPC_Channels.PopupBlocker,
            (
                handler: IPC_RequestHandler.Response,
                blocked: string[],
                allowed: string[],
            ) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }

                if (
                    Controller.getInstance().currentPage.page ===
                    CC_Pages.PopupBlocker
                ) {
                    const data = [
                        ...allowed.map((host) => ({ host, allowed: true })),
                        ...blocked.map((host) => ({ host, allowed: false })),
                    ]
                    Controller.getInstance().currentPage.action(
                        CC_TableAction.UPDATE,
                        data,
                    )
                }
            },
        )
    }

    public navigateHistory(index: number) {
        message.send(IPC_Channels.History, IPC_RequestHandler.Execute, index)
    }

    public addBookmark(bookmark: Bookmark) {
        message.send(IPC_Channels.Bookmarks, IPC_RequestHandler.Add, bookmark)
    }

    public editBookmark(index: number, bookmark: Bookmark) {
        message.send(
            IPC_Channels.Bookmarks,
            IPC_RequestHandler.Modify,
            bookmark,
            index,
        )
    }

    public removeBookmark(index: number) {
        message.send(IPC_Channels.Bookmarks, IPC_RequestHandler.Remove, index)
    }

    public togglePopupBlocker(host: string) {
        message.send(IPC_Channels.PopupBlocker, IPC_RequestHandler.Modify, host)
    }
}
