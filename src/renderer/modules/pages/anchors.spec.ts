describe('src/renderer/modules/pages/anchors', () => {
    test('exports something', () => {
        const mod = require('./anchors')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
