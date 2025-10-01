import {
    Channel,
    PageType,
    RequestHandler,
    Scenes,
    TableAction,
    type Shortcuts,
} from '@src/types'
import { checkElectron, ipcRenderer } from '@home/util'

import { A_Page } from '@src/renderer/modules/pages/abs_page'
import { Home } from '@home/modules/pages/home'
import { Bookmarks } from '@home/modules/pages/bookmarks'
import { History } from '@home/modules/pages/history'
import { Anchors } from '@home/modules/pages/anchors'
import { PopupBlocker } from '@home/modules/pages/popup'
import { Welcome } from '@home/modules/pages/welcome'
import { Address } from './pages/address'

export default class Controller {
    static instance: Controller
    static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller()
        }
        return Controller.instance
    }

    public helpText: boolean = false
    public shortcut?: Shortcuts
    private _currentPage: A_Page
    public get currentPage() {
        return this._currentPage
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            checkElectron()

            document.addEventListener('keydown', (e) =>
                this.currentPage.doShortcut(e),
            )

            this.initIPC()
            this.switch(PageType.HOME)
        })
    }

    private initIPC() {
        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.INFO,
            (
                handler: RequestHandler,
                shortcut: Shortcuts,
                helpText: boolean,
            ) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }
                this.shortcut = shortcut
                this.helpText = helpText

                this._currentPage.action(TableAction.INFO)
            },
        )
        ipcRenderer.on(Channel.SWITCH, (scene: Scenes) => {
            switch (scene) {
                case Scenes.HOME:
                    this.switch(PageType.HOME)
                    break

                case Scenes.ADDRESS:
                    this.switch(PageType.ADDRESS)
                    break

                case Scenes.WELCOME:
                    this.switch(PageType.WELCOME)
                    break
            }
        })
    }

    switch(page: PageType) {
        if (this._currentPage && this._currentPage.page === page) {
            return
        }

        switch (page) {
            case PageType.HOME:
                this._currentPage = new Home()
                break
            case PageType.ADDRESS:
                this._currentPage = new Address()
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

        if (this.shortcut) {
            this._currentPage.action(TableAction.INFO)
        }
    }
}
