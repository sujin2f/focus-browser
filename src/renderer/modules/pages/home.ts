import { CC_Pages, CC_TableAction } from '@src/types'
import Controller from '@home/controller'
import IPC from '@home/modules/ipc'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import A_Page from '.'

type Button = {
    title: string
    description: string
    destination: CC_Pages
}

export default class Home extends A_Page<null> {
    public readonly page = CC_Pages.Home

    private label: Label = new Label()
    private search: Input = new Input()
    private cardsContainer: HTMLElement

    private buttons: Record<string, Button> = {
        bookmarks: {
            title: 'Bookmarks (B)',
            description: 'Manage bookmarks',
            destination: CC_Pages.Bookmark,
        },
        anchor: {
            title: 'Anchor (A)',
            description:
                'Temporary bookmark that will be deleted once you clicked it.',
            destination: CC_Pages.Anchor,
        },
        history: {
            title: 'History (H)',
            description: 'Manage history',
            destination: CC_Pages.History,
        },
        popup: {
            title: 'Popup Blocker (P)',
            description: 'Manage Popup Blocker',
            destination: CC_Pages.PopupBlocker,
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

    action(action: CC_TableAction) {
        if (action === CC_TableAction.FOCUS) {
            this.search.focus()
            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (document.activeElement.tagName.toLowerCase() !== 'input') {
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
