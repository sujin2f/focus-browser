describe('src/renderer/modules/controller', () => {
    test('module loads and exports', () => {
        const mod = require('./controller')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThan(0)
    })
})
