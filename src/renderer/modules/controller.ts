import {
    Channel,
    PageType,
    RequestHandler,
    TableAction,
    type Info,
} from '@src/types'
import { checkElectron, ipcRenderer } from '@home/util'

import { A_Page } from '@src/renderer/modules/pages/abs_page'
import { Home } from '@home/modules/pages/home'
import { Bookmarks } from '@home/modules/pages/bookmarks'
import { History } from '@home/modules/pages/history'
import { Anchors } from '@home/modules/pages/anchors'
import { PopupBlocker } from '@home/modules/pages/popup'
import { Welcome } from '@home/modules/pages/welcome'
import { Address } from '@home/modules/pages/address'
import { Setting } from '@home/modules/pages/setting'
import { Offline } from '@home/modules/pages/offline'

export class Controller {
    static instance: Controller
    static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller()
        }
        return Controller.instance
    }

    public setting: Info = {}
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

    private requestInfo(isLocation: boolean = false) {
        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST, isLocation)
    }

    private initIPC() {
        ipcRenderer.on(Channel.SWITCH, (scene: PageType) => {
            this.switch(scene)
        })
        ipcRenderer.on(
            Channel.INFO,
            (handler: RequestHandler, setting: Info) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }
                this.setting = { ...this.setting, ...setting }
                this._currentPage.action(TableAction.INFO)
            },
        )
    }

    switch(page: PageType) {
        this.requestInfo(!!this.setting.maxHistory)

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
            case PageType.SETTING:
                this._currentPage = new Setting()
                break
            case PageType.OFFLINE:
                this._currentPage = new Offline()
                break
        }
    }
}
