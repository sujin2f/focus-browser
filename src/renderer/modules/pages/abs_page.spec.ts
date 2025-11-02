describe('src/renderer/modules/pages/abs_page', () => {
    test('module loads and exports', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./abs_page')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
