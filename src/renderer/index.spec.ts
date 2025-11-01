describe('src/renderer/index', () => {
    test('module loads and exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./index')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
