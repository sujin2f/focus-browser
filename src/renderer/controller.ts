import { Bookmark, CC_Pages } from '@src/types'
import { checkElectron } from '@home/util'

import Home from '@src/renderer/modules/pages/home'
import Shortcut from '@home/modules/shortcut'

import './styles/common.css'
import IPC from './modules/ipc'
import Page from './modules/pages'
import Bookmarks from './modules/pages/bookmarks'
import History from './modules/pages/history'
import Anchor from './modules/pages/anchor'

export default class Controller {
    static instance: Controller
    static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller()
        }
        return Controller.instance
    }

    private _currentPage: Page
    public get currentPage() {
        return this._currentPage
    }

    private _bookmarks: Bookmark[] = []
    public get bookmarks() {
        return this._bookmarks
    }
    public set bookmarks(bookmarks: Bookmark[]) {
        this._bookmarks = bookmarks
        this._currentPage.update()
    }
    public currentUrl: Bookmark = {
        url: '',
        title: '',
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            checkElectron()
            new Shortcut()
            IPC.getInstance()
            this.switch(CC_Pages.Home)
        })
    }

    switch(page: CC_Pages) {
        if (this._currentPage && this._currentPage.page === page) {
            if (page === CC_Pages.Address) {
                this._currentPage.focus()
            }
            return
        }

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
                this._currentPage = new Anchor()
                break
        }

        if (page === CC_Pages.Address) {
            this._currentPage.focus()
        }
    }
}

Controller.getInstance()
