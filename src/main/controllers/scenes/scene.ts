import { BrowserWindow, type Session } from 'electron';
import { getAssetPath, preload } from '../../util';

/**
 * An abstract class for scenes (views) in the application
 */
export default abstract class Scene {
    // Browser window
    window: BrowserWindow | null = null;

    constructor(
        protected homepage: string,
        private session?: Session | undefined,
    ) {
        this.init();
    }

    private init() {
        const webPreferences = this.session
            ? {
                  preload,
                  session: this.session,
                  partition: 'persist:my-partition',
              }
            : {
                  preload,
              };

        this.window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            icon: getAssetPath('icon.png'),
            webPreferences,
        });

        this.loadURL(this.homepage);

        this.window.on('ready-to-show', () => {
            if (!this.window) {
                throw new Error(
                    `"window" is not defined for page: ${this.homepage}`,
                );
            }
            this.show();
        });

        this.window.on('closed', () => {
            this.window = null;
        });

        // Open urls in the user's browser
        this.window.webContents.setWindowOpenHandler((edata) => {
            this.loadURL(edata.url);
            return { action: 'deny' };
        });
    }

    /**
     * Load a URL in the current window
     * @param url URL to load
     */
    public async loadURL(url: string) {
        if (this.window) {
            return this.window.loadURL(url);
        }
        return Promise.reject(new Error('Main window not initialized'));
    }

    public show() {
        if (!this.window) {
            this.init();
        }
        this.window?.show();
    }

    public hide() {
        this.window?.hide();
    }
}
