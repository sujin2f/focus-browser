import { controller } from '@test/mock-renderer-controller'

jest.resetModules()
jest.doMock('@home/modules/controller', controller)

import { Home } from '@home/modules/pages/home'

describe('src/renderer/modules/pages/home', () => {
    test('exports something', () => {
        const home = new Home()
        expect(home).toBeDefined()
        expect(Object.keys(home).length).toBeGreaterThanOrEqual(0)
    })
})
