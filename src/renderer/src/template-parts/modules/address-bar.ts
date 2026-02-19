/* Utils */
import { navigate, getSection } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Input } from '@src/renderer/src/template-parts/input'

export const getAddressBar = (section: string) => {
    const input = new Input(
        'Enter search keyword or address (⌘L)',
        'address',
    ).appendTo(section)

    getSection<HTMLFormElement>(section).addEventListener('submit', () => {
        if (!input.value) {
            return
        }
        navigate(input.value)
    })

    return input
}
