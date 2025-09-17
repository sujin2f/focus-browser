import { Bookmark, CC_Pages, CC_TableAction } from '@src/types'
import { checkElectron } from '@home/util'

import Home from '@src/renderer/modules/pages/home'

import IPC from './modules/ipc'
import A_Page from './modules/pages'
import Bookmarks from './modules/pages/bookmarks'
import History from './modules/pages/history'
import Anchors from './modules/pages/anchors'
import PopupBlocker from './modules/pages/popup'

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
            checkElectron()
            IPC.getInstance()
            this.switch(CC_Pages.Home)
            document.addEventListener('keydown', (e) =>
                this.currentPage.doShortcut(e),
            )
        })
    }

    switch(page: CC_Pages) {
        switch (page) {
            case CC_Pages.Home:
            case CC_Pages.Address:
                this._currentPage = new Home()
                break

            case CC_Pages.Bookmark:
                this._currentPage = new Bookmarks()
                break

            case CC_Pages.History:
                this._currentPage = new History()
                break

            case CC_Pages.Anchor:
                this._currentPage = new Anchors()
                break

            case CC_Pages.PopupBlocker:
                this._currentPage = new PopupBlocker()
                break
        }

        if (page === CC_Pages.Address) {
            this._currentPage.action(CC_TableAction.FOCUS)
        }
    }
}

Controller.getInstance()
