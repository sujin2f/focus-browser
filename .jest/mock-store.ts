import { SHORTCUTS } from '@main/settings/shortcut'
import { SystemType } from '@src/constants'

export const anchorPush = jest.fn(() => true)
export const anchorRemove = jest.fn(() => true)
export const anchors = () => ({
    Anchors: {
        getInstance: () => ({
            get: (): unknown[] => [],
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: anchorPush,
            remove: anchorRemove,
        }),
    },
})

export const bookmarkPush = jest.fn(() => true)
export const bookmarkUpdate = jest.fn()
export const bookmarkRemove = jest.fn()
export const bookmarks = () => ({
    Bookmarks: {
        getInstance: () => ({
            get: (): unknown[] => [],
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            remove: bookmarkRemove,
            update: bookmarkUpdate,
            push: bookmarkPush,
        }),
    },
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

export const shortcutGet = jest.fn()
shortcutGet.mockReturnValue(SHORTCUTS[SystemType.DARWIN].menu)
export const shortcut = () => ({
    Shortcut: {
        getInstance: () => ({
            get: shortcutGet,
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: jest.fn(() => true),
        }),
    },
})

export const statusMerge = jest.fn()
export const status = () => ({
    Status: {
        getInstance: () => ({
            get: jest.fn(),
            set: jest.fn(),
            save: jest.fn(),
            parse: jest.fn(),
            update: jest.fn(),
            push: jest.fn(() => true),
            getBounds: jest.fn(),
            merge: statusMerge,
        }),
    },
})

class MockHistory {
    parse = jest.fn()
    current = {
        url: 'current-url',
    }
}

export const history = () => ({
    History: MockHistory,
})
