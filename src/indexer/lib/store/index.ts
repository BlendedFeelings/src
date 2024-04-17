
export * from './azureStorageAccountStore'
export * from './meilisearchStore'
export * from './inMemoryStore'
export * from './fileStore'
export * from './sqlServerStore'
export * from './storeProvider'

export interface IStore<T> {
    get(key:string):Promise<T|null>;
    getMany(keys:string[]):Promise<{[key: string]:T}>;
    getAll():AsyncGenerator<[string, T]>;
    getKeys():Promise<string[]>;
    exist(keys:string[]):Promise<{[key: string]:boolean}>;
    set(key:string, value:T):Promise<void>;
    setTags(key:string, tags:{[tagName: string]: any}):Promise<void>;
    getTags(key:string, tagsNames:string[]):Promise<{[tagName: string]: any}>;
    getAllTags(tagsNames:string[]):Promise<{[key: string]: {[tagName: string]: any}}>;
    getByTag(tagName:string, tagValue:any):Promise<{[key: string]: T}>;
  }


