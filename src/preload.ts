import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

const electronHandler = {
    ipcRenderer: {
        sendMessage(
            channel: IPC_CHANNELS,
            handler: REQUEST_HANDLER,
            ...args: unknown[]
        ) {
            ipcRenderer.send(channel, handler, ...args)
        },
        on(
            channel: IPC_CHANNELS,
            func: (handler: REQUEST_HANDLER, ...args: unknown[]) => void,
        ) {
            const subscription = (
                _event: IpcRendererEvent,
                handler: REQUEST_HANDLER,
                ...args: unknown[]
            ) => func(handler, ...args)
            ipcRenderer.on(channel, subscription)

            return () => {
                ipcRenderer.removeListener(channel, subscription)
            }
        },
        once(
            channel: IPC_CHANNELS,
            func: (handler: REQUEST_HANDLER, ...args: unknown[]) => void,
        ) {
            ipcRenderer.once(channel, (_event, handler, ...args) =>
                func(handler, ...args),
            )
        },
    },
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
