import {
    electron,
    ipcMainOn,
    send,
    clearCache,
    goToIndex,
    historyClear,
} from '@test/mock-electron'
import { browser, setAdBlocker, loadURL } from '@test/mock-browser'
import {
    anchors,
    bookmarks,
    popupBlocker,
    popupBlockerToggle,
    shortcut,
    status,
    bookmarkPush,
    statusMerge,
    anchorRemove,
    bookmarkUpdate,
    bookmarkRemove,
} from '@test/mock-store'

jest.resetModules()
jest.doMock('electron', electron)

jest.doMock('@main/modules/store/status', status)
jest.doMock('@main/modules/store/shortcut', shortcut)
jest.doMock('@main/modules/store/anchors', anchors)
jest.doMock('@main/modules/store/popup-blocker', popupBlocker)
jest.doMock('@main/modules/store/bookmarks', bookmarks)

jest.doMock('@main/modules/view/browser', browser)

import { WebContentsView } from 'electron'
import { BrowserView } from '@src/main/modules/view/browser'
import {
    RequestHandler,
    Channel,
    PageType,
    BROWSER,
    CURRENT_PAGE_INFO,
} from '@src/constants'

import { AbsWindowIPC } from '@src/main/modules/window/abs-window-ipc'

const switchFn = jest.fn()
class IPC extends AbsWindowIPC {
    switch = switchFn
    constructor() {
        super()
        this.browser = new BrowserView({})
        this.centre = new WebContentsView()
    }
}

describe('Window: IPC (abs-window-ipc.ts)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ipc: any
    beforeAll(() => {
        new IPC()
        // Get ipcMain.on implementation
        ipc = ipcMainOn.mock.calls
    })

    test('onInfo > request', async () => {
        await ipc[0][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalled()
    })

    test('onInfo > request > current page info', async () => {
        ipc[0][1](null, RequestHandler.REQUEST, CURRENT_PAGE_INFO)
        expect(send).toHaveBeenCalledWith(
            Channel.INFO,
            RequestHandler.RESPONSE,
            { title: 'test title', url: 'test url' },
        )
    })

    test('onInfo > MODIFY > clear cache', async () => {
        await ipc[0][1](null, RequestHandler.MODIFY, { cacheSize: NaN })
        expect(clearCache).toHaveBeenCalled()
    })

    test('onInfo > MODIFY > reset adBlocker', async () => {
        await ipc[0][1](null, RequestHandler.MODIFY, { adBlockerStatus: true })
        expect(setAdBlocker).toHaveBeenCalled()
    })

    test('onInfo > MODIFY > change adBlocker setting', async () => {
        await ipc[0][1](null, RequestHandler.MODIFY, { adBlocker: true })
        expect(setAdBlocker).toHaveBeenCalled()
        expect(statusMerge).toHaveBeenCalled()
    })

    test('onSwitch > switch scene', () => {
        ipc[1][1](null, PageType.ADDRESS)
        expect(switchFn).toHaveBeenCalledWith(PageType.ADDRESS)
    })

    test('onSwitch > switch scene', () => {
        ipc[1][1](null, BROWSER, 'test-url')
        expect(switchFn).toHaveBeenCalledWith(BROWSER)
        expect(loadURL).toHaveBeenCalled()
    })

    test('onSwitch > click anchor', () => {
        ipc[1][1](null, BROWSER, 'test-url', RequestHandler.REMOVE)
        expect(switchFn).toHaveBeenCalledWith(BROWSER)
        expect(anchorRemove).toHaveBeenCalled()
    })

    test('onHistory > request', () => {
        ipc[2][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalledWith(
            Channel.HISTORY,
            RequestHandler.RESPONSE,
            [],
        )
    })

    test('onHistory > move to index', () => {
        ipc[2][1](null, RequestHandler.EXECUTE, 2)
        expect(switchFn).toHaveBeenCalledWith(BROWSER)
        expect(goToIndex).toHaveBeenCalledWith(2)
    })

    test('onHistory > clear', () => {
        ipc[2][1](null, RequestHandler.REMOVE)
        expect(historyClear).toHaveBeenCalled()
    })

    test('onBookmarks > request', () => {
        ipc[3][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalledWith(
            Channel.BOOKMARK,
            RequestHandler.RESPONSE,
            [],
        )
    })

    test('onBookmarks > add', () => {
        ipc[3][1](null, RequestHandler.ADD, { url: '1' })
        expect(bookmarkPush).toHaveBeenCalledWith({ url: '1' })
    })

    test('onBookmarks > update', () => {
        ipc[3][1](null, RequestHandler.MODIFY, { url: '1' }, 1)
        expect(bookmarkUpdate).toHaveBeenCalledWith(1, { url: '1' })
    })

    test('onBookmarks > remove', () => {
        ipc[3][1](null, RequestHandler.REMOVE, null, 1)
        expect(bookmarkRemove).toHaveBeenCalledWith(1)
    })

    test('onAnchors > request', () => {
        ipc[4][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalledWith(
            Channel.ANCHOR,
            RequestHandler.RESPONSE,
            [],
        )
    })

    test('onAnchors > remove', () => {
        ipc[4][1](null, RequestHandler.REMOVE, 'url')
        expect(anchorRemove).toHaveBeenCalledWith('url')
    })

    test('onPopupBlocker > request', () => {
        ipc[5][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalledWith(
            Channel.POPUP_BLOCKER,
            RequestHandler.RESPONSE,
            [],
            [],
        )
    })

    test('onPopupBlocker > toggle', () => {
        ipc[5][1](null, RequestHandler.MODIFY, 'host')
        expect(popupBlockerToggle).toHaveBeenCalledWith('host')
    })
})
