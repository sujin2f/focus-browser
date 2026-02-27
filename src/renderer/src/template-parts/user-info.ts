import { A_Element } from './abs-element'
/* Utils */
import { getSection, navigate } from '@src/renderer/src/utils'
import { Button } from './button'
import { BROWSER, EMOJI, SUJINC_URL } from '@src/common/constants'

export class UserInfo extends A_Element<HTMLElement> {
    protected _element: HTMLElement = getSection('user-info')
    public get element(): HTMLElement {
        return this._element
    }

    public set picture(picture: string) {
        getSection('user-picture').innerHTML = ''
        if (picture) {
            const img = document.createElement('img')
            img.width = 35
            img.height = 35
            img.src = picture
            img.classList.add('w-8', 'h-8')

            getSection('user-picture').append(img)
            this.loggedIn()
            return
        }
        this.loggedOut()
    }

    constructor() {
        super('')
        new Button(`${EMOJI.LOGIN} Log In`)
            .appendTo(this.select('log-in'))
            .setOnClick(() => {
                navigate({ scene: BROWSER, address: SUJINC_URL })
            })
        this.select('logged-in').addEventListener('click', () => {
            navigate({ scene: BROWSER, address: SUJINC_URL })
        })
    }

    show() {
        this.element.classList.remove('hidden')
        return this
    }

    hide() {
        this.element.classList.add('hidden')
        return this
    }

    loggedIn() {
        this.select('logged-in').classList.add('flex')
        this.select('logged-in').classList.remove('hidden')
        this.select('log-in').classList.add('hidden')
        this.show()
        return this
    }

    loggedOut() {
        this.select('logged-in').classList.remove('flex')
        this.select('logged-in').classList.add('hidden')
        this.select('log-in').classList.remove('hidden')
        this.show()
        return this
    }
}
