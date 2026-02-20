import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { REQUEST_HANDLER } from '@src/common/constants'
import { T_IPC_Message } from './common/types'

const electronHandler = {
    ipcRenderer: {
        sendMessage<T extends keyof T_IPC_Message>(
            channel: T,
            handler: REQUEST_HANDLER,
            arg?: T_IPC_Message[T],
        ) {
            ipcRenderer.send(channel, handler, arg)
        },
        on<T extends keyof T_IPC_Message>(
            channel: T,
            func: (handler: REQUEST_HANDLER, arg?: T_IPC_Message[T]) => void,
        ) {
            const subscription = (
                _event: IpcRendererEvent,
                handler: REQUEST_HANDLER,
                arg?: T_IPC_Message[T],
            ) => func(handler, arg)
            ipcRenderer.on(channel, subscription)

            return () => {
                ipcRenderer.removeListener(channel, subscription)
            }
        },
        once<T extends keyof T_IPC_Message>(
            channel: T,
            func: (handler: REQUEST_HANDLER, arg?: T_IPC_Message[T]) => void,
        ) {
            ipcRenderer.once(channel, (_event, handler, arg) =>
                func(handler, arg),
            )
        },
    },
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
