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
        console.log(scene)
        switch (scene) {
            case PageType.DASHBOARD:
                this.webContents.loadURL(resolveHtmlPath(PageType.DASHBOARD))
                return
            case PageType.HOME:
                this.webContents.loadURL(resolveHtmlPath(PageType.HOME))
                return
            case PageType.ADDRESS:
                this.webContents.loadURL(
                    `${resolveHtmlPath(PageType.HOME)}?address=true`,
                )
                return
            default:
                this.webContents.loadURL(resolveHtmlPath('index.html'))
        }
    }
}
