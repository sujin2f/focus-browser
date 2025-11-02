import { electron } from '@test/mock-electron'
import { fs } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)

import { Status } from '@main/modules/store/status'

describe('Status store (module)', () => {
    test('get/set exist and persist to disk', () => {
        const status = Status.getInstance()
        expect(status).toBeDefined()

        expect(status.getBounds().width).toBe(1024)
        status.merge({ width: 100 })
        expect(status.getBounds().width).toBe(100)
    })
})
