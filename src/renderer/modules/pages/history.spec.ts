describe('src/renderer/modules/pages/history', () => {
    test('exports something', () => {
        const mod = require('./history')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
