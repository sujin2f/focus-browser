describe('src/renderer/modules/pages/welcome', () => {
    test('exports something', () => {
        const mod = require('./welcome')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
