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
jest.doMock('@main/lib/adblocker-electron', adBlocker)
jest.doMock('@main/store/popup-blocker', popupBlocker)
jest.doMock('@main/store/history', history)
jest.doMock('@main/store/status', status)
jest.doMock('@main/store/keystrokes', keystrokes)
jest.doMock('@main/modules/window/window', window)

statusGet.mockImplementation((arg) => {
    if (arg === 'adBlocker') {
        return false
    }
    return 'GOOGLE'
})

import { BrowserView } from '@main/modules/view/browser'

import { addAnchorFromBrowser } from '@src/child-process/entries/anchor'
jest.mock('@src/child-process/entries/anchor', () => ({
    addAnchorFromBrowser: jest.fn(),
}))

describe('Web Browser View (browser.ts)', () => {
    test('loadURL > failure', async () => {
        const view = new BrowserView()
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
        const view = new BrowserView()
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
        const view = new BrowserView()
        view.show()
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

    test('addAnchor', async () => {
        const view = new BrowserView()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        view.addAnchor(window as any)
        expect(addAnchorFromBrowser).toHaveBeenCalled()
    })
})
