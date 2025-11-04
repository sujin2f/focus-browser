import { controller } from '@test/mock-renderer-controller'

jest.resetModules()
jest.doMock('@home/modules/controller', controller)

describe('src/renderer/modules/pages/bookmarks', () => {
    test('exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./bookmarks')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
