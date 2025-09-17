import { CC_Modes, CC_Pages } from '@src/types'
import Controller from '@home/controller'
import IPC from './ipc'

export default class Shortcut {
    constructor() {
        document.addEventListener('keydown', this.onShortcut.bind(this))
    }

    private onShortcut(e: KeyboardEvent) {
        // Escape to Page navigation
        if (e.key === 'Escape') {
            if (Controller.getInstance().currentPage.mode === CC_Modes.List) {
                IPC.getInstance().navigate()
                return
            }
            Controller.getInstance().currentPage.mode = CC_Modes.List
            return
        }

        if (this.onGlobalShortcut(e)) {
            return
        }
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
            return
        }

        // Table Navigation
        switch (e.key) {
            case 'ArrowUp':
                Controller.getInstance().currentPage.arrowUp()
                return

            case 'ArrowDown':
                Controller.getInstance().currentPage.arrowDown()
                return

            case 'Enter':
                if (e.metaKey) {
                    Controller.getInstance().currentPage.action('edit')
                    return
                }
                Controller.getInstance().currentPage.onEnter()
                return

            case ' ':
                Controller.getInstance().currentPage.onEnter()
                return

            case 'Delete':
                Controller.getInstance().currentPage.delete()
                return
        }

        console.log(e.key)

        // Page specific
        switch (Controller.getInstance().currentPage.page) {
            case CC_Pages.Home:
                switch (e.key) {
                    case 'B':
                    case 'b':
                        Controller.getInstance().switch(CC_Pages.Bookmark)
                        return
                    case 'h':
                    case 'H':
                        Controller.getInstance().switch(CC_Pages.History)
                        return
                    case 'a':
                    case 'A':
                        Controller.getInstance().switch(CC_Pages.Anchor)
                        return
                    case 'p':
                    case 'P':
                        Controller.getInstance().switch(CC_Pages.PopupBlocker)
                        return
                }
                return
        }
        Controller.getInstance().currentPage.action('keypress', e.key)
    }

    /**
     * With combination with meta, control, alt...,
     * so it allowed when the input has focus
     * @param e
     */
    private onGlobalShortcut(e: KeyboardEvent): boolean {
        switch (e.key) {
            case 'D':
            case 'd':
                // Bookmark only
                if (
                    Controller.getInstance().currentPage.page ===
                        CC_Pages.Bookmark &&
                    e.metaKey
                ) {
                    Controller.getInstance().currentPage.mode = CC_Modes.New
                    return true
                }
                return false
            case 'F':
            case 'f':
                if (e.metaKey) {
                    Controller.getInstance().currentPage.mode = CC_Modes.Find
                    return true
                }
                return false
            // ArrowDown focus list from form
            case 'ArrowDown':
                Controller.getInstance().currentPage.arrowDown()
                return true
        }

        return false
    }
}
