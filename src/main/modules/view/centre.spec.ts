// yarn test centre.spec.ts

import { electron, loadURL } from '@test/mock-electron'
import { fromPrebuiltAdsAndTracking } from '@test/mock-ad-blocker'
import { window } from '@test/mock-window'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('@main/modules/window/window', window)

import { CenterView } from '@main/modules/view/centre'

describe('Web Browser View (browser.ts)', () => {
    test('construction', async () => {
        new CenterView()
        await loadURL.withImplementation(
            async () => {},
            async () => {},
        )
        await fromPrebuiltAdsAndTracking.withImplementation(
            async () => {},
            async () => {},
        )
        // from History mock
        expect(loadURL).toHaveBeenCalledWith(
            expect.stringContaining('welcome.html'),
        )
    })
})
