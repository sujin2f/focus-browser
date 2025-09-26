export type DataListType<T> = T & {
    prev?: T
    next?: T
}

type Constructor<T = {}> = new (...args: any[]) => T

function DataList<T extends Constructor>(Base: T) {
    return class extends Base {
        declare public prev?: T
        declare public next?: T
    }
}
export default DataList
