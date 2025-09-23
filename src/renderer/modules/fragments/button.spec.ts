import * as fs from 'fs'
import * as path from 'path'
import Button from './button'

describe('button.spec.ts', () => {
    beforeAll(async () => {
        const html = fs.readFileSync(
            path.resolve(__dirname, '../../templates/index.html'),
            'utf-8',
        )
        document.documentElement.innerHTML = html.toString()
    })

    test('button', async () => {
        const button = new Button()
        button.innerHTML = 'Click me'
        let clicked = false
        button.addEventListener('click', () => {
            clicked = true
        })
        button.element.click()
        expect(clicked).toBeTruthy()
    })
})
