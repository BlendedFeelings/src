import { IStore } from './index'
import { fetch } from '../fetch';
import { ILogger, ILoggerProvider } from '../logger'

export class MeilisearchStore<T> implements IStore<T> {
    url:string;
    key:string;
    index:string;
    headers:Record<string,string>;

    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider, name:string, url?:string, key?:string, index?:string}) {
        this.index = options.index || options.name;
        this.logger = options.loggerProvider.getLogger(`MeilisearchStore.${this.index}`);
        this.url = options?.url || process.env.B_MEILISEARCH_URL || '';
        this.key = options?.key || process.env.B_MEILISEARCH_KEY || '';
        this.headers =  {'Authorization': 'Bearer ' + this.key, 'Content-Type': 'application/json'};
        this.init().then(x => {}).catch(x => {});
    }

    async set(key:string, value:T): Promise<void> {
        this.logger.debug(`set:${key}`, value);
        let response = await fetch(`${this.url}/indexes/${this.index}/documents`,
        {
            headers: this.headers,
            method: 'POST',
            body: JSON.stringify({_id: this.hashCode(key), ...value})
        });
    }

    async get(key:string): Promise<T|null> {
        this.logger.debug(`get:${key}`);
        let response = await fetch(`${this.url}/indexes/${this.index}/documents/${this.hashCode(key)}`,
            {
                headers: this.headers,
                method: 'GET'
            });
        if (response.status == 404)
            return null;
        let json = await response.json();
        return json as T;
    }

    async getMany(keys:string[]):Promise<{[id: string]:T}> {
        this.logger.debug(`getMany:${keys}`);
        throw new Error('Not implemented');
        if (keys.length === 0 ) return {}
        let items:{[id: string]:T} = {};
        return items;
    }

    async* getAll() : AsyncGenerator<[string,T]> {
        this.logger.debug(`getAll`);
        throw new Error('Not implemented');
    }

    async getKeys():Promise<string[]> {
        this.logger.debug(`getKeys`);
        throw new Error('Not implemented');
    }

    exist(keys: string[]): Promise<{ [id: string]: boolean; }> {
        throw new Error('Not implemented');
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
    
    async remove(id:string): Promise<any> {
        let response = await fetch(`${this.url}/indexes/${this.index}/documents/${this.hashCode(id)}`,
        {
            headers: this.headers,
            method: 'DELETE'
        });
    }

    async removeAll() {
        let response = await fetch(`${this.url}/indexes/${this.index}/documents`,
        {
            headers: this.headers,
            method: 'DELETE'
        });
    }

    hashCode = function(s:string) {
        var hash = 0,
            i, chr;
        if (s.length === 0) return hash;
        for (i = 0; i < s.length; i++) {
            chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    async init() {
        await fetch(`${this.url}/indexes`,
        {
            headers: this.headers,
            method: 'POST',
            body: JSON.stringify({
                "uid": this.index,
                "primaryKey": "_id"
                })
        });
        await fetch(`${this.url}/indexes/${this.index}/settings`,
        {
            headers: this.headers,
            method: 'PATCH',
            body: JSON.stringify({
                filterableAttributes:["_id"],
                // displayedAttributes:[
                //     '*'
                // ],
                searchableAttributes:[]
            })
        });
    }

}

