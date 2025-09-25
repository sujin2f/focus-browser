import { ElementProps } from '@src/types'
import { Element } from '.'

export default class Input extends Element<HTMLInputElement> {
    public set type(type: string) {
        this.element.setAttribute('type', type)
    }

    public set placeholder(placeholder: string) {
        this.element.setAttribute('placeholder', placeholder)
    }

    public set className(className: string) {
        this.element.setAttribute('class', className)
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

    public focus() {
        this.element.focus()
    }

    public blur() {
        this.element.blur()
    }

    public constructor(
        props: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super('input', props, ...children)
        this.type = 'text'
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
    }
}
