import { CC_Modes, CC_Pages } from '@src/types'

export default abstract class A_Page<T> {
    protected items: T[] = []

    /**
     * Identifier
     */
    public abstract readonly page: CC_Pages

    /**
     * Modes like list, edit, find...
     */
    protected _mode: CC_Modes = CC_Modes.List
    abstract mode: CC_Modes

    /**
     * All starts with here
     */
    protected get root() {
        return document.getElementById('root')
    }
    constructor() {
        this.root.innerHTML = ''
    }

    /**
     * For update and refresh
     */
    abstract refresh(): void

    /**
     * Table Navigation
     */
    protected _cursor = -1
    protected _current: number = NaN
    protected _numRows = 0

    protected set cursor(cursor: number) {
        this._cursor = cursor
        if (this._cursor === -1) {
            this._current = NaN
        }
    }
    abstract arrowUp(): void
    abstract arrowDown(): void

    /**
     * When user pushes Enter
     */
    abstract onEnter(): void

    /**
     * CRUD
     */
    abstract create(...arg: unknown[]): void
    abstract read(...arg: unknown[]): void
    abstract update(...arg: unknown[]): void
    abstract delete(...arg: unknown[]): void

    /**
     * For additional actions
     */
    abstract action(...arg: unknown[]): void
}
