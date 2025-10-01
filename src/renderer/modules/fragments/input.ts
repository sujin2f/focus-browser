import { ElementProps } from '@src/types'
import { Element } from '.'

type Props = {
    type: string
    value: string
    checked: boolean
    onChange: (ev: HTMLElementEventMap['change']) => any
}

export default class Input extends Element<HTMLInputElement> {
    public set type(type: string) {
        this.element.type = type

        if (type !== 'checkbox' && type !== 'radio') {
            this.element.classList.add(
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
                'mb-4',
            )
        } else {
            this.element.classList.add('ml-4')
        }
    }

    public set placeholder(placeholder: string) {
        this.element.placeholder = placeholder
    }

    public set maxLength(maxLength: number) {
        this.element.maxLength = maxLength
    }

    public set value(value: string) {
        this.element.value = value
    }

    public get value() {
        return this.element.value
    }

    public set checked(checked: boolean) {
        if (this.element.type !== 'checkbox' && this.element.type !== 'radio') {
            throw new Error(
                'Checked attribute only allowed for checkbox or radio type.',
            )
        }
        this.element.checked = checked
    }

    public get checked() {
        if (this.element.type !== 'checkbox' && this.element.type !== 'radio') {
            throw new Error(
                'Checked attribute only allowed for checkbox or radio type.',
            )
        }

        return this.element.checked
    }

    public focus() {
        this.element.focus()
    }

    public blur() {
        this.element.blur()
    }

    public constructor(
        props: Partial<ElementProps & Props> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super('input', props, ...children)

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
    }
}
