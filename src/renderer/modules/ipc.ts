import type { NavigationEntry } from 'electron'
import {
    Bookmark,
    CC_Pages,
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
        message.on(IPC_Channels.Switch, (scene: Scenes) => {
            console.log('IPC received', 'IPC_Channels.Switch', scene)
            if (scene === Scenes.Home) {
                Controller.getInstance().switch(CC_Pages.Home)
            }
            if (scene === Scenes.Address) {
                Controller.getInstance().switch(CC_Pages.Address)
            }
        })

        message.on(IPC_Channels.URL, (bookmark: Bookmark) => {
            console.log('IPC received', 'IPC_Channels.URL', bookmark)
            Controller.getInstance().currentUrl = bookmark
        })
    }

    public switch(url?: string) {
        if (url) {
            message.send(IPC_Channels.Switch, Scenes.Browser, url)
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

                Controller.getInstance().bookmarks = bookmarks
            },
        )
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

                Controller.getInstance().currentPage.action(history)
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
}
