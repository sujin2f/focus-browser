import { PageType, TableAction } from '@src/types'
import Controller from '@home/controller'
import IPC from '@home/modules/ipc'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import A_Page from '.'

export default class Welcome extends A_Page<null> {
    action(action: TableAction, ...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }

    public readonly page = PageType.WELCOME

    constructor() {
        super()
        this.render()
    }

    private render(): void {}
}
