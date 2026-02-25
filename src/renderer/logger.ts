import { IPC_CHANNELS, LogTypes, REQUEST_HANDLER } from '@src/common/constants'
import { isBeta, isDev, isTest } from '@src/common/utils'

/**
 * on Linux: ~/.config/{app name}/logs/main.log
 * on macOS: ~/Library/Logs/{app name}/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
 */
export class Logger {
    // Singleton instance
    static instance: Logger
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private isActive: boolean = false

    constructor() {
        if (isDev() || (isBeta() && !isTest())) {
            this.isActive = true
        }
    }

    error(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        console.error('🤬', ...params)
        this.sendToMain(LogTypes.ERROR, ...params)
    }

    warn(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        console.warn('⚠️', ...params)
        this.sendToMain(LogTypes.WARN, ...params)
    }

    log(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        console.log('⭐️', ...params)
        this.sendToMain(LogTypes.LOG, ...params)
    }

    info(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        console.info('👀', ...params)
        this.sendToMain(LogTypes.INFO, ...params)
    }

    sendToMain(type: LogTypes, ...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        window.electron.ipcRenderer.sendMessage(
            IPC_CHANNELS.LOG,
            REQUEST_HANDLER.EXECUTE,
            [type, params],
        )
    }
}
