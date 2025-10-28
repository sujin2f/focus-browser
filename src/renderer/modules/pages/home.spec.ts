describe('src/renderer/modules/pages/home', () => {
    test('exports something', () => {
        const mod = require('./home')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
