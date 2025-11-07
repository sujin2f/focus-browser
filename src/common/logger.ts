import { Channel, LogTypes } from '@src/common/constants'

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

        // the Main Process
        if (this.isMain) {
            // IS_BETA comes from package.json version (0.0.0-beta) via webpack.EnvironmentPlugin
            if (process.env.NODE_ENV !== 'test' && process.env.IS_BETA) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                this.logger = require('electron-log')
                ;(this.logger as I_Logger).initialize()
                this.isActive = true
            }
            return
        }

        // the Renderer Process
        if (typeof isBeta !== 'undefined' && isBeta) {
            // IS_BETA comes from package.json version (0.0.0-beta) via webpack.EnvironmentPlugin
            if (isBeta) {
                this.logger = console
                this.isActive = true
            }
        }
    }

    error(...params: unknown[]) {
        this.logger.error(...params)
        this.sendToMain(LogTypes.ERROR, ...params)
    }

    warn(...params: unknown[]) {
        this.logger.warn(...params)
        this.sendToMain(LogTypes.WARN, ...params)
    }

    log(...params: unknown[]) {
        this.logger.log(...params)
        this.sendToMain(LogTypes.LOG, ...params)
    }

    info(...params: unknown[]) {
        this.logger.info(...params)
        this.sendToMain(LogTypes.INFO, ...params)
    }

    sendToMain(type: LogTypes, ...params: unknown[]) {
        if (!this.isMain && this.isActive) {
            window.electron.ipcRenderer.sendMessage(
                Channel.LOG,
                type,
                ...params,
            )
        }
    }
}
