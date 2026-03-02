import { app, utilityProcess, Notification } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@src/common/logger'
/* CONSTANTS */
import {
    CENTRE_PAGES,
    IPC_CHANNELS,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* T_Types */
import type { CenterView } from '@main/modules/view/centre'
import type { AbsWindowMenu } from '@main/modules/window/abs-window-menu'

export const responseAnchors = (centre: CenterView) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'list-anchor',
        path: app.getPath('userData'),
    })
    child.once('message', (message) => {
        Logger.getInstance().log(
            '👶',
            'Anchor list request finished',
            message.length,
        )
        centre.send(
            IPC_CHANNELS.ANCHOR_RESPONSE,
            REQUEST_HANDLER.RESPONSE_SUCCESS,
            message,
        )
        child.kill()
    })
}

export const removeAnchor = (url: string) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'remove-anchor',
        path: app.getPath('userData'),
        url,
    })
    child.once('message', () => {
        Logger.getInstance().log('👶', `Anchor removed.`)
        child.kill()
    })
}

export const addAnchorFromBrowser = (
    window: AbsWindowMenu,
    url: string,
    title: string,
) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'add-anchor',
        path: app.getPath('userData'),
        url,
        title,
    })
    child.once('message', (result) => {
        if (!result) {
            Logger.getInstance().error('👶', `Anchor failed to add.`)
            return
        }

        Logger.getInstance().log('👶', `Anchor added.`)

        const notification = new Notification({
            title: 'Focus',
            body: 'New Anchor Added',
            silent: true,
        })
        // Clicking the notification navigates to the anchor page
        notification.addListener('click', () => {
            window.switch({ scene: CENTRE_PAGES.ANCHOR })
        })
        notification.show()
        child.kill()
    })
}

export const clearAnchor = (centre: CenterView) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'clear-anchor',
        path: app.getPath('userData'),
    })
    child.once('message', () => {
        Logger.getInstance().log('👶', `Anchor cleared.`)
        centre.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.RESPONSE_SUCCESS)
        child.kill()
    })
}
