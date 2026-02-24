export const anchorPush = jest.fn(() => true)
export const anchorRemove = jest.fn(() => true)
class MockAnchor {
    get = (): unknown[] => []
    set = jest.fn()
    save = jest.fn()
    parse = jest.fn()
    update = jest.fn()
    push = anchorPush
    remove = anchorRemove
}
export const anchors = () => ({
    Anchors: MockAnchor,
})

export const bookmarkPush = jest.fn(() => true)
export const bookmarkUpdate = jest.fn()
export const bookmarkRemove = jest.fn()
class MockBookmarks {
    get = (): unknown[] => []
    set = jest.fn()
    save = jest.fn()
    parse = jest.fn()
    remove = bookmarkRemove
    update = bookmarkUpdate
    push = bookmarkPush
}
export const bookmarks = () => ({
    Bookmarks: MockBookmarks,
})

export const popupBlockerToggle = jest.fn()
export const popupBlocker = () => ({
    PopupBlocker: {
        getInstance: () => ({
            get: (): unknown[] => [],
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: jest.fn(() => true),
            toggle: popupBlockerToggle,
        }),
    },
})

class MockShortcut {
    get = jest.fn()
    getShortcut = () => ''
    set = jest.fn()
    save = jest.fn()
    parse = jest.fn()
    update = jest.fn()
    push = jest.fn(() => true)
}
export const shortcut = () => ({
    Shortcut: MockShortcut,
})

export const statusMerge = jest.fn()
export const statusGet = jest.fn()

export const status = () => ({
    Status: {
        getInstance: () => ({
            get: statusGet,
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: jest.fn(() => true),
            getBounds: jest.fn(),
            merge: statusMerge,
            data: {},
        }),
    },
})

class MockHistory {
    parse = jest.fn()
    get = jest.fn()
    current = {
        url: 'http://example.com',
    }
}

export const history = () => ({
    History: MockHistory,
})

export const keystrokes = () => ({
    Keystrokes: {
        getInstance: () => ({
            get: jest.fn(),
            getKeystroke: () => 'test[Space]test[Tab]test[Enter]',
            getKeystrokes: () => '',
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: jest.fn(() => true),
        }),
    },
})
