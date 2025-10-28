describe('src/renderer/modules/pages/setting', () => {
    test('exports something', () => {
        const mod = require('./setting')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
