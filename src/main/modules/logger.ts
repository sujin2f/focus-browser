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

    private logger: I_Logger

    constructor() {
        // IS_BETA comes from package.json version (0.0.0-beta) via webpack.EnvironmentPlugin
        const activation =
            process.env.NODE_ENV !== 'test' && process.env.IS_BETA
        if (activation) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            this.logger = require('electron-log')
            this.logger.initialize()
            return
        }

        this.logger = {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            error: (..._: unknown[]) => {},
            warn: (..._: unknown[]) => {},
            info: (..._: unknown[]) => {},
            log: (..._: unknown[]) => {},
            /* eslint-enable @typescript-eslint/no-unused-vars */
            initialize: () => {},
        }
    }

    error(...params: unknown[]) {
        this.logger.error(...params)
    }

    warn(...params: unknown[]) {
        this.logger.warn(...params)
    }

    log(...params: unknown[]) {
        this.logger.log(...params)
    }

    info(...params: unknown[]) {
        this.logger.info(...params)
    }
}
