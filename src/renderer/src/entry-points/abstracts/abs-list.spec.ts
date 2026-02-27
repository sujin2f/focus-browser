// yarn test abs-list.spec.ts

import { A_List } from './abs-list'
import { ListItem } from '@home/template-parts//list-item'
import { EMOJI } from '@src/common/constants'

const show = jest.fn()
const hide = jest.fn()
class Test extends A_List<string> {
    protected items = [{ data: 'item1', items: [] as unknown as ListItem[] }]
    protected dirs = {
        item1: {
            data: 'dir1',
            hidden: true,
            dir: [{ title: '' } as unknown as ListItem],
            items: [{ show, hide } as unknown as ListItem],
        },
    }
    protected folderIndex = 0

    public click() {
        this.onDirectoryClick('item1')
    }

    public getDir() {
        return this.dirs.item1
    }
}

describe('A_PageWithTable', () => {
    beforeAll(async () => {
        document.documentElement.innerHTML = ``
    })

    test('📂 Open and Close directory', async () => {
        const list = new Test()

        list.click()
        const dir1 = list.getDir()
        expect(dir1.hidden).toBeFalsy()
        expect(dir1.dir[0].title).toBe(EMOJI.FOLDER_OPEN)
        expect(show).toHaveBeenCalled()

        list.click()
        const dir2 = list.getDir()
        expect(dir2.hidden).toBeTruthy()
        expect(dir2.dir[0].title).toBe(EMOJI.FOLDER_CLOSE)
        expect(hide).toHaveBeenCalled()
    })
})
