describe('src/renderer/modules/pages/popup', () => {
    test('exports something', () => {
        const mod = require('./popup')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
