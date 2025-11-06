import { electron, loadURL } from '@test/mock-electron'
import { adBlocker } from '@test/mock-ad-blocker'
import { window } from '@test/mock-window'
import { history, popupBlocker, status, statusGet } from '@test/mock-store'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('@main/modules/adblocker-electron', adBlocker)
jest.doMock('@main/modules/store/popup-blocker', popupBlocker)
jest.doMock('@main/modules/store/history', history)
jest.doMock('@main/modules/store/status', status)
jest.doMock('@main/modules/window/window', window)

import { BrowserView } from '@src/main/modules/view/browser'

describe('Web Browser View (browser.ts)', () => {
    test('construction', async () => {
        new BrowserView({})
        await loadURL.withImplementation(
            async () => {},
            async () => {},
        )
        // from History mock
        expect(loadURL).toHaveBeenCalledWith('http://current-url/')
    })

    test('loadURL > failure', async () => {
        const view = new BrowserView({})
        await loadURL.withImplementation(
            async () => {},
            async () => {},
        )

        // set failure case
        loadURL.mockRejectedValueOnce({})
        statusGet.mockReturnValue('GOOGLE')
        await view.loadURL('hey')
        // should call search
        expect(loadURL).toHaveBeenLastCalledWith(
            'https://www.google.com/search?q=hey',
        )
    })

    test('loadURL > failure > internet connection', async () => {
        // set failure case
        loadURL.mockRejectedValue({ code: 'ERR_INTERNET_DISCONNECTED' })
        const view = new BrowserView({})
        await view.loadURL('hey')
        // failedUrl should store the URL
        expect(view.failedUrl).toBe('http://hey/')
    })
})
