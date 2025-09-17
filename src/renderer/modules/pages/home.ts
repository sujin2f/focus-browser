import { CC_Pages } from '@src/types'
import Controller from '@home/controller'
import IPC from '@home/modules/ipc'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import A_Page from '.'

type Button = {
    title: string
    description: string
    destination: CC_Pages
}

export default class Home extends A_Page<null> {
    public readonly page = CC_Pages.Home

    private search: Input = new Input()

    public get mode() {
        return this._mode
    }
    public set mode(mode: number) {
        // Un-focus search
        if (mode === 0) {
            this.search.blur()
        }

        this._mode = mode
    }

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
        this.search.placeholder = 'Search or enter address (⌘L)'
        this.search.addEventListener('keydown', (e) => this.onAddressEnter(e))
        this.search.addEventListener('blur', () => {
            this.mode = 0
        })
        this.search.addEventListener('focus', () => {
            this.mode = 1
        })
        this.root.appendChild(this.search.element)

        const cards = document.createElement('div')
        cards.className = 'grid grid-cols-2 sm:grid-cols-3'

        Object.keys(this.buttons).forEach((key) => {
            const info = this.buttons[key]
            const card = new Card()

            card.title = info.title
            card.description = info.description
            card.addEventListener('click', () =>
                this.onCardClick(info.destination),
            )

            cards.appendChild(card.element)
        })

        this.root.appendChild(cards)
    }

    private onCardClick(page: CC_Pages) {
        Controller.getInstance().switch(page)
    }

    private onAddressEnter(e: KeyboardEvent) {
        if (e.key !== 'Enter') {
            return
        }

        if (!this.search.value) {
            return
        }

        IPC.getInstance().navigate(this.search.value)
    }

    public action(action: string) {
        if (action === 'focus') {
            this.search.focus()
        }
    }

    refresh(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    arrowUp(): void {
        throw new Error('Method not implemented.')
    }
    arrowDown(): void {
        throw new Error('Method not implemented.')
    }
    onEnter(): string {
        throw new Error('Method not implemented.')
    }
    create(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    read(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    update(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    delete(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
}
