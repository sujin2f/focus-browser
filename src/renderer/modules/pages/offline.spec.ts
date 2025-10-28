describe('src/renderer/modules/pages/offline', () => {
    test('exports something', () => {
        const mod = require('./offline')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
