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

    constructor(title: string, description?: string) {
        super('#list-item')

        this.element.querySelector('h3')!.textContent = title
        if (description) {
            this.element.querySelector('p')!.textContent = description
        } else {
            this.element.querySelector('p')!.remove()
        }
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        if (this._clickable) {
            this.element.addEventListener('click', callback.bind(this))
        }
        return this
    }
}
