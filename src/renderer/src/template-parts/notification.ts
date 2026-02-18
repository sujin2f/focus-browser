import { A_Element } from './abs-element'

export class Notification extends A_Element<HTMLElement> {
    constructor() {
        super('#notification')
    }

    private showNotification(message: string) {
        const notification = this.select('notification')
        notification.innerHTML = message
        notification.classList.remove('notification')
        setTimeout(() => {
            notification.classList.add('notification')
        }, 1)
    }

    public info(message: string) {
        const notification = this.select('notification')
        notification.classList.remove('bg-orange-600')
        notification.classList.add('bg-emerald-600')
        this.showNotification(message)
    }

    public error(message: string) {
        const notification = this.select('notification')
        notification.classList.add('bg-orange-600')
        notification.classList.remove('bg-emerald-600')
        this.showNotification(message)
    }
}
