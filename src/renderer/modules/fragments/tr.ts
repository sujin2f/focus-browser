import { A_HTMLFragment } from '.'

export default class Tr extends A_HTMLFragment<HTMLTableRowElement> {
    public dataIndex: number = NaN
    constructor() {
        super('template--table__tr')
    }
}
