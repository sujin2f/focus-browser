import { CC_Pages } from '@src/types'
import Controller from '@home/controller'
import IPC from './ipc'

export default class Shortcut {
    constructor() {
        document.addEventListener('keydown', (e) => this.onShortcut(e))
    }

    private onShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            if (Controller.getInstance().currentPage.mode === 0) {
                IPC.getInstance().switch()
                return
            }
            Controller.getInstance().currentPage.back()
            return
        }

        const focusedInput =
            (e.target as HTMLElement).tagName.toLowerCase() === 'input'

        switch (Controller.getInstance().currentPage.page) {
            case CC_Pages.Home:
                if (focusedInput) {
                    return
                }

                switch (e.key) {
                    case 'B':
                    case 'b':
                        Controller.getInstance().switch(CC_Pages.Bookmark)
                        break
                    case 'h':
                    case 'H':
                        Controller.getInstance().switch(CC_Pages.History)
                        break
                }
                break
            case CC_Pages.Bookmark:
                switch (e.key) {
                    case 'D':
                    case 'd':
                        // TODO System
                        if (e.metaKey) {
                            Controller.getInstance().currentPage.mode = 1
                        }
                        break
                    case 'F':
                    case 'f':
                        // TODO System
                        if (e.metaKey) {
                            Controller.getInstance().currentPage.mode = 3
                        }
                        break
                }

                if (focusedInput) {
                    return
                }

                switch (e.key) {
                    case 'ArrowUp':
                        Controller.getInstance().currentPage.arrowUp()
                        break

                    case 'ArrowDown':
                        Controller.getInstance().currentPage.arrowDown()
                        break

                    case 'Enter':
                    case 'Space':
                        const url =
                            Controller.getInstance().currentPage.getValue()
                        if (url) {
                            IPC.getInstance().switch(url as string)
                        }
                        break
                    case 'Delete':
                        Controller.getInstance().currentPage.remove()
                        break

                    default:
                        Controller.getInstance().currentPage.action(e.key)
                }
        }
    }
}
