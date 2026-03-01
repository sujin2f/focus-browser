// /* Models */
// import { Store } from '@main/store/store'
// /* Utils */
// import { fetchFavicon, getSafeUrl } from '@src/common/utils/common'

// type T_Favicon_Store = { lastAccess: number; image: string }
// type T_Store = {
//     version: number
//     favicon: { [domain: string]: T_Favicon_Store }
// }
// export class Favicon extends Store<T_Store> {
//     protected fileName = 'favicon'
//     protected defaults = { version: 1, favicon: {} }

//     constructor(path?: string) {
//         super(path)
//         this.parse()
//     }

//     async store<R>(callback: (store: Favicon) => R): Promise<R> {
//         return callback(this)
//     }

//     get(_url: string): string | void {
//         // 😃 Has value
//         if (this.data.favicon[_url]) return this.data.favicon[_url].image

//         const url = getSafeUrl(_url)

//         // 🤬 URL is not valid
//         if (!url) return

//         // 😃 Has value
//         if (this.data.favicon[url.hostname])
//             return this.data.favicon[url.hostname].image
//     }

//     async set(_url: string): Promise<string> {
//         const url = getSafeUrl(_url)
//         // 🤬 URL is not valid
//         if (!url) throw new Error(`URL is not valid: ${_url}`) // TODO Log & Error

//         // 😃 Duplication
//         const host = url.hostname
//         const exist = this.get(host)
//         if (exist) return exist

//         const origin = `${url.protocol}//${host}`
//         const favicon = await fetchFavicon(origin).then((image) => {
//             // 🤬 URL does not have favicon
//             if (!image) throw new Error(`Could not find favicon from ${origin}`) // TODO Log & Error

//             this.data.favicon[host] = {
//                 image,
//                 lastAccess: new Date().getTime() / 1000,
//             }

//             return this.data.favicon[host]
//         })
//         return favicon.image
//     }

//     async update

//     async remove(_url: string) {
//         const url = getSafeUrl(_url)
//         // 🤬 URL is not valid
//         if (!url) throw new Error(`URL is not valid: ${_url}`) // TODO Log & Error

//         const host = url.hostname
//         const favicon = this.get(host)

//         // 🤬 Not exist
//         if (!favicon) return

//         delete this.data.favicon[host]
//     }
// }
