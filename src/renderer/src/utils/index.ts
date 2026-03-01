import { BROWSER, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
import { Logger } from '@home/utils/logger'

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

export const navigate = (address = '') => {
    ipcRenderer.send(IPC_CHANNELS.SWITCH, REQUEST_HANDLER.EXECUTE, {
        scene: BROWSER,
        address,
    })

    // 😃 Prevent flicker
    window.location.href = 'loading.html'
}

export const isMac = () => navigator.userAgent.indexOf('Mac') != -1
export const ctrlOrComm = () => (isMac() ? '⌘' : 'Ctrl+')
export const commandSymbol = (arg: string) => arg.replaceAll('Command+', '⌘')

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

export const getSection = <T extends Element>(id: string) => {
    const element = document.querySelector<Element>(`#section-${id}`) as T
    if (!element) {
        Logger.getInstance().error(`No #section-${id} element exist`)
        throw new Error(`No #section-${id} element exist`)
    }
    return element
}

/**
 * Extend multiple classes
 *
 * @param derivedConstructor
 * @param constructors
 * @example
 *     class Singer {
 *         sing() {}
 *     }
 *     class Dancer {
 *         dance() {}
 *     }
 *
 *     // Create the class that will implement the mixins
 *     // We use 'implements' for type checking, the actual implementation comes from the mixins
 *     class Performer implements Singer, Dancer {
 *         // We use '!' to tell TypeScript that these will be assigned at runtime
 *         sing(): void {}
 *         dance(): void {}
 *     }
 *
 *     // Apply the mixins to the Performer class
 *     applyMixins(Performer, [Singer, Dancer])
 *
 *     // Create an instance and use the methods
 *     const performer = new Performer()
 *     performer.sing()
 *     performer.dance()
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T
export const applyMixins = (
    derivedCtor: Constructor,
    constructors: Constructor[],
) => {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null),
            )
        })
    })
}
