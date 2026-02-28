import { WebContentsView } from 'electron'

export abstract class AbsView extends WebContentsView {
    protected active: boolean = false

    public show() {
        this.active = true
        this.webContents.focus()
    }

    public hide() {
        this.active = false
    }

    public reload() {
        // 🤬 Not Active
        if (!this.active) return
    }
}
