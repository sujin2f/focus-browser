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
export const findInPage = jest.fn()
export const stopFindInPage = jest.fn()
export const sendInputEvent = jest.fn()
export class MockWebContentsView {
    webContents: unknown
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
            getURL: jest.fn(() => 'https://sujinc.com/focus-browser'),
            on: () => this.webContents,
            setVisualZoomLevelLimits: jest.fn(),
            setZoomFactor: jest.fn(),
            stop,
            setWindowOpenHandler: jest.fn(),
            reload: jest.fn(),
            stopFindInPage,
            findInPage,
            navigationHistory: {
                restore: jest.fn(),
                goBack,
                goForward,
                getAllEntries: (): unknown[] => [],
                goToIndex,
                clear: historyClear,
            },
            sendInputEvent,
            getUserAgent: jest.fn(),
            setUserAgent: jest.fn(),
        }
    }
}

export const MockNotification = jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    addListener: jest.fn(),
}))

export const mockEncryptString = jest.fn(() => ({ toString: jest.fn() }))
export const mockDecryptString = jest.fn()
export const menuBuilder = jest.fn((v) => v)
export const ipcMainOn = jest.fn()
export const electron = () => ({
    session: { fromPartition: jest.fn() },
    app: { getPath: () => '/tmp/focus-test' },
    ipcMain: { on: ipcMainOn, emit: jest.fn() },
    BrowserWindow: MockBrowserWindow,
    WebContentsView: MockWebContentsView,
    Menu: {
        buildFromTemplate: menuBuilder,
        setApplicationMenu: jest.fn(),
    },
    Notification: MockNotification,
    safeStorage: {
        encryptString: mockEncryptString,
        decryptString: mockDecryptString,
    },
})
