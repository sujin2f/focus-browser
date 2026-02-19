import { A_Element } from './abs-element'

export class ListItem extends A_Element<HTMLDivElement> {
    public get title() {
        return this.element.querySelector('h3')!
    }

    public set title(title: string | HTMLElement) {
        this.element.querySelector('h3')!.textContent = ''
        this.element.querySelector('h3')!.append(title)
    }

    // If you need this element's click action to differ other columns, set this false and append additional button in title
    private _clickable = true
    public set clickable(clickable: boolean) {
        this._clickable = clickable
    }
    public get clickable() {
        return this._clickable
    }

    constructor(
        private _title: string | A_Element<HTMLElement>,
        private _description?: string,
    ) {
        super('#list-item')
    }

    protected init() {
        if (typeof this._title === 'string') {
            this.element.querySelector('h3')!.textContent = this._title
        } else {
            this._title.appendTo(this.title)
        }
        if (this._description) {
            this.element.querySelector('p')!.textContent = this._description
        } else {
            this.element.querySelector('p')!.remove()
        }

        if (this.onClickCallback) {
            this.setOnClick(this.onClickCallback)
        }
    }

    private onClickCallback?: ((e: PointerEvent) => void) | (() => void)
    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        if (this._clickable) {
            try {
                this.element.addEventListener('click', callback.bind(this))
            } catch {
                this.onClickCallback = callback
            }
        }
        return this
    }
}
