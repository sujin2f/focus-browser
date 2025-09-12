import { app, Menu } from 'electron'
import Main from '@src/main/modules/main'

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
        Main.getInstance()
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            Main.getInstance().refresh()
        })
    })
    .catch(console.log)
