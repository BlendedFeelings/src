import { IStore } from './index'
import * as fs from 'fs'
import { ILogger, ILoggerProvider } from '../logger'

export class FileStore<T> implements IStore<T> {
    path:string;
    store: { [key: string]: T } = {};
    logger:ILogger;

	constructor(options:{loggerProvider:ILoggerProvider, name:string, path?:string}) {
        this.path = options.path || `${options.name}.json`;
        if (fs.existsSync(this.path)) {
            let json = fs.readFileSync(this.path).toString();
            this.store = JSON.parse(json) as { [id: string]: T }
        }

        this.logger = options.loggerProvider.getLogger(`FileStore.${options.name}`);
    }

    async get(key:string):Promise<T|null> {
        this.logger.debug(`get:${key}`);
        return this.store[key] as T
    }

    async getMany(keys:string[]):Promise<{[id: string]:T}> {
        this.logger.debug(`getMany:${keys}`);
        let items:{[id: string]:T} = {};
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

    async exist(keys: string[]): Promise<{ [id: string]: boolean; }> {
        this.logger.debug(`exist:${keys}`);
        let keysExist:{ [id: string]: boolean }  = {};
        for(let key of keys)
            keysExist[key] = this.store[key] ? true : false;
        return keysExist;
    }

    async set(key:string, value:T):Promise<void> {
        this.logger.debug(`set:${key}`, value);
        this.store[key] = value;
        let json = JSON.stringify(this.store, null, 2);
        fs.writeFileSync(this.path, json);
    }

    async setTags(key:string, tags:{[tagName: string]: any}):Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getTags(key:string, tagsNames:string[]):Promise<{[tagName: string]: any}> {
        throw new Error("Method not implemented.");
    }
    
    async getAllTags(tagsNames:string[]):Promise<{[key: string]: {[tagName: string]: any}}> {
        throw new Error("Method not implemented.");
    }

    async getByTag(tagName:string, tagValue:any):Promise<{[key: string]: T}> {
        throw new Error("Method not implemented.");
    }
}
