import { app, ipcMain } from 'electron';

import { isDebug, installDevExtensions } from '../util';
import SceneWebBrowser from './scenes/web-browser';
import SceneHome from './scenes/home';
import AbsMenuBuilder, { MenuItemConstructorOptions } from './menu-builder';
import Bookmarks from './store/bookmarks';

enum Scenes {
    'browser',
    'home',
    'address', // home with address bar focused
}

/**
 * Main application controller
 *
 * Handles switching between different scenes (views) in the application
 * Handles IPC communication
 */
export default class Main extends AbsMenuBuilder {
    // Singleton instance
    static instance: Main;
    static getInstance(): Main {
        if (!Main.instance) {
            Main.instance = new Main();
        }
        return Main.instance;
    }

    // To ensure extensions are only installed once
    private extensionsInstalled = false;

    // Scene instances
    private sceneWebBrowser: SceneWebBrowser = SceneWebBrowser.getInstance();
    private sceneHome: SceneHome = SceneHome.getInstance();
    private currentScene: Scenes = Scenes.browser;

    menu: MenuItemConstructorOptions[] = [
        {
            label: 'Focus',
            system: ['darwin'],
            submenu: [
                {
                    label: 'About Focus',
                    selector: 'orderFrontStandardAboutPanel:',
                },
                { type: 'separator' },
                {
                    label: 'Hide ElectronReact',
                    accelerator: 'Command+H',
                    selector: 'hide:',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:',
                },
                { label: 'Show All', selector: 'unhideAllApplications:' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            system: ['darwin', 'default'],
            submenu: [
                {
                    label: 'Undo',
                    accelerators: {
                        'darwin': 'Command+Z',
                        'default': 'Ctrl+Z',
                    },
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerators: {
                        'darwin': 'Shift+Command+Z',
                        'default': 'Shift+Ctrl+Z',
                    },
                    selector: 'redo:'
                },
                { type: 'separator' },
                {
                    label: 'Cut',
                    accelerators: {
                        'darwin': 'Command+X',
                        'default': 'Ctrl+X',
                    },
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerators: {
                        'darwin': 'Command+C',
                        'default': 'Ctrl+C',
                    },
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerators: {
                        'darwin': 'Command+V',
                        'default': 'Ctrl+V',
                    },
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerators: {
                        'darwin': 'Command+A',
                        'default': 'Ctrl+A',
                    },
                    selector: 'selectAll:',
                },
            ],
        },
        {
            label: 'View',
            system: ['darwin', 'default'],
            submenu: [
                {
                    label: 'Address Bar',
                    accelerators: {
                        'darwin': 'Command+L',
                        'default': 'Ctrl+L',
                    },
                    click: () => {
                        this.switch(Scenes.address);
                    },
                },
                {
                    label: 'Show Centre',
                    accelerators: {
                        'darwin': 'Command+`',
                        'default': 'Ctrl+`',
                    },
                    click: () => {
                        this.switch(Scenes.home);
                    },
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerators: {
                        'darwin': 'Command+R',
                        'default': 'Ctrl+R',
                    },
                    click: () => {
                        if (this.currentScene === Scenes.browser) {
                            this.sceneWebBrowser.window?.reload();
                            return;
                        }

                        this.sceneHome.window?.reload();
                    },
                },
                {
                    label: 'Toggle Full Screen',
                    accelerators: {
                        'darwin': 'Ctrl+Command+F',
                        'default': 'F11',
                    },
                    click: () => {
                        if (this.currentScene === Scenes.browser) {
                            this.sceneWebBrowser.window?.setFullScreen(true);
                            return;
                        }

                        this.sceneHome.window?.setFullScreen(true);
                    },
                },
            ],
        },
        {
            label: 'Dev',
            system: ['darwin', 'default'],
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerators: {
                        'darwin': 'Alt+Command+I',
                        'default': 'Alt+Ctrl+I',
                    },
                    click: () => {
                        if (this.currentScene === Scenes.browser) {
                            this.sceneWebBrowser.window?.webContents.toggleDevTools();
                            return;
                        }

                        this.sceneHome.window?.webContents.toggleDevTools();
                    },
                },
            ],
        },
        {
            label: 'Window',
            system: ['darwin'],
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:',
                },
                { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
                { type: 'separator' },
                { label: 'Bring All to Front', selector: 'arrangeInFront:' },
            ],
        },
    ];

    /**
     * Constructor
     * Initializes the application and sets the initial scene to the web browser
     */
    constructor() {
        super();
        this.init();
        this.switch(Scenes.browser);
    }

    /**
     * Initializes the application
     */
    async init() {
        // Install devtools extensions in development mode
        if (isDebug && !this.extensionsInstalled) {
            await installDevExtensions();
        }
        this.extensionsInstalled = true;

        this.initIPC()
        this.buildMenu();
    }

    /**
     * Initializes IPC communication
     */
    private initIPC() {
        // Switch to web browser scene
        ipcMain.on('show-browser', async () => {
            this.switch(Scenes.browser)
        });

        // Switch to web browser scene with url
        ipcMain.on('load-url', async (_, arg) => {
            if (Array.isArray(arg) && arg.length > 0 && typeof arg[0] === 'string' && arg[0].trim() !== '') {
                this.switch(Scenes.browser, arg[0])
            }
        });

        // Add bookmark
        ipcMain.on('bookmark-add', async (_, arg) => {
            Bookmarks.getInstance().add(arg[0], arg[1], arg[2] || undefined);
        });

        // Get request for bookmarks and send them back
        ipcMain.on('bookmarks', async () => {
            this.sceneHome.sendBookmarks();
        });
    }

    /**
     * Switches between different scenes
     *
     * @param {Scenes} scene The scene to switch to
     * @param {string} url Optional URL to load in the web browser scene
     */
    private switch(scene: Scenes, url?: string) {
        // Browser scene
        if (scene === Scenes.browser) {
            this.sceneHome.hide()
            this.sceneWebBrowser.show()

            // Move to URL if provided
            if (url) {
                // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
                const hasSchema = /^[a-z]+:\/\//i.test(url);

                // If the schema is missing, prepend 'http://' to allow the URL constructor
                // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
                const parsed = new URL(!hasSchema ? `http://${url}` : url);

                this.sceneWebBrowser.loadURL(parsed.toString()).catch(() => {
                    // If loading the URL fails (e.g., invalid URL), perform a search instead
                    // TODO search engine option
                    this.sceneWebBrowser.loadURL(`https://www.google.com/search?q=${url}`)
                });
            }
            this.currentScene = Scenes.browser
            return
        }

        // Home scene
        this.sceneHome.window?.webContents.send(
            'set-current-page',
            this.sceneWebBrowser.window?.webContents.getURL(),
            this.sceneWebBrowser.window?.getTitle(),
            '', // TODO: Fetch page icon
            '', // TODO: Fetch page description
        );

        this.sceneWebBrowser.hide()
        this.sceneHome.show()

        // Focus address bar if requested
        if (scene === Scenes.address) {
            this.sceneHome.showAddressBar()
        } else {
            this.sceneHome.showHome()
        }

        this.currentScene = Scenes.home
    }

    /**
     * On macOS it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     * This method refreshes the current scene
     */
    refresh() {
        if (this.currentScene === Scenes.browser) {
            this.sceneWebBrowser.show();
            return
        }
        this.sceneHome.show();
    }
}
