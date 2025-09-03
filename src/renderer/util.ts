import { IPC_Channels } from '@src/types'

export const checkElectron = () => {
    if (!window.electron) {
        throw new Error('Electron is not set.')
    }
}

export const message = {
    on: (channel: IPC_Channels, callback: (...args: unknown[]) => void) => {
        window.electron.ipcRenderer.on(channel, callback)
    },
    send: (channel: IPC_Channels, ...args: unknown[]) => {
        window.electron.ipcRenderer.sendMessage(channel, ...args)
    },
}
