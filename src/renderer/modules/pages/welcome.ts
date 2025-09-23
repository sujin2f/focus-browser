import { PageType, TableAction } from '@src/types'
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
