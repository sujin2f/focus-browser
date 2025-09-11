import { BrowserWindow, session } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import fetch from 'cross-fetch'

import { preload } from '@main/util'
import History from '@src/main/modules/store/history'
import Status from '@src/main/modules/store/status'

export default class Base {
    protected _window: BrowserWindow
    public get window() {
        return this._window
    }

    public hide() {
        this._window.hide()
    }

    public reload() {
        this._window.reload()
    }

    public setFullScreen(fullscreen: boolean) {
        this._window.setFullScreen(fullscreen)
    }

    public toggleDevTools() {
        this._window.webContents.toggleDevTools()
    }

    protected setCallbacks() {
        this._window.on('closed', () => {
            this._window = null
        })
    }
}
