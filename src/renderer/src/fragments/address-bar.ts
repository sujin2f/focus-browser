/* Utils */
import { navigate, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { Input } from '@src/renderer/src/fragments/input'

export const getAddressBar = (section: string) => {
    const input = new Input(
        'Enter search keyword or address (⌘L)',
        'address',
    ).appendTo(section)

    getSection<HTMLFormElement>(section).addEventListener('submit', () => {
        if (!input.value) {
            return
        }
        navigate(input.value.toString())
    })

    return input
}
