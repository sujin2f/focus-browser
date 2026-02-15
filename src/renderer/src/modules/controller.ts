import { PageType, CustomEvents, IPC_CHANNELS } from '@src/common/constants'
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'

import { A_Page } from '@src/renderer/src/modules/pages/abs_page'
import { Home } from '@src/renderer/src/modules/pages/home'
import { Bookmarks } from '@src/renderer/src/modules/pages/bookmarks'
import { History } from '@src/renderer/src/modules/pages/history'
import { Anchors } from '@src/renderer/src/modules/pages/anchors'
import { PopupBlocker } from '@src/renderer/src/modules/pages/popup'
import { Keystrokes } from '@src/renderer/src/modules/pages/keystrokes'
import { Welcome } from '@src/renderer/src/modules/pages/welcome'
import { Address } from '@src/renderer/src/modules/pages/address'
import { Setting } from '@src/renderer/src/modules/pages/setting'
import { Shortcut } from '@src/renderer/src/modules/pages/shortcut'
import { Offline } from '@src/renderer/src/modules/pages/offline'
import { Find } from '@src/renderer/src/modules/pages/find'

import { Logger } from '@src/common/logger'

export class Controller {
    private _currentPage: A_Page = new Home()
    public get currentPage() {
        return this._currentPage
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            checkElectron()

            document.addEventListener('keydown', (e) =>
                this.currentPage.doShortcut(e),
            )

            document.addEventListener(
                CustomEvents.SWITCH as string,
                (e: Event) => {
                    const customEvent = e as CustomEvent<PageType>
                    Logger.getInstance().log(
                        `[Renderer] Switch to ${customEvent.detail}`,
                    )
                    this.switch(customEvent.detail)
                },
            )

            this.initIPC()
            this.switch(PageType.HOME)
        })
    }

    private initIPC() {
        ipcRenderer.on(IPC_CHANNELS.SWITCH, (...args: unknown[]) => {
            const scene = args[0] as PageType
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
            case PageType.KEYSTROKES:
                this._currentPage = new Keystrokes()
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
            case PageType.SHORTCUT:
                this._currentPage = new Shortcut()
                break
        }
    }
}
