// yarn test abs-window-ipc.spec.ts

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

import { BrowserView } from '@src/main/modules/view/browser'
import {
    RequestHandler,
    IPC_CHANNELS,
    CENTRE_PAGES,
    BROWSER,
    CURRENT_PAGE_INFO,
} from '@src/common/constants'

import { AbsWindowIPC } from '@src/main/modules/window/abs-window-ipc'
import { CenterView } from '../view/centre'
import { Scenes } from '@src/common/types'

const switchFn = jest.fn()
class IPC extends AbsWindowIPC {
    switch = switchFn
    protected _current: Scenes = BROWSER
    constructor() {
        super()
        this.browser = new BrowserView({})
        this.centre = new CenterView({})
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
        ipc[0][1](
            null,
            RequestHandler.REQUEST,
            CURRENT_PAGE_INFO,
            'title',
            'url',
        )
        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.INFO,
            RequestHandler.RESPONSE,
            { title: 'test title', url: 'https://sujinc.com/focus-browser' },
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
        ipc[1][1](null, CENTRE_PAGES.ADDRESS)
        expect(switchFn).toHaveBeenCalledWith(CENTRE_PAGES.ADDRESS)
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
            IPC_CHANNELS.HISTORY,
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
        console.log(ipc[3][1])
        ipc[3][1](null, RequestHandler.REQUEST)
        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.BOOKMARK,
            RequestHandler.RESPONSE,
            [],
            false,
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
            IPC_CHANNELS.ANCHOR,
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
            IPC_CHANNELS.POPUP_BLOCKER,
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
