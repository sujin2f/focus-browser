/* Utils */
import {
    navigate,
    getSection,
    ctrlOrComm,
    commandSymbol,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Input } from '@home/template-parts/input'

export const getAddressBar = (shortcut = `${ctrlOrComm()}L`) => {
    const input = new Input(
        `Enter search keyword or address (${commandSymbol(shortcut)})`,
        'address',
    ).appendTo('address')

    getSection<HTMLFormElement>('address').addEventListener('submit', () => {
        if (!input.value) {
            return
        }
        navigate(input.value)
    })

    return input
}
