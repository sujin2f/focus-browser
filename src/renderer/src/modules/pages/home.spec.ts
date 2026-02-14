import { Home } from '@src/renderer/src/modules/pages/home'

describe('src/renderer/modules/pages/home', () => {
    test('exports something', () => {
        const home = new Home()
        expect(home).toBeDefined()
        expect(Object.keys(home).length).toBeGreaterThanOrEqual(0)
    })
})
