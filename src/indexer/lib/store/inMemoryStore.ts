import { IStore } from './index'
import { ILogger, ILoggerProvider } from '../logger'

declare global {
    var stores:any;
    var tags:any;
}
  
if (!global.stores)
    global.stores = {};
if (!global.tags)
    global.tags = {};

export class InMemoryStore<T> implements IStore<T> {
    store:{[key: string]:T} = {};
    tags:{[key: string]:{}} = {};
    logger:ILogger;

	constructor(options:{loggerProvider:ILoggerProvider, name:string, global?:boolean}) {
        this.logger = options.loggerProvider.getLogger(`InMemoryStore.${options.name}`);
        let isGlobal = options.global !== undefined ? options.global : true;
        if (isGlobal) {
            if (!global.stores[options.name])
                global.stores[options.name] = this.store
            if (!global.tags[options.name])
                global.tags[options.name] = {}
            this.store = global.stores[options.name]
            this.tags = global.tags[options.name]
        }
    }

    async get(key:string):Promise<T|null> {
        this.logger.debug(`get:${key}`);
        return this.store[key];
    }

    async getMany(keys:string[]):Promise<{[id: string]:T}> {
        this.logger.debug(`getMany:${keys}`);
        let items:{ [id: string]: T }  = {};
        for(let id of keys)
            items[id] = this.store[id];
        return items;
    }

    async* getAll() : AsyncGenerator<[string, T]> {
        this.logger.debug(`getAll`);
        for(let x of Object.entries(this.store)) {
            yield new Promise<[string, T]>(resolve => resolve(x));
        }
    }

    async getKeys():Promise<string[]> {
        this.logger.debug(`getKeys`);
        return new Promise<string[]>(resolve => resolve(Object.keys(this.store)));
    }

    async exist(keys:string[]):Promise<{[id: string]:boolean}> {
        this.logger.debug(`exist:${keys}`);
        let keysExist:{ [id: string]: boolean }  = {};
        for(let key in keys)
            keysExist[key] = this.store[key] ? true : false;
        return keysExist;
    }

    async set(key:string, value:T):Promise<void> {
        this.logger.debug(`set:${key}`, value);
        this.store[key]  =  value;
    }

    async setTags(key:string, tags:{[tagName: string]: any}):Promise<void> {
        if (!(key in this.tags))
            this.tags[key] = {}
        this.tags[key] = { ...this.tags[key], ...tags}
    }

    async getTags(key:string, tagsNames:string[]):Promise<{[tagName: string]: any}> {
        if (!(key in this.tags))
            return {}
        return this.tags[key];
    }

    async getAllTags(tagsNames:string[]):Promise<{[key: string]: {[tagName: string]: any}}> {
        let allTags = {}
        for (let key of Object.keys(this.store))
            allTags[key] = this.tags[key] || {};
        return allTags;
    }

    async getByTag(tagName:string, tagValue:any):Promise<{[key: string]: T}> {
        let matched = {};
        for (let key in this.tags) {
            if (this.tags.hasOwnProperty(key)) {
                if (tagValue == this.tags[key][tagName])
                    matched[key] = this.store[key];
            }
        }
        return matched;
    }
}
