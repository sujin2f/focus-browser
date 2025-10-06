interface I_Logger {
    error(...params: any[]): void
    warn(...params: any[]): void
    info(...params: any[]): void
    log(...params: any[]): void
    initialize(): void
}

/**
 * on Linux: ~/.config/{app name}/logs/main.log
 * on macOS: ~/Library/Logs/{app name}/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
 */
export default class Logger {
    // Singleton instance
    static instance: Logger
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private logger: I_Logger

    constructor() {
        if (process.env.NODE_PROD !== 'alpha') {
            this.logger = require('electron-log')
            this.logger.initialize()
            return
        }

        this.logger = {
            error: (...params: any[]) => {},
            warn: (...params: any[]) => {},
            info: (...params: any[]) => {},
            log: (...params: any[]) => {},
            initialize: () => {},
        }
    }

    error(...params: any[]) {
        this.logger.error(...params)
    }

    warn(...params: any[]) {
        this.logger.warn(...params)
    }

    log(...params: any[]) {
        this.logger.log(...params)
    }

    info(...params: any[]) {
        this.logger.info(...params)
    }
}
