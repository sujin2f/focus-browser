import {
    session,
    WebContentsView,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload, resolveHtmlPath } from '@src/main/utils'
import type { Scenes } from '@src/common/types'
import { PageType, Channel } from '@src/common/constants'

import { History } from '@main/modules/store/history'
import { Status } from '@main/modules/store/status'
import { Bookmarks } from '@main/modules/store/bookmarks'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { Anchors } from '@main/modules/store/anchors'

import { BrowserView } from '@src/main/modules/view/browser'
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
            },
        })
        this.contentView = this.browser
    }

    private initCentre() {
        this.centre = new WebContentsView({
            webPreferences: {
                preload,
            },
        })
        this.centre.webContents
            .loadURL(resolveHtmlPath('index.html'))
            .then(() => {
                const status = Status.getInstance()
                if (status.get('welcome')) {
                    this.title = 'Welcome to Focus!'
                    this.switch(PageType.WELCOME)
                    status.set('welcome', false)
                }
            })
            .catch((e) =>
                Logger.getInstance().error(
                    'Centre init failed',
                    JSON.stringify(e),
                ),
            )
    }

    /**
     * View controls
     */
    public switch(scene: Scenes) {
        this._current = scene
        if (this.isBrowser) {
            this.contentView = this.browser
            if (this.browser.failedUrl) {
                this.browser.reload()
            }
            return
        }

        this.contentView = this.centre
        this.centre.webContents.send(Channel.SWITCH, scene)
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

        // Save Popup Blocker
        PopupBlocker.getInstance().save()

        // Save Bookmark
        Bookmarks.getInstance().save()
        Anchors.getInstance().save()
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
