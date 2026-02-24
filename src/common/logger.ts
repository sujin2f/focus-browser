import { IPC_CHANNELS, LogTypes, REQUEST_HANDLER } from '@src/common/constants'
import { isBeta, isDev, isTest } from './utils'

interface I_Logger {
    error(...params: unknown[]): void
    warn(...params: unknown[]): void
    info(...params: unknown[]): void
    log(...params: unknown[]): void
    initialize(): void
}

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

    private logger: I_Logger | Console = {
        error: (..._: unknown[]) => {},
        warn: (..._: unknown[]) => {},
        info: (..._: unknown[]) => {},
        log: (..._: unknown[]) => {},
        initialize: () => {},
    }

    private isMain: boolean
    private isActive: boolean = false

    constructor() {
        this.isMain = typeof window !== 'object'

        if (isDev() || (isBeta() && !isTest())) {
            // the Main Process
            if (this.isMain) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                this.logger = require('electron-log')
                ;(this.logger as I_Logger).initialize()
                this.isActive = true
                return
            }

            this.logger = console
            this.isActive = true
        }
    }

    error(...params: unknown[]) {
        this.logger.error('🤬', ...params)
        this.sendToMain(LogTypes.ERROR, ...params)
    }

    warn(...params: unknown[]) {
        this.logger.warn('⚠️', ...params)
        this.sendToMain(LogTypes.WARN, ...params)
    }

    log(...params: unknown[]) {
        this.logger.log('⭐️', ...params)
        this.sendToMain(LogTypes.LOG, ...params)
    }

    info(...params: unknown[]) {
        this.logger.info('👀', ...params)
        this.sendToMain(LogTypes.INFO, ...params)
    }

    sendToMain(type: LogTypes, ...params: unknown[]) {
        if (!this.isMain && this.isActive) {
            window.electron.ipcRenderer.sendMessage(
                IPC_CHANNELS.LOG,
                REQUEST_HANDLER.EXECUTE,
                [type, params],
            )
        }
    }
}
