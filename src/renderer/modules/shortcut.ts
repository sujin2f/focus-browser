import { CC_Modes, CC_Pages } from '@src/types'
import Controller from '@home/controller'
import IPC from './ipc'

export default class Shortcut {
    constructor() {
        document.addEventListener('keydown', (e) => this.onShortcut(e))
    }

    private onShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            console.log(Controller.getInstance().currentPage)
            console.log(Controller.getInstance().currentPage.mode)
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
            case 'Space':
                Controller.getInstance().currentPage.navigate()
                return

            case 'Delete':
                Controller.getInstance().currentPage.delete()
                return
        }

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
                        Controller.getInstance().switch(CC_Pages.Anchor)
                        return
                }
                return
        }
        Controller.getInstance().currentPage.action(e.key)
    }

    /**
     * With combination with meta, control, alt..., so it allowed when the input has focus
     * @param e
     */
    private onGlobalShortcut(e: KeyboardEvent): boolean {
        // TODO System
        if (e.metaKey) {
            switch (Controller.getInstance().currentPage.page) {
                case CC_Pages.Bookmark:
                    switch (e.key) {
                        case 'D':
                        case 'd':
                            Controller.getInstance().currentPage.mode =
                                CC_Modes.New
                            return true
                        case 'F':
                        case 'f':
                            Controller.getInstance().currentPage.mode =
                                CC_Modes.Find
                            return true
                    }
            }
        }

        switch (Controller.getInstance().currentPage.page) {
            case CC_Pages.Bookmark:
                switch (e.key) {
                    case 'ArrowDown':
                        Controller.getInstance().currentPage.arrowDown()
                        return true
                }
        }
        return false
    }
}
