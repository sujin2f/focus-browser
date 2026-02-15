import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@src/common/constants'

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: IPC_CHANNELS, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args)
        },
        on(channel: IPC_CHANNELS, func: (...args: unknown[]) => void) {
            const subscription = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ) => func(...args)
            ipcRenderer.on(channel, subscription)

            return () => {
                ipcRenderer.removeListener(channel, subscription)
            }
        },
        once(channel: IPC_CHANNELS, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args))
        },
    },
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
