describe('src/renderer/modules/pages/bookmarks', () => {
    test('exports something', () => {
        const mod = require('./bookmarks')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
