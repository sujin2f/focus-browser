import { Element } from '@home/modules/fragments'
import { TrLinked } from '@home/modules/fragments/tr-linked'

import type { ElementProps } from '@src/common/types'

export class DataTable<
    D extends Record<string, unknown>,
> extends Element<HTMLDivElement> {
    private table: Element<HTMLTableElement>
    private head?: Element<HTMLTableSectionElement>
    private headRow?: Element<HTMLTableRowElement>
    private body: Element<HTMLTableSectionElement>
    public children: TrLinked<D>[] = []

    constructor() {
        super({ tag: 'div' })

        this.className(
            'w-full',
            'h-full',
            'overflow-x-auto',
            'overflow-y-hidden',
            'bg-clip-border',
        )
        this.table = new Element<HTMLTableElement>({
            tag: 'table',
            className: ['table-auto', 'min-w-max', 'border-collapse', 'w-full'],
        })
        this.element.append(this.table.element)
        this.body = new Element<HTMLTableSectionElement>({ tag: 'tbody' })
        this.table.append(this.body)
        this.children = []
    }

    public appendHead(...children: Element<HTMLTableCellElement>[]) {
        if (!this.head) {
            this.headRow = new Element({ tag: 'tr' })
            this.head = new Element<HTMLTableSectionElement>({
                tag: 'thead',
            }).append(this.headRow)
            this.table.prepend(this.head)
        }
        this.headRow!.append(...children)
    }

    public createTh(
        { className = [] }: Partial<ElementProps<unknown>> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        const th = new Element<HTMLTableCellElement>({
            tag: 'th',
            className: [
                ...className,
                'p-2',
                'border-b',
                'border-blue-gray-100',
                'dark:border-blue-gray-500',
            ],
        }).append(...children)
        return th
    }

    public createTd(
        { className = [], onClick }: Partial<ElementProps<unknown>> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        const td = new Element<HTMLTableCellElement>({
            tag: 'td',
            className: [
                ...className,
                'p-2',
                'border-b',
                'border-blue-gray-50',
                'dark:border-blue-gray-100',
            ],
            onClick,
        }).append(...children)
        return td
    }

    public createFixedCell(
        type: 'th' | 'td' = 'td',
        { className = [], onClick }: Partial<ElementProps<unknown>> = {},
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

    public appendBody(...children: TrLinked<D>[]) {
        this.body.append(...(children as Element<HTMLElement>[]))
        this.children.push(...children)
    }

    public prependBody(...children: TrLinked<D>[]) {
        this.body.prepend(...(children as Element<HTMLElement>[]))
        this.children.unshift(...children)
    }

    public reset() {
        this.children.forEach((row) => row.element.remove())
        this.children = []
        return this
    }
}
