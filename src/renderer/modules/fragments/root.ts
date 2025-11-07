import { Element } from '@home/modules/fragments'
import { TitleBar } from '@home/modules/fragments/title-bar'

export class Root extends Element<HTMLSpanElement> {
    public constructor() {
        super({
            selector: '#root',
            className: ['container', 'mx-auto'],
        })

        document.body.innerHTML = ''
        document.body.append(this.element)
    }

    reset() {
        super.reset()
        document.body.innerHTML = ''
        document.body.append(this.element)

        if (!window.controller.setting.frame) {
            new TitleBar(this)
        }

        return this
    }
}
