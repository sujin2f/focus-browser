import type { EventSwitch } from '@src/common/types'
import { PageType, CustomEvents, Channel } from '@src/common/constants'
import { checkElectron, ipcRenderer } from '@home/utils'

import { A_Page } from '@home/modules/pages/abs_page'
import { Home } from '@home/modules/pages/home'
import { Bookmarks } from '@home/modules/pages/bookmarks'
import { History } from '@home/modules/pages/history'
import { Anchors } from '@home/modules/pages/anchors'
import { PopupBlocker } from '@home/modules/pages/popup'
import { Welcome } from '@home/modules/pages/welcome'
import { Address } from '@home/modules/pages/address'
import { Setting } from '@home/modules/pages/setting'
import { Offline } from '@home/modules/pages/offline'
import { Find } from '@home/modules/pages/find'
import { Logger } from '@src/common/logger'

export class Controller {
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

            document.addEventListener(CustomEvents.SWITCH, (e: EventSwitch) => {
                Logger.getInstance().log(`[Renderer] Switch to ${e.detail}`)
                this.switch(e.detail)
            })

            this.initIPC()
            this.switch(PageType.HOME)
        })
    }

    private initIPC() {
        ipcRenderer.on(Channel.SWITCH, (scene: PageType) => {
            this.switch(scene)
        })
    }

    private switch(page: PageType) {
        if (page === PageType.RELOAD) {
            // reload
            this._currentPage.refresh()
            return
        }

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
            case PageType.FIND:
                this._currentPage = new Find()
                break
        }
    }
}
