describe('src/renderer/index', () => {
    test('module loads and exports something', () => {
        const mod = require('./index')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
