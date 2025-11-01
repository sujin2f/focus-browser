import type { ElementProps } from '@src/types'
import { Element } from '.'

type Props = {
    label: string
    type: string
    value: string
    checked: boolean
    maxLength: number
    onChange: (ev: HTMLElementEventMap['change']) => unknown
}

export class Input extends Element<HTMLLabelElement> {
    private _input: Element<HTMLInputElement>
    public get input() {
        return this._input
    }
    private _label: Element<HTMLParagraphElement>

    private _error?: Element<HTMLParagraphElement>
    public set error(error: string) {
        if (this._error) {
            this._error.destroy()
        }

        if (!error) {
            this._input.classList.remove(
                'border-pink-900',
                'dark:border-pink-600',
            )
            this._input.classList.add(
                'border-gray-300',
                'dark:border-transparent',
            )
            return
        }

        this._input.classList.add('border-pink-900', 'dark:border-pink-600')
        this._input.classList.remove(
            'border-gray-300',
            'dark:border-transparent',
        )
        this._error = new Element(
            'p',
            {
                className: [
                    'mt-1',
                    'pl-3',
                    'text-pink-900',
                    'dark:text-pink-600',
                ],
            },
            error,
        )
        this.append(this._error)
    }

    public set label(label: string) {
        if (this._label) {
            this._label.destroy()
        }

        this._label = new Element<HTMLParagraphElement>(
            'p',
            {
                className: [
                    'inline-block',
                    'text-md',
                    'font-light',
                    'text-gray-700',
                    'mb-0.5',
                    'pl-3',
                    'dark:text-gray-300',
                ],
            },
            label,
        )
        this.prepend(this._label)
    }

    public set type(type: string) {
        this._input.element.type = type

        if (type !== 'checkbox' && type !== 'radio') {
            this._input.classList.add(
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
            )
        } else {
            this._input.classList.add('ml-4')
        }
    }

    public set placeholder(placeholder: string) {
        this._input.element.placeholder = placeholder
    }

    public set maxLength(maxLength: number) {
        this._input.element.maxLength = maxLength
    }

    public set value(value: string) {
        this._input.element.value = value
    }

    public get value() {
        return this._input.element.value
    }

    public set checked(checked: boolean) {
        if (
            this._input.element.type !== 'checkbox' &&
            this._input.element.type !== 'radio'
        ) {
            throw new Error(
                'Checked attribute only allowed for checkbox or radio type.',
            )
        }
        this._input.element.checked = checked
    }

    public get checked() {
        if (
            this._input.element.type !== 'checkbox' &&
            this._input.element.type !== 'radio'
        ) {
            throw new Error(
                'Checked attribute only allowed for checkbox or radio type.',
            )
        }

        return this._input.element.checked
    }

    public focus() {
        this._input.element.focus()
    }

    public blur() {
        this._input.element.blur()
    }

    public constructor(
        { className = [], ...props }: Partial<ElementProps & Props> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super(
            'label',
            {
                className: [...className, 'mb-4', 'block'],
                ...props,
            },
            ...children,
        )

        this._input = new Element('input')
        this.element.append(this._input.element)

        if (props.label) {
            this.label = props.label
        }

        this.type = props.type ? props.type : 'text'

        if (props.value) {
            this.value = props.value
        }

        if (props.checked) {
            this.checked = props.checked
        }

        if (props.onChange) {
            this.addEventListener('change', props.onChange.bind(this))
        }

        if (props.maxLength) {
            this.maxLength = props.maxLength
        }
    }
}
