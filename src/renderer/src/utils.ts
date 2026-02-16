import {
    IPC_CHANNELS,
    RequestHandler,
    BROWSER,
    CENTRE_PAGES,
    CTRL,
    CustomEvents,
} from '@src/common/constants'
import { Element } from '@src/renderer/src/modules/fragments'
import { Keyboard } from './modules/fragments/keyboard'

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
        return
    }
    ipcRenderer.send(IPC_CHANNELS.SWITCH, BROWSER)
}

export const shortcutToHtml = (shortcut: string): Element<HTMLElement>[] => {
    const keys = shortcut
        .split('+')
        .map((key) => key.trim())
        .map((key) => new Keyboard().append(key === CTRL ? ctrlOrComm() : key))

    return keys
        .flatMap((n) => [
            n,
            new Element({
                tag: 'span',
                className: ['text-gray-500'],
            }).append('+'),
        ])
        .slice(0, -1)
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
