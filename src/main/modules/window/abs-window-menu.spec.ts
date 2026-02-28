// yarn test abs-window-menu.spec.ts
/// <reference types="jest" />
import {
    electron,
    goBack,
    goForward,
    menuBuilder,
    setFullScreen,
    stop,
    toggleDevTools,
    winReload,
    stopFindInPage,
    findInPage,
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

const switchFn = jest.fn()
class Menu extends AbsWindowMenu {
    switch = switchFn
    protected findText: string = 'search'
    protected _current: Scenes = BROWSER
    constructor() {
        super()
        this.browser = new BrowserView({})
    }
}
import { addAnchorFromBrowser } from '@src/child-process/entries/anchor'
jest.mock('@src/child-process/entries/anchor', () => ({
    addAnchorFromBrowser: jest.fn(),
}))

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
        expect(addAnchorFromBrowser).toHaveBeenCalled()
    })

    test('find > switch', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[1].submenu[9]
                : menu[1].submenu[9]

        menuItem.click()
        expect(switchFn).toHaveBeenCalledWith({ scene: CENTRE_PAGES.FIND })
    })

    test('find next', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[1].submenu[10]
                : menu[1].submenu[10]

        menuItem.click()
        expect(findInPage).toHaveBeenCalledWith('search', {
            findNext: true,
        })
    })

    test('find prev', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[1].submenu[11]
                : menu[1].submenu[11]

        menuItem.click()
        expect(findInPage).toHaveBeenCalledWith('search', {
            forward: false,
            findNext: true,
        })
    })

    test('stop', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[1].submenu[12]
                : menu[1].submenu[12]

        menuItem.click()
        expect(stopFindInPage).toHaveBeenCalled()
    })

    test('stop', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[8]
                : menu[3].submenu[8]

        menuItem.click()
        expect(stop).toHaveBeenCalled()
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
        expect(switchFn).toHaveBeenCalledWith({ scene: CENTRE_PAGES.ADDRESS })
    })

    test('centre', async () => {
        const menuItem =
            process.platform === 'darwin'
                ? menu[3].submenu[1]
                : menu[3].submenu[1]

        menuItem.click()
        expect(switchFn).toHaveBeenCalledWith({ scene: CENTRE_PAGES.HOME })
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
        expect(stop).toHaveBeenCalled()
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
