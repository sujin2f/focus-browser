/**
 * Tests for BrowserView (Electron WebContentsView wrapper)
 * These are lightweight unit tests that mock Electron APIs and project stores.
 */

jest.resetModules()

// Mock electron APIs used by the module
jest.mock('electron', () => {
    const popup = { popup: jest.fn() }
    return {
        clipboard: { writeText: jest.fn(), writeImage: jest.fn() },
        Menu: { buildFromTemplate: jest.fn(() => popup) },
        nativeImage: { createFromBuffer: jest.fn(() => ({})) },
        WebContentsView: class WebContentsView {
            public webContents: any
            constructor(_options?: any) {
                this.webContents = {
                    getTitle: jest.fn(() => 'page title'),
                    getURL: jest.fn(() => 'https://restored.example/'),
                    setVisualZoomLevelLimits: jest.fn(),
                    setZoomFactor: jest.fn(),
                    on: jest.fn(),
                    loadURL: jest.fn(() => Promise.resolve()),
                    stop: jest.fn(),
                    navigationHistory: {
                        goBack: jest.fn(),
                        goForward: jest.fn(),
                        restore: jest.fn(),
                    },
                    session: {},
                    reload: jest.fn(),
                    setWindowOpenHandler: jest.fn(),
                }
            }
        },
        Notification: class Notification {
            listeners: Record<string, Function[]> = {}
            constructor(_opts?: any) {}
            addListener(event: string, cb: Function) {
                this.listeners[event] = this.listeners[event] || []
                this.listeners[event].push(cb)
            }
            show = jest.fn()
        },
    }
})

// Mock adblocker to avoid network calls
jest.mock('@main/modules/adblocker-electron', () => ({
    ElectronBlocker: {
        fromPrebuiltAdsAndTracking: jest.fn(() =>
            Promise.resolve({ enableBlockingInSession: jest.fn() }),
        ),
    },
}))

// Minimal mocks for stores used by BrowserView
jest.mock('@main/modules/store/history', () => ({
    __esModule: true,
    default: class History {
        index = NaN
        entries: any[] = []
        current: any = { url: 'https://restored.example/' }
        parse = jest.fn()
    },
}))

jest.mock('@main/modules/store/status', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({ get: (_k: string) => false }),
    },
}))

jest.mock('@main/modules/store/bookmarks', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({ push: jest.fn(() => true) }),
    },
}))

jest.mock('@main/modules/store/popup', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({
            isAllowed: (_host: string) => false,
            block: jest.fn(),
        }),
    },
}))

jest.mock('../store/anchors', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({ push: jest.fn(() => true) }),
    },
}))

// Logger is noisy; stub it
jest.mock('@main/modules/logger', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({ log: jest.fn(), error: jest.fn() }),
    },
}))

// Use the real fetch (cross-fetch) where needed; tests below avoid network calls.

describe('BrowserView (src/main/modules/view/browser.ts)', () => {
    let BrowserView: any
    let switchMode: jest.Mock
    let instance: any

    beforeEach(() => {
        jest.resetModules()
        // require after mocks
        const mod = require('./browser')
        BrowserView = mod.BrowserView
        switchMode = jest.fn()
        instance = new BrowserView({}, switchMode)
    })

    test('constructor sets up webContents and loads restored URL', () => {
        expect(
            instance.webContents.setVisualZoomLevelLimits,
        ).toHaveBeenCalledWith(1, 3)
        expect(instance.webContents.setZoomFactor).toHaveBeenCalledWith(1)
        // showContextMenu handler attached
        expect(instance.webContents.on).toHaveBeenCalledWith(
            'context-menu',
            expect.any(Function),
        )
        // constructor loads URL from restored history (mock returns https://restored.example/)
        expect(instance.webContents.loadURL).toHaveBeenCalled()
    })

    test('loadURL normalizes plain host (no schema) and calls webContents.loadURL', async () => {
        const stub = instance.webContents.loadURL
        await instance.loadURL('example.com')
        expect(stub).toHaveBeenCalled()
        const calledWith = stub.mock.calls[stub.mock.calls.length - 1][0]
        expect(typeof calledWith).toBe('string')
        expect(calledWith).toMatch(/example\.com/)
    })

    test('reload uses failedUrl when set, otherwise webContents.reload', () => {
        instance.failedUrl = 'https://failed.example/'
        const loadStub = instance.webContents.loadURL
        instance.reload()
        expect(loadStub).toHaveBeenCalledWith('https://failed.example/')

        // clear and test reload path
        instance.failedUrl = undefined
        const reloadStub = instance.webContents.reload
        instance.reload()
        expect(reloadStub).toHaveBeenCalled()
    })

    test('addBookmark shows notification when push returns true', () => {
        const Notification = require('electron').Notification
        instance.addBookmark()
        expect(Notification.prototype.show).toHaveBeenCalled()
    })

    test('context menu linkURL branch writes link to clipboard and popups menu', async () => {
        const params = {
            hasImageContents: false,
            linkURL: 'https://link.example/',
            srcURL: '',
        }
        // call showContextMenu directly (private in TS, but accessible at runtime)
        await instance.showContextMenu(null, params)
        const electron = require('electron')
        expect(electron.clipboard.writeText).toHaveBeenCalledWith(
            'https://link.example/',
        )
        expect(electron.Menu.buildFromTemplate).toHaveBeenCalled()
    })
})
