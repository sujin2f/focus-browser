import {
    WebContentsView,
    type WebContentsViewConstructorOptions,
} from 'electron'

import { PageType } from '@src/common/constants'

import { resolveHtmlPath } from '@src/main/utils'

export class CenterView extends WebContentsView {
    constructor(options: WebContentsViewConstructorOptions) {
        super(options)
        this.loadScene(PageType.DASHBOARD)
    }

    public loadScene(scene: PageType) {
        switch (scene) {
            case PageType.DASHBOARD:
                this.webContents.loadURL(resolveHtmlPath('dashboard.html'))
                return
            default:
                this.webContents.loadURL(resolveHtmlPath('index.html'))
        }
    }
}
