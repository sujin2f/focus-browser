import {
    IPC_CHANNELS,
    RequestHandler,
    BROWSER,
    CENTRE_PAGES,
    CustomEvents,
} from '@src/common/constants'

export const checkElectron = () => {
    if (!window.electron) {
        throw new Error('Electron is not set.')
    }
}

export const ipcRenderer = {
    on: window.electron.ipcRenderer.on,
    send: window.electron.ipcRenderer.sendMessage,
    once: window.electron.ipcRenderer.once,
}

export const navigate = (url?: string, handler?: RequestHandler) => {
    document.dispatchEvent(new SwitchEvent(CENTRE_PAGES.HOME))
    if (url) {
        ipcRenderer.send(IPC_CHANNELS.SWITCH, BROWSER, url, handler)
        window.location.href = 'loading.html'
        return
    }
    ipcRenderer.send(IPC_CHANNELS.SWITCH, BROWSER)
    window.location.href = 'loading.html'
}

export const isMac = () => navigator.userAgent.indexOf('Mac') != -1

export const ctrlOrComm = () => (isMac() ? '⌘' : 'Ctrl')

export class SwitchEvent extends CustomEvent<CENTRE_PAGES> {
    constructor(detail: CENTRE_PAGES) {
        super(CustomEvents.SWITCH, { detail })
    }
}

export const tagNameIs = (
    element: HTMLElement | EventTarget | null,
    tagName: string,
): boolean => {
    if (!element) {
        return false
    }

    return (
        (element as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()
    )
}

export const getSection = <T extends HTMLElement>(id: string) => {
    const element = document.querySelector<HTMLElement>(`#section-${id}`) as T
    if (!element) {
        // TODO ipc
        throw new Error(`No #section-${id} element exist`)
    }
    return element
}

export const byteToSize = (byte: number): string => {
    const mb = 1024 * 1024
    if (byte < mb) {
        return `${byte} bytes`
    } else if (byte < mb * 1024) {
        const size = byte / mb
        return `${size.toFixed(2)} Mb`
    }
    const size = byte / (mb * 1024)
    return `${size.toFixed(2)} Gb`
}
