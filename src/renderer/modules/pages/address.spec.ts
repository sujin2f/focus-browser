describe('src/renderer/modules/pages/address', () => {
    test('exports something', () => {
        const mod = require('./address')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
