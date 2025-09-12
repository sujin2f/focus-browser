interface I_Logger {
    error(...params: any[]): void
    warn(...params: any[]): void
    info(...params: any[]): void
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

    private mode = 'dev'
    private log: I_Logger

    constructor() {
        if (this.mode === 'dev') {
            this.log = require('electron-log')
            this.log.initialize()
            return
        }

        this.log = {
            error: (...params: any[]) => {},
            warn: (...params: any[]) => {},
            info: (...params: any[]) => {},
            initialize: () => {},
        }
    }

    error(...params: any[]) {
        this.log.error(...params)
    }

    warn(...params: any[]) {
        this.log.warn(...params)
    }

    info(...params: any[]) {
        this.log.info(...params)
    }
}
