import * as fs from 'fs'
import * as path from 'path'
import { Element } from '@home/modules/fragments'
import { PageType, TableAction } from '@src/types'
import { TrLinked } from '@home/modules/fragments/tr-linked'
import { A_PageWithTable } from './abs_with_table'
import { isMac } from '@home/util'

class Test extends A_PageWithTable<string> {
    order: 'ASC' | 'DESC' = 'ASC'
    refresh(): void {
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

    getRowCells(tr: TrLinked): Element<HTMLTableCellElement>[] {
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
                new KeyboardEvent('keydown', { code: 'KeyF', metaKey: true }),
            )
        } else {
            document.dispatchEvent(
                new KeyboardEvent('keydown', { code: 'KeyF', ctrlKey: true }),
            )
        }

        expect(
            document
                .querySelector('#root')
                .querySelector('form')
                .classList.contains('hidden'),
        ).toBeFalsy()
    })
})
