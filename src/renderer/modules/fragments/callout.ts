import { Channel, ElementProps, RequestHandler, TableAction } from '@src/types'
import { Element } from '.'
import Button from './button'
import { ipcRenderer } from '@home/util'
import Controller from '../controller'

export default class Callout extends Element<HTMLDivElement> {
    private button: Button
    private wrapper: Element<HTMLDivElement>

    constructor(
        props: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super('div', props)
        this.element.classList.add(
            'p-3',
            'w-full',
            'border',
            'border-transparent',
            'bg-zinc-800',
            'rounded-md',
            'text-center',
        )

        this.init(...children)
    }

    private init(...children: (string | Element<HTMLElement>)[]) {
        this.button = new Button(
            {
                className: ['mt-3', '-mb-3'],
                onClick: (e) => {
                    e.preventDefault()
                    ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                        helpText: false,
                    })
                    Controller.getInstance().setting.helpText = false
                    Controller.getInstance().currentPage.action(
                        TableAction.INFO,
                    )
                },
            },
            'Hide Tip',
        )
        this.wrapper = new Element('div')
        this.wrapper.append(...children)

        this.element.innerHTML = ''
        this.element.append(this.wrapper.element, this.button.element)
    }

    public append(...children: (string | Element<HTMLElement>)[]) {
        if (!this.wrapper) {
            this.init()
        }
        this.wrapper.append(...children)
    }

    public prepend(...children: (string | Element<HTMLElement>)[]) {
        if (!this.wrapper) {
            this.init()
        }
        this.wrapper.prepend(...children)
    }
}
