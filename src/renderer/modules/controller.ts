import {
    Bookmark,
    Channel,
    PageType,
    RequestHandler,
    Scenes,
    TableAction,
} from '@src/types'
import { checkElectron, ipcRenderer } from '@home/util'

import A_Page from '@src/renderer/modules/pages'
import Home from '@src/renderer/modules/pages/home'
import Bookmarks from '@src/renderer/modules/pages/bookmarks'
import History from '@src/renderer/modules/pages/history'
import Anchors from '@src/renderer/modules/pages/anchors'
import PopupBlocker from '@src/renderer/modules/pages/popup'
import Welcome from '@src/renderer/modules/pages/welcome'

export default class Controller {
    static instance: Controller
    static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller()
        }
        return Controller.instance
    }

    public platform: string = ''
    private _currentPage: A_Page<any>
    public get currentPage() {
        return this._currentPage
    }

    public currentUrl: Bookmark = {
        url: '',
        title: '',
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            checkElectron()

            if (document.getElementById('welcome')) {
                this.switch(PageType.WELCOME)
                return
            }

            this.initIPC()
            this.switch(PageType.HOME)
            document.addEventListener('keydown', (e) =>
                this.currentPage.doShortcut(e),
            )
        })
    }

    private initIPC() {
        ipcRenderer.send(Channel.PLATFORM, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.PLATFORM,
            (handler: RequestHandler, platform: string) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }
                this.platform = platform
            },
        )
        ipcRenderer.on(Channel.SWITCH, (scene: Scenes, url: Bookmark) => {
            this.currentUrl = url

            if (scene === Scenes.HOME) {
                this.switch(PageType.HOME)
            }
            if (scene === Scenes.ADDRESS) {
                this.switch(PageType.ADDRESS)
            }
        })
    }

    switch(page: PageType) {
        switch (page) {
            case PageType.HOME:
            case PageType.ADDRESS:
                this._currentPage = new Home()
                break

            case PageType.BOOKMARK:
                this._currentPage = new Bookmarks()
                break

            case PageType.HISTORY:
                this._currentPage = new History()
                break

            case PageType.ANCHOR:
                this._currentPage = new Anchors()
                break

            case PageType.POPUP_BLOCKER:
                this._currentPage = new PopupBlocker()
                break

            case PageType.WELCOME:
                this._currentPage = new Welcome()
                break
        }

        if (page === PageType.ADDRESS) {
            this._currentPage.action(TableAction.FOCUS)
        }
    }
}
