import { app, Menu } from 'electron'
import BrowserWindow from '@main/modules/scenes/window'
import Logger from './modules/logger'

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
        Logger.getInstance().info(`Platform: ${process.platform}`)
        Menu.setApplicationMenu(null)
        const window = new BrowserWindow()
        // Main.getInstance()
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            window.show()
        })
    })
    .catch(console.log)
