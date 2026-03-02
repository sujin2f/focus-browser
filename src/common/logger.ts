import { canLog, isMain } from '@src/common/utils/common'
import { EMOJI, IPC_CHANNELS, LogTypes, REQUEST_HANDLER } from './constants'
import { ipcRenderer } from '@src/renderer/src/utils'

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
        if (!Logger.instance) Logger.instance = new Logger()
        return Logger.instance
    }

    private logger: I_Logger = {
        error: (..._: unknown[]) => {},
        warn: (..._: unknown[]) => {},
        info: (..._: unknown[]) => {},
        log: (..._: unknown[]) => {},
        initialize: () => {},
    }

    private isActive: boolean = false

    constructor() {
        if (!canLog()) return

        this.isActive = true

        if (!isMain()) {
            this.logger = console as unknown as I_Logger
            return
        }

        import('electron-log')
            .then((logger) => {
                this.logger = logger.default
                this.logger.initialize()
            })
            .catch((error) => {
                console.error('Loading electron-log failed:', error)
                this.isActive = false
            })
    }

    log(...params: unknown[]) {
        if (!this.isActive) return
        this.logger.log(EMOJI.STAR, ...params)
        this.sendToMain(LogTypes.LOG, ...params)
    }

    info(...params: unknown[]) {
        if (!this.isActive) return
        this.logger.info(EMOJI.PEEK, ...params)
        this.sendToMain(LogTypes.INFO, ...params)
    }

    warn(...params: unknown[]) {
        if (!this.isActive) return
        this.logger.warn(EMOJI.WARN, ...params)
        this.sendToMain(LogTypes.WARN, ...params)
    }

    error(...params: unknown[]) {
        if (!this.isActive) return
        this.logger.error(EMOJI.ERROR, ...params)
        this.sendToMain(LogTypes.ERROR, ...params)
    }

    throw(...params: unknown[]) {
        if (!this.isActive) return
        this.error(...params)
        throw new Error(params.map((param) => JSON.stringify(param)).join(', '))
    }

    private sendToMain(type: LogTypes, ...params: unknown[]) {
        ipcRenderer.send(IPC_CHANNELS.LOG, REQUEST_HANDLER.EXECUTE, [
            type,
            params,
        ])
    }
}
