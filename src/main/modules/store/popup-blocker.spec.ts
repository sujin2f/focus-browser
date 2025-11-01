import { electron } from '@test/mock-electron'
import { fs, readMock, writeMock } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)
readMock.mockReturnValue({ blocked: [], allowed: ['toggle'] })

import { PopupBlocker } from '@src/main/modules/store/popup-blocker'

describe('Popup store (module)', () => {
    test('store loads and set/get functions exist', () => {
        const popupBlocker = PopupBlocker.getInstance()
        expect(popupBlocker).toBeDefined()

        popupBlocker.block('block')
        popupBlocker.allow('allow')

        expect(popupBlocker.isAllowed('block')).toBeFalsy()
        expect(popupBlocker.isAllowed('allow')).toBeTruthy()
        expect(popupBlocker.isAllowed('toggle')).toBeTruthy()

        popupBlocker.toggle('toggle')
        expect(popupBlocker.isAllowed('toggle')).toBeFalsy()

        popupBlocker.save()
        expect(writeMock).toHaveBeenCalledWith(
            '/tmp/focus-test/popup-blocker.json',
            '{"blocked":["block","toggle"],"allowed":["allow"]}',
            { encoding: 'utf-8' },
        )
    })
})
