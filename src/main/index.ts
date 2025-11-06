import { app, Menu } from 'electron'

import { BrowserWindow } from '@main/modules/window/window'

import { Status } from '@main/modules/store/status'
import { Logger } from '@main/modules/logger'

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady()
    .then(() => {
        Menu.setApplicationMenu(null)
        const window = new BrowserWindow({
            frame: Status.getInstance().get('frame'),
        })
        window.setAutoHideMenuBar(true)

        app.on('activate', () => {
            Logger.getInstance().log('activate, focused?: ', window.isFocused())
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            window.show()
        })
    })
    .catch((e) => {
        Logger.getInstance().error(
            'Error Electron app to start',
            JSON.stringify(e),
        )
    })
