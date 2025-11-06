import { Element } from '.'
import type { ElementProps } from '@src/common/types'

type Props = {
    label: string
    type: string
    value: string
    checked: boolean
    maxLength: number
    helpText: string
    onChange: (ev: HTMLElementEventMap['change']) => unknown
}

/**
 * Layout
 * <label>
 *     <p>Label</p>
 *     <input />
 *     <p>help text</p>
 *     <p>error</p>
 * </label>
 */
export class Input extends Element<HTMLLabelElement> {
    private _input: Element<HTMLInputElement> = new Element({ tag: 'input' })
    private _label: Element<HTMLParagraphElement> =
        new Element<HTMLParagraphElement>({
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
        })
    private _helpText: Element<HTMLParagraphElement> =
        new Element<HTMLParagraphElement>({
            tag: 'p',
            className: [
                'mt-1',
                'pl-3',
                'font-light',
                'text-gray-800',
                'dark:text-gray-500',
                'italic',
            ],
        })
    private _error: Element<HTMLParagraphElement> =
        new Element<HTMLParagraphElement>({
            tag: 'p',
            className: ['mt-1', 'pl-3', 'text-pink-900', 'dark:text-pink-600'],
        })

    public constructor({
        className = [],
        helpText,
        label,
        value,
        checked,
        maxLength,
        onChange,
        ...props
    }: Partial<ElementProps<null> & Props> = {}) {
        super({
            tag: 'label',
            className: [...className, 'mb-4', 'block'],
            ...props,
        })

        this.append(this._label)
        this.append(this._input)
        this.append(this._helpText)
        this.append(this._error)

        this.type = props.type ? props.type : 'text'
        this.helpText = helpText
        this.error = null

        if (label) {
            this.label = label
        }
        if (value) {
            this.value = value
        }
        if (checked) {
            this.checked = checked
        }
        if (maxLength) {
            this.maxLength = maxLength
        }

        if (onChange) {
            this.addEventListener('change', onChange.bind(this))
        }
    }

    public get input() {
        return this._input
    }

    public set label(label: string) {
        if (!label) {
            this._label.classList.add('hidden')
            return
        }
        this._label.classList.remove('hidden')
        this._label.innerHTML = label
    }

    public set helpText(helpText: string) {
        if (!helpText) {
            this._helpText.classList.add('hidden')
            return
        }
        this._helpText.classList.remove('hidden')
        this._helpText.innerHTML = helpText
    }

    public set error(error: string) {
        if (!error) {
            this._error.classList.add('hidden')

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

        this._error.classList.remove('hidden')
        this._error.innerHTML = error
        this._input.classList.add('border-pink-900', 'dark:border-pink-600')
        this._input.classList.remove(
            'border-gray-300',
            'dark:border-transparent',
        )
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
}
