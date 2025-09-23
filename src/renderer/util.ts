import { Channel, RequestHandler, Scenes } from '@src/types'

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

export const navigate = (url?: string, handler?: RequestHandler) => {
    if (url) {
        ipcRenderer.send(Channel.SWITCH, Scenes.BROWSER, url, handler)
        return
    }

    ipcRenderer.send(Channel.SWITCH, Scenes.BROWSER)
}
