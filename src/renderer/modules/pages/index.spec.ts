import * as fs from 'fs'
import * as path from 'path'
import { PageMode, PageType, TableAction } from '@src/types'
import type { DataListType } from '@home/modules/fragments/data-list'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Tr from '@home/modules/fragments/tr'
import { A_PageWithTable } from '.'

class Test extends A_PageWithTable<string> {
    page: PageType = PageType.WELCOME

    constructor() {
        super()
        this.init()
    }

    request(): void {}
    render(): void {
        this.renderButtons()
        this.renderFindForm()
        this.renderTable()
        this.hideForms()

        this.root.appendChild(this.buttons)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }
    getTHeads(): Th[] {
        return [new Th()]
    }
    getRowCells(tr: DataListType<Tr>, item: string, index: number): Td[] {
        const td = new Td()
        td.innerHTML = item
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

        if (e.key.length === 1) {
            this.changeMode(PageMode.FIND)
        }
    }
}

jest.mock('@src/renderer/util', () => ({
    ipcRenderer: {
        on: jest.fn(),
        send: jest.fn(),
        once: jest.fn(),
    },
}))

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
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'f', metaKey: true }),
        )
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
