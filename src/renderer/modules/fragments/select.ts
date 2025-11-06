import { Element } from '.'
import type { ElementProps } from '@src/common/types'

type Props<T extends Record<string, string>> = {
    label: string
    value: string
    onChange: (ev: HTMLElementEventMap['change']) => unknown
    options: T
}

export class Select<
    T extends Record<string, string>,
> extends Element<HTMLLabelElement> {
    private _select: Element<HTMLSelectElement>
    public get select() {
        return this._select
    }
    private _label: Element<HTMLParagraphElement>

    private _error?: Element<HTMLParagraphElement>
    public set error(error: string) {
        if (this._error) {
            this._error.destroy()
        }

        if (!error) {
            this._select.classList.remove(
                'border-pink-900',
                'dark:border-pink-600',
            )
            this._select.classList.add(
                'border-gray-300',
                'dark:border-transparent',
            )
            return
        }

        this._select.classList.add('border-pink-900', 'dark:border-pink-600')
        this._select.classList.remove(
            'border-gray-300',
            'dark:border-transparent',
        )
        this._error = new Element<HTMLParagraphElement>({
            tag: 'p',
            className: ['mt-1', 'pl-3', 'text-pink-900', 'dark:text-pink-600'],
        }).append(error)
        this.append(this._error)
    }

    public set label(label: string) {
        if (this._label) {
            this._label.destroy()
        }

        this._label = new Element<HTMLParagraphElement>({
            tag: 'p',
            className: [
                'inline-block',
                'text-md',
                'font-light',
                'text-gray-700',
                'mb-0.5',
                'pl-3',
                'dark:text-gray-300',
            ],
        }).append(label)
        this.prepend(this._label)
    }

    public get value(): keyof T {
        return Object.keys(this._options)[this._select.element.selectedIndex]
    }

    public focus() {
        this._select.element.focus()
    }

    public blur() {
        this._select.element.blur()
    }

    private _options: T = {} as T

    public constructor({
        className = [],
        ...props
    }: Partial<ElementProps<null> & Props<T>> = {}) {
        super({
            tag: 'label',
            className: [...className, 'mb-4', 'block'],
            ...props,
        })
        this.label = props.label

        this._select = new Element({
            tag: 'select',
            className: [
                'w-full',
                'text-lg',
                'p-3',
                'rounded-sm',
                'border',
                'border-gray-300',
                'dark:text-white',
                'dark:bg-gray-800',
                'dark:border-transparent',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-pink-500',
            ],
        })
        this._options = props.options
        Object.keys(this._options).forEach((key: string) => {
            const option = new Element<HTMLOptionElement>({
                tag: 'option',
                value: key,
            }).append(key)
            this._select.append(option)
        })
        this.element.append(this._select.element)

        if (props.onChange) {
            this.addEventListener('change', props.onChange.bind(this))
        }
    }
}
