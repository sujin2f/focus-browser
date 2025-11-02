describe('src/renderer/modules/controller', () => {
    test('module loads and exports', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./controller')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThan(0)
    })
})
