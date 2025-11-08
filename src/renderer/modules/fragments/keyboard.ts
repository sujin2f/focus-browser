import { Element } from '@home/modules/fragments'

export class Keyboard extends Element<HTMLSpanElement> {
    public constructor() {
        super({
            tag: 'kbd',
            className: [
                'inline-block',
                'border-4',
                'dark:border-t-white',
                'dark:border-r-gray-400',
                'dark:border-b-gray-700',
                'dark:border-l-gray-700',
                'bg-gray-300',
                'pl-2',
                'pr-2',
                'dark:text-black',
            ],
        })
    }
}
