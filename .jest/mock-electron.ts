export const loadURL = jest.fn(() => Promise.resolve())

export const setFullScreen = jest.fn()
export const winReload = jest.fn()
class MockBrowserWindow {
    fullScreen = false
    title = false
    setFullScreen = setFullScreen
    reload = winReload
    getBounds = jest.fn()
    setBounds = jest.fn()
    addListener = jest.fn()
}

export const toggleDevTools = jest.fn()
export const goBack = jest.fn()
export const goForward = jest.fn()
export const stop = jest.fn()
export const send = jest.fn()
export const getCacheSize = jest.fn(() => Promise.resolve())
export const clearCache = jest.fn(() => Promise.resolve())
export const goToIndex = jest.fn()
export const historyClear = jest.fn()
export class MockWebContentsView {
    webContents: any
    constructor() {
        this.webContents = {
            session: {
                getCacheSize,
                clearCache,
            },
            loadURL,
            send,
            focus: jest.fn(),
            isDevToolsOpened: jest.fn(() => false),
            toggleDevTools: toggleDevTools,
            openDevTools: jest.fn(),
            closeDevTools: jest.fn(),
            getTitle: jest.fn(() => 'test title'),
            getURL: jest.fn(() => 'test url'),
            on: () => this.webContents,
            setVisualZoomLevelLimits: jest.fn(),
            setZoomFactor: jest.fn(),
            stop,
            setWindowOpenHandler: jest.fn(),
            reload: jest.fn(),
            navigationHistory: {
                restore: jest.fn(),
                goBack,
                goForward,
                getAllEntries: (): unknown[] => [],
                goToIndex,
                clear: historyClear,
            },
        }
    }
}

export const MockNotification = jest.fn().mockImplementation((param) => ({
    show: jest.fn(),
    addListener: jest.fn(),
}))

export const menuBuilder = jest.fn((v) => v)
export const ipcMainOn = jest.fn()
export const electron = () => ({
    session: { fromPartition: jest.fn() },
    app: { getPath: () => '/tmp/focus-test' },
    ipcMain: { on: ipcMainOn },
    BrowserWindow: MockBrowserWindow,
    WebContentsView: MockWebContentsView,
    Menu: {
        buildFromTemplate: menuBuilder,
        setApplicationMenu: jest.fn(),
    },
    Notification: MockNotification,
})
