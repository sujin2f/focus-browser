import { PageType, TableAction } from '@src/types'
import Controller from '@home/controller'
import IPC from '@home/modules/ipc'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import A_Page from '.'

type Button = {
    title: string
    description: string
    destination: PageType
}

export default class Home extends A_Page<null> {
    public readonly page = PageType.HOME

    private label: Label = new Label()
    private search: Input = new Input()
    private cardsContainer: HTMLElement

    private buttons: Record<string, Button> = {
        bookmarks: {
            title: 'Bookmarks (B)',
            description: 'Manage bookmarks',
            destination: PageType.BOOKMARK,
        },
        anchor: {
            title: 'Anchor (A)',
            description:
                'Temporary bookmark that will be deleted once you clicked it.',
            destination: PageType.ANCHOR,
        },
        history: {
            title: 'History (H)',
            description: 'Manage history',
            destination: PageType.HISTORY,
        },
        popup: {
            title: 'Popup Blocker (P)',
            description: 'Manage Popup Blocker',
            destination: PageType.POPUP_BLOCKER,
        },
    }

    constructor() {
        super()
        this.render()
    }

    private render(): void {
        this.label.title = `Search or enter address (⌘L)`
        this.label.child = this.search
        this.root.appendChild(this.label.element)

        this.cardsContainer = document.createElement('section')
        this.cardsContainer.className =
            'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-2'

        Object.keys(this.buttons).forEach((key) => {
            const info = this.buttons[key]
            const card = new Card()

            card.title = info.title
            card.description = info.description
            card.addEventListener('click', () =>
                Controller.getInstance().switch(info.destination),
            )

            this.cardsContainer.appendChild(card.element)
        })

        this.root.appendChild(this.cardsContainer)
    }

    action(action: TableAction) {
        if (action === TableAction.FOCUS) {
            this.search.focus()
            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (document.activeElement.tagName.toLowerCase() !== 'input') {
            switch (e.key) {
                case 'B':
                case 'b':
                    Controller.getInstance().switch(PageType.BOOKMARK)
                    return
                case 'h':
                case 'H':
                    Controller.getInstance().switch(PageType.HISTORY)
                    return
                case 'a':
                case 'A':
                    Controller.getInstance().switch(PageType.ANCHOR)
                    return
                case 'p':
                case 'P':
                    Controller.getInstance().switch(PageType.POPUP_BLOCKER)
                    return
            }
        } else {
            if (e.key === 'Enter') {
                if (!this.search.value) {
                    return
                }

                IPC.getInstance().navigate(this.search.value)
                this.search.value = ''
                return
            }
        }

        super.doShortcut(e)
    }
}
