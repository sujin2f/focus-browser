import Store from './store'

type Props = {
    width: number
    height: number
    maxHistory: number
    welcome: boolean
}

export default class Status extends Store<Props> {
    constructor() {
        super(
            'status',
            {
                width: 1024,
                height: 728,
                maxHistory: 200,
                welcome: true,
            },
            false,
        )
    }

    public getNumber(key: string) {
        return super.get(key) as number
    }

    public setNumber(key: string, value: number) {
        super.set(key, value)
    }
}
