export const checkElectron = () => {
    if (!window.electron) {
        throw new Error('Electron is not set.')
    }
}

export const ipcRenderer = {
    on: window.electron.ipcRenderer.on,
    send: window.electron.ipcRenderer.sendMessage,
    once: window.electron.ipcRenderer.once,
}
