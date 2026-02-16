// yarn test browser.spec.ts

import { electron, loadURL, sendInputEvent } from '@test/mock-electron'
import { adBlocker, fromPrebuiltAdsAndTracking } from '@test/mock-ad-blocker'
import { window } from '@test/mock-window'
import {
    history,
    popupBlocker,
    status,
    keystrokes,
    statusGet,
} from '@test/mock-store'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('@main/modules/adblocker-electron', adBlocker)
jest.doMock('@main/modules/store/popup-blocker', popupBlocker)
jest.doMock('@main/modules/store/history', history)
jest.doMock('@main/modules/store/status', status)
jest.doMock('@main/modules/store/keystrokes', keystrokes)
jest.doMock('@main/modules/window/window', window)
statusGet.mockReturnValue('GOOGLE')

import { BrowserView } from '@src/main/modules/view/browser'

describe('Web Browser View (browser.ts)', () => {
    test('loadURL > failure', async () => {
        const view = new BrowserView({})
        await view.loadURL('hey')
        await loadURL.withImplementation(
            async () => {},
            async () => {},
        )
        await fromPrebuiltAdsAndTracking.withImplementation(
            async () => {},
            async () => {},
        )

        // should call search
        expect(loadURL).toHaveBeenLastCalledWith(
            'https://www.google.com/search?q=hey',
        )
    })

    test('loadURL > failure > internet connection', async () => {
        // set failure case
        loadURL.mockRejectedValue({ code: 'ERR_INTERNET_DISCONNECTED' })
        const view = new BrowserView({})
        await view.loadURL('hey.com')
        await loadURL.withImplementation(
            async () => {},
            async () => {},
        )
        await fromPrebuiltAdsAndTracking.withImplementation(
            async () => {},
            async () => {},
        )

        // failedUrl should store the URL
        expect(view.failedUrl).toBe('http://hey.com/')
    })

    test('Keystroke', async () => {
        const view = new BrowserView({})
        view.pasteKeystrokes()
        expect(sendInputEvent).toHaveBeenCalledTimes(18)
        expect(sendInputEvent).toHaveBeenNthCalledWith(5, {
            keyCode: 'Space',
            type: 'keyDown',
        })
        expect(sendInputEvent).toHaveBeenNthCalledWith(6, {
            keyCode: 'Space',
            type: 'keyUp',
        })
    })
})
