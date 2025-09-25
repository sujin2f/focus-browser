import { ElementProps } from '@src/types'
import { Element } from '.'

export default class Table extends Element<HTMLDivElement> {
    private table: Element<HTMLTableElement>
    private head?: Element<HTMLTableSectionElement>
    private headRow?: Element<HTMLTableRowElement>
    private body: Element<HTMLTableSectionElement>
    public children: Element<HTMLTableRowElement>[] = []

    constructor() {
        super('div')
        this.init()
    }

    private init() {
        this.element.classList.add(
            'w-full',
            'h-full',
            'overflow-x-auto',
            'overflow-y-hidden',
            'bg-clip-border',
        )
        this.table = new Element<HTMLTableElement>('table')
        this.table.classList.add(
            'table-auto',
            'min-w-max',
            'border-collapse',
            'w-full',
        )
        this.element.append(this.table.element)
        this.body = new Element<HTMLTableSectionElement>('tbody')
        this.table.append(this.body)
        this.children = []
    }

    public appendHead(...children: Element<HTMLTableCellElement>[]) {
        if (!this.body) {
            this.init()
        }
        if (!this.head) {
            this.headRow = new Element('tr')
            this.head = new Element('thead', {}, this.headRow)
            this.table.prepend(this.head)
        }
        this.headRow.append(...children)
    }

    public createTh(
        { className = [] }: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        const th = new Element<HTMLTableCellElement>(
            'th',
            {
                className: [
                    ...className,
                    'p-2',
                    'border-b',
                    'border-blue-gray-100',
                    'dark:border-blue-gray-500',
                ],
            },
            ...children,
        )
        return th
    }

    public createTd(
        { className = [], onClick }: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        const td = new Element<HTMLTableCellElement>(
            'td',
            {
                className: [
                    ...className,
                    'p-2',
                    'border-b',
                    'border-blue-gray-50',
                    'dark:border-blue-gray-100',
                ],
                onClick,
            },
            ...children,
        )
        return td
    }

    public createFixedCell(
        type: 'th' | 'td' = 'td',
        { className = [], onClick }: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        const props = {
            className: [
                ...className,
                'sticky',
                'left-0',
                'indent-1',
                'bg-white',
                'dark:bg-gray-950',
                'w-1',
                'text-center',
            ],
            onClick,
        }
        return type === 'td'
            ? this.createTd(props, ...children)
            : this.createTh(props, ...children)
    }

    public append(...children: Element<HTMLTableRowElement>[]) {
        if (!this.body) {
            this.init()
        }

        this.body.append(...children)
        this.children.push(...children)
    }

    public prepend(...children: Element<HTMLTableRowElement>[]) {
        if (!this.body) {
            this.init()
        }
        this.body.prepend(...children)
        this.children.unshift(...children)
    }

    public reset() {
        this.body.innerHTML = ''
    }
}
