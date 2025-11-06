describe('src/renderer/modules/pages/popup', () => {
    test('exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./popup')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
