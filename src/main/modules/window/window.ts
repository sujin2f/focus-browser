import {
    session,
    nativeTheme,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload } from '@src/main/utils'
import type { T_IPC_Switch } from '@src/common/types'
import { BROWSER } from '@src/common/constants'

import { History } from '@main/modules/store/history'
import { Status } from '@main/modules/store/status'

import { BrowserView } from '@src/main/modules/view/browser'
import { CenterView } from '@src/main/modules/view/centre'
import { Logger } from '@main/logger'
import { AbsWindowIPC } from './abs-window-ipc'

/**
 * All starts with here
 */
export class BrowserWindow extends AbsWindowIPC {
    constructor(options?: BaseWindowConstructorOptions) {
        Logger.getInstance().log('BrowserWindow::constructor()')
        super(options)

        const status = Status.getInstance()
        const bounds = status.getBounds(this.getBounds())
        this.setBounds(bounds)

        this.initBrowser()
        this.initCentre()

        // Events
        this.addListener('close', () => this.saveStatus()).addListener(
            'resize',
            () => {
                const bounds = this.getContentBounds()
                this.browser.setBounds({
                    x: 0,
                    y: 0,
                    width: bounds.width,
                    height: bounds.height,
                })
            },
        )

        if (nativeTheme.shouldUseDarkColors) {
            this.browser.setBackgroundColor('#030712')
            this.centre.setBackgroundColor('#030712')
        }
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
        this.centre.webContents.focus()
    }

    /**
     * Switch Scene
     */
    public async switch(request: T_IPC_Switch) {
        Logger.getInstance().log('Switch: ', request)
        this._current = request.scene

        if (request.scene === BROWSER) {
            this.contentView = this.browser

            await this.browser.restoreHistory()
            Logger.getInstance().log('Switched to Browser: ', this.browser.url)

            if (request.reloading) {
                this.browser.reload()
            } else if (request.lastVisit) {
                await this.browser.loadLastVisit()
            } else if (request.searchEngine || !this.browser.url.url) {
                this.browser.searchKeyword('')
            } else if (request.address) {
                this.browser.loadURL(request.address)
            } else if (this.browser.failedUrl) {
                this.browser.reload()
            }

            return
        }

        this.contentView = this.centre
        this.centre.loadScene(request.scene)
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
        if (
            this.browser &&
            this.browser.webContents &&
            this.browser.initialized
        ) {
            Logger.getInstance().log('Save history')

            const entries = this.browser.webContents.navigationHistory
            const maxHistory = status.get('maxHistory')

            Logger.getInstance().log('entries.length', entries.length())
            Logger.getInstance().log('maxHistory', maxHistory)

            new History().save(entries, maxHistory)
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
        super.show()
        this.current.webContents.focus()
    }
}
