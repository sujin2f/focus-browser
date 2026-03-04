/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* Models */
import { Logger } from '@src/common/logger'

import '@src/renderer/styles/common.css'

class Find {
    private input = document.querySelector<HTMLInputElement>('#input')!
    private found = document.querySelector<HTMLDivElement>('#found')!
    private prev = document.querySelector<HTMLButtonElement>('#prev')!
    private next = document.querySelector<HTMLButtonElement>('#next')!
    private cancel = document.querySelector<HTMLButtonElement>('#cancel')!

    constructor() {
        this.input.focus()
        this.input.addEventListener('input', () => {
            this.found.innerHTML = ''
            if (!this.input.value) {
                ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                    text: '',
                    reset: true,
                })
                return
            }

            ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                text: this.input.value,
                forward: true,
            })
        })
        this.input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                    text: this.input.value,
                    forward: true,
                })
                return
            }
        })

        ipcRenderer.on(IPC_CHANNELS.FIND, (_, args) => {
            Logger.init().log('Find renderer gets IPC', args)
            if (args?.reset) {
                this.input.value = ''
                this.found.innerHTML = ''
                return
            }

            if (args?.focus) {
                this.input.select()
                this.input.focus()
                return
            }

            if (args?.matches && args.activeMatchOrdinal) {
                this.found.innerHTML = `${args.activeMatchOrdinal}/${args.matches}`
                return
            }
        })

        this.prev.addEventListener('click', () => {
            ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                text: this.input.value,
                forward: false,
            })
        })

        this.next.addEventListener('click', () => {
            ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                text: this.input.value,
                forward: true,
            })
        })

        this.cancel.addEventListener('click', () => {
            ipcRenderer.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.REQUEST, {
                text: '',
                stop: true,
            })
            this.found.innerHTML = ''
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Find()
})
