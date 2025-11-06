import {
    electron,
    goBack,
    goForward,
    menuBuilder,
    MockNotification,
    setFullScreen,
    stop,
    toggleDevTools,
    winReload,
    stopFindInPage,
    findInPage,
} from '@test/mock-electron'
import { browser } from '@test/mock-browser'
import {
    anchors,
    bookmarks,
    shortcut,
    shortcutGet,
    bookmarkPush,
    anchorPush,
} from '@test/mock-store'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('@main/modules/store/anchors', anchors)
jest.doMock('@main/modules/store/shortcut', shortcut)
jest.doMock('@main/modules/store/bookmarks', bookmarks)
jest.doMock('@main/modules/view/browser', browser)

import { BrowserView } from '@src/main/modules/view/browser'
import { PageType, MenuCategory, Menu as EnumMenu } from '@src/constants'

import { AbsWindowMenu } from '@src/main/modules/window/abs-window-menu'

const switchFn = jest.fn()
class Menu extends AbsWindowMenu {
    switch = switchFn
    protected findText: string = 'search'
    constructor() {
        super()
        this.browser = new BrowserView({})
    }
}

describe('Window: Menu (abs-window-menu.ts)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let menu: any
    beforeAll(() => {
        shortcutGet.mockReturnValue({
            [MenuCategory.EDIT]: {
                [EnumMenu.ADD_BOOKMARK]: {},
                [EnumMenu.ADD_ANCHOR]: {},
                [EnumMenu.FIND]: {},
                [EnumMenu.FIND_NEXT]: {},
                [EnumMenu.FIND_PREV]: {},
                [EnumMenu.STOP]: {},
            },
            [MenuCategory.VIEW]: {
                [EnumMenu.FULL_SCREEN]: {},
                [EnumMenu.DEVTOOLS]: {},
                [EnumMenu.FIT_TO_SCREEN]: {},
            },
            [MenuCategory.NAVIGATE]: {
                [EnumMenu.ADDRESS]: {},
                [EnumMenu.CENTRE]: {},
                [EnumMenu.BACK]: {},
                [EnumMenu.FORWARD]: {},
                [EnumMenu.STOP]: {},
                [EnumMenu.RELOAD]: {},
            },
        })

        new Menu()

        // Get menu implementation
        menu = menuBuilder.mock.calls[0][0]
    })

    test('addBookmark > Show Notification', async () => {
        menu[0].submenu[0].click()
        expect(bookmarkPush).toHaveBeenCalled()
        expect(MockNotification).toHaveBeenCalled()
    })

    test('addAnchor > Show Notification', async () => {
        menu[0].submenu[1].click()
        expect(anchorPush).toHaveBeenCalled()
        expect(MockNotification).toHaveBeenCalled()
    })

    test('find > switch', async () => {
        menu[0].submenu[2].click()
        expect(switchFn).toHaveBeenCalledWith(PageType.FIND)
    })

    test('find next', async () => {
        menu[0].submenu[3].click()
        expect(findInPage).toHaveBeenCalledWith('search', {
            findNext: true,
        })
    })

    test('find prev', async () => {
        menu[0].submenu[4].click()
        expect(findInPage).toHaveBeenCalledWith('search', {
            forward: false,
            findNext: true,
        })
    })

    test('stop', async () => {
        menu[0].submenu[5].click()
        expect(stopFindInPage).toHaveBeenCalled()
        expect(stop).toHaveBeenCalled()
    })

    test('full screen', async () => {
        menu[1].submenu[0].click()
        expect(setFullScreen).toHaveBeenCalled()
    })

    test('dev tool', async () => {
        menu[1].submenu[1].click()
        expect(toggleDevTools).toHaveBeenCalled()
    })

    test('address', async () => {
        menu[2].submenu[0].click()
        expect(switchFn).toHaveBeenCalledWith(PageType.ADDRESS)
    })

    test('centre', async () => {
        menu[2].submenu[1].click()
        expect(switchFn).toHaveBeenCalledWith(PageType.HOME)
    })

    test('back', async () => {
        menu[2].submenu[2].click()
        expect(goBack).toHaveBeenCalled()
    })

    test('forward', async () => {
        menu[2].submenu[3].click()
        expect(goForward).toHaveBeenCalled()
    })

    test('stop', async () => {
        menu[2].submenu[4].click()
        expect(stopFindInPage).toHaveBeenCalled()
        expect(stop).toHaveBeenCalled()
    })

    test('reload', async () => {
        menu[2].submenu[5].click()
        expect(winReload).toHaveBeenCalled()
    })
})
