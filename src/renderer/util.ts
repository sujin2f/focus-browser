import type { Channel } from '@src/types'

export const checkElectron = () => {
    if (!window.electron) {
        throw new Error('Electron is not set.')
    }
}

export const message = {
    on: (channel: Channel, callback: (...args: unknown[]) => void) => {
        window.electron.ipcRenderer.on(channel, callback)
    },
    send: (channel: Channel, ...args: unknown[]) => {
        window.electron.ipcRenderer.sendMessage(channel, ...args)
    },
    once(channel: Channel, func: (...args: unknown[]) => void) {
        window.electron.ipcRenderer.once(channel, func)
    },
}
