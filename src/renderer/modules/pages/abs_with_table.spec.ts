import * as fs from 'fs'
import * as path from 'path'
import { Element } from '@home/modules/fragments'
import { PageMode, PageType, TableAction } from '@src/types'
import type { DataListType } from '@home/modules/fragments/data-list'
import { A_PageWithTable } from './abs_with_table'
import { isMac } from '@home/util'

class Test extends A_PageWithTable<string> {
    order: 'ASC' | 'DESC' = 'ASC'
    cbInfoUpdated(): void {
        throw new Error('Method not implemented.')
    }
    page: PageType = PageType.WELCOME

    constructor() {
        super()
        this.init()
    }

    /**
     * Request IPC for table data
     */
    request(): void {}
    getTHeads(): Element<HTMLTableCellElement>[] {
        return [this.table.createTh()]
    }

    getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
    ): Element<HTMLTableCellElement>[] {
        const td = this.table.createTd()
        td.innerHTML = tr.getData('data') as string
        return [td]
    }
    filterCondition(item: string): boolean {
        return item === this.searchKeyword
    }

    action(action: TableAction, items: string[] = []) {
        super.action(action, items)
    }
    doShortcut(e: KeyboardEvent): boolean {
        if (super.doShortcut(e)) {
            return
        }

        // Find mode
        if (e.location === e.DOM_KEY_LOCATION_STANDARD) {
            this.changeMode(PageMode.FIND)
        }
    }
}

describe('A_PageWithTable', () => {
    beforeAll(async () => {
        const html = fs.readFileSync(
            path.resolve(__dirname, '../../templates/index.html'),
            'utf-8',
        )
        document.documentElement.innerHTML = html.toString()

        const table = new Test()
        table.action(TableAction.UPDATE, ['ab', 'bc', 'cd'])

        document.addEventListener('keydown', (e) => table.doShortcut(e))
    })

    test('meta + F to open find form', async () => {
        expect(
            document
                .querySelector('#root')
                .querySelector('form')
                .classList.contains('hidden'),
        ).toBeTruthy()

        if (isMac()) {
            document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'f', metaKey: true }),
            )
        } else {
            document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }),
            )
        }

        expect(
            document
                .querySelector('#root')
                .querySelector('form')
                .classList.contains('hidden'),
        ).toBeFalsy()
    })

    test('a to open find form and find', async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        document.querySelector('input').value = 'a'
        document
            .querySelector('input')
            .dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))

        const tr = document.querySelectorAll('tr')
        expect(tr[0].classList.contains('hidden')).toBeFalsy()
        expect(tr[1].classList.contains('hidden')).toBeTruthy()
        expect(tr[2].classList.contains('hidden')).toBeTruthy()
    })
})
