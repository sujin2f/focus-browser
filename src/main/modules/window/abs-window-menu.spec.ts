// yarn test abs-window-menu.spec.ts
/// <reference types="jest" />
import {
    electron,
    goBack,
    goForward,
    menuBuilder,
    setFullScreen,
    toggleDevTools,
    winReload,
} from '@test/mock-electron'
import { browser } from '@test/mock-browser'
import { anchors, bookmarks, shortcut } from '@test/mock-store'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('@main/store/anchors', anchors)
jest.doMock('@main/store/shortcut', shortcut)
jest.doMock('@main/store/bookmarks', bookmarks)
jest.doMock('@main/modules/view/browser', browser)

import { BrowserView } from '@main/modules/view/browser'
import { CENTRE_PAGES, BROWSER } from '@src/common/constants'

import { AbsWindowMenu } from '@main/modules/window/abs-window-menu'
import { Scenes } from '@src/common/types'

const mockSwitch = jest.fn()
const mockFocusFindInPage = jest.fn()
const mockFindInPage = jest.fn()
const mockStopFindInPage = jest.fn()
const mockStop = jest.fn()
const mockAddAnchor = jest.fn()
class Menu extends AbsWindowMenu {
    addAnchor = mockAddAnchor
    addBookmark(): void {}
    focusFindInPage = mockFocusFindInPage
    findInPage = mockFindInPage
    stopFindInPage = mockStopFindInPage
    stop = mockStop
    switch = mockSwitch

    toggleDevTools(): void {
        this.browser.webContents.toggleDevTools()
    }
    goBack(): void {
        this.browser.webContents.navigationHistory.goBack()
    }
    goForward(): void {
        this.browser.webContents.navigationHistory.goForward()
    }
    toggleMaximize(): void {}
    protected findText: string = 'search'
    protected _scene: Scenes = BROWSER
    constructor() {
        super()
        this.browser = new BrowserView()
    }
}

describe('Window: Menu (abs-window-menu.ts)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let menu: any
    beforeAll(() => {
        new Menu()

        // Get menu implementation
        menu = menuBuilder.mock.calls[0][0]
    })

    test('⚓️ addAnchor > child-process', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[1].submenu[15]
                : menu[1].submenu[15]

        menuItem.click()
        expect(mockAddAnchor).toHaveBeenCalled()
    })

    describe('🔍 Find', () => {
        test('🔍 find > switch', async () => {
            const menuItem =
                process.platform === 'darwin'
                    ? menu[1].submenu[9]
                    : menu[1].submenu[9]

            menuItem.click()
            expect(mockFocusFindInPage).toHaveBeenCalledWith('', true)
        })

        test('🔍 find next', async () => {
            const menuItem =
                process.platform === 'darwin'
                    ? menu[1].submenu[10]
                    : menu[1].submenu[10]

            menuItem.click()
            expect(mockFindInPage).toHaveBeenCalledWith('', true)
        })

        test('🔍 find prev', async () => {
            const menuItem =
                process.platform === 'darwin'
                    ? menu[1].submenu[11]
                    : menu[1].submenu[11]

            menuItem.click()
            expect(mockFindInPage).toHaveBeenCalledWith('', false)
        })

        test('🔍 stop', async () => {
            const menuItem =
                process.platform === 'darwin'
                    ? menu[1].submenu[12]
                    : menu[1].submenu[12]

            menuItem.click()
            expect(mockStop).toHaveBeenCalled()
        })
    })

    test('stop', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[8]
                : menu[3].submenu[8]

        menuItem.click()
        expect(mockStop).toHaveBeenCalled()
    })

    test('full screen', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[2].submenu[0]
                : menu[2].submenu[0]

        menuItem.click()
        expect(setFullScreen).toHaveBeenCalled()
    })

    test('dev tool', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[2].submenu[7]
                : menu[2].submenu[7]

        menuItem.click()
        expect(toggleDevTools).toHaveBeenCalled()
    })

    test('address', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[0]
                : menu[3].submenu[0]

        menuItem.click()
        expect(mockSwitch).toHaveBeenCalledWith({ scene: CENTRE_PAGES.ADDRESS })
    })

    test('centre', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[1]
                : menu[3].submenu[1]

        menuItem.click()
        expect(mockSwitch).toHaveBeenCalledWith({ scene: CENTRE_PAGES.HOME })
    })

    test('back', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[3]
                : menu[3].submenu[3]

        menuItem.click()
        expect(goBack).toHaveBeenCalled()
    })

    test('forward', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[5]
                : menu[3].submenu[5]

        menuItem.click()
        expect(goForward).toHaveBeenCalled()
    })

    test('stop', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[8]
                : menu[3].submenu[8]
        menuItem.click()
        expect(mockStop).toHaveBeenCalled()
    })

    test('reload', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[9]
                : menu[3].submenu[9]

        menuItem.click()
        expect(winReload).toHaveBeenCalled()
    })
})
