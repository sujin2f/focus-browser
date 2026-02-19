import { session, type BaseWindowConstructorOptions } from 'electron'

import { preload } from '@src/main/utils'
import type { T_IPC_Switch } from '@src/common/types'
import { BROWSER } from '@src/common/constants'

import { History } from '@main/modules/store/history'
import { Status } from '@main/modules/store/status'

import { BrowserView } from '@src/main/modules/view/browser'
import { CenterView } from '@src/main/modules/view/centre'
import { Logger } from '@src/common/logger'
import { AbsWindowIPC } from './abs-window-ipc'

/**
 * All starts with here
 */
export class BrowserWindow extends AbsWindowIPC {
    constructor(options?: BaseWindowConstructorOptions) {
        Logger.getInstance().log('BrowserWindow::constructor()')
        super(options)

        const bounds = Status.getInstance().getBounds(this.getBounds())
        this.setBounds(bounds)

        this.initBrowser()
        this.initCentre()

        // Close action
        this.addListener('close', () => this.saveStatus())
    }

    private initBrowser() {
        this.browser = new BrowserView({
            webPreferences: {
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
                navigateOnDragDrop: true,
                contextIsolation: false,
            },
        })
    }

    private initCentre() {
        this.centre = new CenterView({
            webPreferences: {
                preload,
            },
        })
        this.contentView = this.centre
    }

    /**
     * Switch Scene
     */
    public async switch(request: T_IPC_Switch) {
        this._current = request.scene

        if (request.scene === BROWSER) {
            this.contentView = this.browser

            if (request.reloading) {
                this.title = 'Loading...'
                this.browser.reload()
            } else if (request.lastVisit) {
                this.title = 'Loading...'
                await this.browser.loadLastVisit()
            } else if (request.searchEngine) {
                this.title = 'Loading...'
                this.browser.searchKeyword('')
            } else if (request.address) {
                this.title = 'Loading...'
                this.browser.loadURL(request.address)
            } else if (this.browser.failedUrl) {
                this.browser.reload()
            } else if (!this.browser.initialized) {
                this.browser.searchKeyword('')
            }

            this.browser.initialized = true // TODO
            this.browser.webContents.focus()
            return
        }

        this.contentView = this.centre
        this.centre.loadScene(request.scene)
        this.centre.webContents.focus()
    }

    /**
     * Save current status when the app is closed
     */
    private saveStatus() {
        const status = Status.getInstance()
        const bounds = this.getBounds()
        status.set('width', bounds.width)
        status.set('height', bounds.height)
        status.set('x', bounds.x)
        status.set('y', bounds.y)
        status.save()

        // Save history
        if (this.browser && this.browser.webContents) {
            new History().save(
                this.browser.webContents.navigationHistory,
                status.get('maxHistory') as number,
            )
        }
    }

    reload() {
        if (!this.isBrowser) {
            super.reload()
            return
        }
        this.browser.reload()
    }

    show() {
        this.current.webContents.focus()
        super.show()
    }
}
