import { Bookmark, PageType, TableAction } from '@src/types'
import { checkElectron } from '@home/util'

import Home from '@src/renderer/modules/pages/home'

import IPC from '@src/renderer/modules/ipc'
import A_Page from '@src/renderer/modules/pages'
import Bookmarks from '@src/renderer/modules/pages/bookmarks'
import History from '@src/renderer/modules/pages/history'
import Anchors from '@src/renderer/modules/pages/anchors'
import PopupBlocker from '@src/renderer/modules/pages/popup'
import Welcome from '@src/renderer/modules/pages/welcome'

import './styles/common.css'

export default class Controller {
    static instance: Controller
    static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller()
        }
        return Controller.instance
    }

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
            if (document.getElementById('welcome')) {
                this.switch(PageType.WELCOME)
                // Static page (e.g., welcome)
                return
            }
            checkElectron()
            IPC.getInstance()
            this.switch(PageType.HOME)
            document.addEventListener('keydown', (e) =>
                this.currentPage.doShortcut(e),
            )
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

Controller.getInstance()
