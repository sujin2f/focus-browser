// yarn test abs-window-ipc.spec.ts

import {
    electron,
    ipcMainOn,
    send,
    clearCache,
    goToIndex,
    historyClear,
} from '@test/mock-electron'
import { browser, setAdBlocker } from '@test/mock-browser'
import {
    anchors,
    bookmarks,
    popupBlocker,
    popupBlockerToggle,
    shortcut,
    status,
    statusMerge,
    anchorRemove,
} from '@test/mock-store'
import { fs } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)

jest.doMock('@main/store/status', status)
jest.doMock('@main/store/shortcut', shortcut)
jest.doMock('@main/store/anchors', anchors)
jest.doMock('@main/store/popup-blocker', popupBlocker)
jest.doMock('@main/store/bookmarks', bookmarks)

jest.doMock('@main/modules/view/browser', browser)

import { BrowserView } from '@main/modules/view/browser'
import {
    REQUEST_HANDLER,
    IPC_CHANNELS,
    CENTRE_PAGES,
    BROWSER,
} from '@src/common/constants'

import { AbsWindowIPC } from '@main/modules/window/abs-window-ipc'
import { CenterView } from '../view/centre'
import { Scenes, T_IPC_Status, T_IPC_Switch } from '@src/common/types'

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
        await ipc[0][1](null, REQUEST_HANDLER.REQUEST, {
            request: ['title'],
        } satisfies T_IPC_Status)
        expect(send).toHaveBeenCalled()
    })

    test('onInfo > request > current page info', async () => {
        ipc[0][1](null, REQUEST_HANDLER.REQUEST, {
            request: ['title', 'url'],
        } satisfies T_IPC_Status)

        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.STATUS,
            REQUEST_HANDLER.RESPONSE,
            {
                data: {
                    title: 'test title',
                    url: 'https://sujinc.com/focus-browser',
                },
            },
        )
    })

    test('cleaner > REMOVE > clear cache', async () => {
        await ipc[10][1](null, REQUEST_HANDLER.REMOVE, { request: 'cacheSize' })
        expect(clearCache).toHaveBeenCalled()
    })

    test('onInfo > MODIFY > change adBlocker setting', async () => {
        await ipc[0][1](null, REQUEST_HANDLER.MODIFY, {
            data: { adBlocker: true },
        })
        expect(setAdBlocker).toHaveBeenCalled()
        expect(statusMerge).toHaveBeenCalled()
    })

    test('onSwitch > switch scene', () => {
        ipc[1][1](null, REQUEST_HANDLER.EXECUTE, {
            scene: CENTRE_PAGES.ADDRESS,
        } satisfies T_IPC_Switch)
        expect(switchFn).toHaveBeenCalledWith({
            scene: CENTRE_PAGES.ADDRESS,
        } satisfies T_IPC_Switch)
    })

    test('onSwitch > switch scene', () => {
        ipc[1][1](null, REQUEST_HANDLER.EXECUTE, {
            scene: BROWSER,
            address: 'test-url',
        })
        expect(switchFn).toHaveBeenCalledWith({
            address: 'test-url',
            scene: BROWSER,
        })
    })

    test('onSwitch > click anchor', () => {
        ipc[1][1](null, REQUEST_HANDLER.REMOVE, {
            scene: BROWSER,
            address: 'test-url',
        })
        expect(switchFn).toHaveBeenCalledWith({
            address: 'test-url',
            scene: BROWSER,
        })
        expect(anchorRemove).toHaveBeenCalled()
    })

    test('onHistory > request', () => {
        ipc[2][1](null, REQUEST_HANDLER.REQUEST)
        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.HISTORY,
            REQUEST_HANDLER.RESPONSE,
            [],
        )
    })

    test('onHistory > move to index', () => {
        ipc[2][1](null, REQUEST_HANDLER.EXECUTE, [{ id: '2' }])
        expect(switchFn).toHaveBeenCalledWith({ scene: BROWSER })
        expect(goToIndex).toHaveBeenCalledWith(2)
    })

    test('onHistory > clear', () => {
        ipc[2][1](null, REQUEST_HANDLER.REMOVE)
        expect(historyClear).toHaveBeenCalled()
    })

    test('onAnchors > request', () => {
        ipc[4][1](null, REQUEST_HANDLER.REQUEST)
        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.ANCHOR,
            REQUEST_HANDLER.RESPONSE,
            [],
        )
    })

    test('onPopupBlocker > request', () => {
        ipc[5][1](null, REQUEST_HANDLER.REQUEST)
        expect(send).toHaveBeenCalledWith(
            IPC_CHANNELS.POPUP_BLOCKER,
            REQUEST_HANDLER.RESPONSE,
            [[], []],
        )
    })

    test('onPopupBlocker > toggle', () => {
        ipc[5][1](null, REQUEST_HANDLER.MODIFY, [['host']])
        expect(popupBlockerToggle).toHaveBeenCalledWith('host')
    })
})
