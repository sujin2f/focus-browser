import Button from './button'

describe('button.spec.ts', () => {
    test('button', async () => {
        const button = new Button()
        button.append('Click me')
        let clicked = false
        button.addEventListener('click', () => {
            clicked = true
        })
        button.element.click()
        expect(clicked).toBeTruthy()
    })
})
