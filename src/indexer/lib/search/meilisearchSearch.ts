import { ISearch, SearchIndexableItem, SearchItem, SearchResults, SearchOptions } from "./index";
import { fetch } from '../fetch';
import { ILogger, ILoggerProvider } from '../logger'
declare global {
    var initialized:{ [key: string]: boolean; };
}

if (!global.initialized)
    global.initialized = {};

export class MeilisearchSearch implements ISearch {
    url:string;
    key:string;
    index:string;
    headers:Record<string,string>;
    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider, url?:string, key?:string, index?:string}) {
        this.index = options?.index || 'b';
        this.logger = options.loggerProvider.getLogger('MeilisearchSearch', {index: this.index});
        this.url = options?.url || process.env.B_MEILISEARCH_URL || '';
        this.key = options?.key || process.env.B_MEILISEARCH_KEY || '';
        this.headers =  {'Authorization': 'Bearer ' + this.key, 'Content-Type': 'application/json'};
        if (global.initialized[this.index])
            return;
        this.init().then(x => {
        });
    }

    async addOrUpdate(item: SearchIndexableItem|SearchIndexableItem[]): Promise<any> {
        this.logger.debug('addOrUpdate');
        let items = Array.isArray(item) ? item : [item];
        let itemsWithIds = items.map(x => Object.assign(x, {id: this.sanitize(x.path)}));
        let response = await fetch(`${this.url}/indexes/${this.index}/documents`, {
            headers: this.headers,
            method: 'PUT',
            body: JSON.stringify(itemsWithIds)
        });
        if (!(response.status >= 200 && response.status <= 299))
            throw new Error(`Response ended with status: ${response.status} ${response.statusText}`);
    }

    async get(path:string): Promise<SearchItem|null> {
        this.logger.debug('get', path);
        let response = await fetch(`${this.url}/indexes/${this.index}/documents/${this.sanitize(path)}`,{
                headers: this.headers,
                method: 'GET'
            });
        if (response.status == 404)
            return null;
        let json = await response.json();
        return json as SearchItem;
    }

    async getAll<Keys extends keyof SearchItem>(paths:string[]): Promise<Pick<SearchItem, Keys>[]> {
        return [];
    }

    async search(options: SearchOptions): Promise<SearchResults> {
        this.logger.debug('search', {q: options.q});
        if (!options.q)
            return {hits:[]};
        let query:any = {};
        if (options.q)
            query.q = options.q;
        if (options.cumulativePath)
            query.filter = `cumulativePath = '${options.cumulativePath}'`;
        if (options.limit)
            query.limit = options.limit;
        if (options.offset)
            query.offset = options.offset;
        let response = await fetch(`${this.url}/indexes/${this.index}/search`,
        {
            headers: this.headers,
            method: 'POST',
            body: JSON.stringify(query)
        });
        let json = await response.json();
        return json as SearchResults;
    }

    async remove(path:string): Promise<any> {
        let response = await fetch(`${this.url}/indexes/${this.index}/documents/${this.sanitize(path)}`,{
            headers: this.headers,
            method: 'DELETE'
        });
    }

    async removeAll() {
        await fetch(`${this.url}/indexes/${this.index}/documents`, {
            headers: this.headers,
            method: 'DELETE'
        });
    }

    async waitForAsyncTasks() {
        return new Promise<void>(resolve => {
            setTimeout(resolve, 1000);
        });
    }

    sanitize = function(path:string) {
        return path.replace(/[^a-zA-Z0-9-_]/g, '__');
    }

    async init() {
        if (global.initialized[this.index])
            return;
        await fetch(`${this.url}/indexes`,{
            headers: this.headers,
            method: 'POST',
            body: JSON.stringify({
                "uid": this.index,
                "primaryKey": "id"
                })
        });
        await fetch(`${this.url}/indexes/${this.index}/settings`, {
            headers: this.headers,
            method: 'PATCH',
            body: JSON.stringify({
                filterableAttributes:[
                    'path',
                    'parentPath',
                    'cumulativePath'
                ],
                displayedAttributes:[
                    'path',
                    'sha',
                    'timestamp'
                ],
                searchableAttributes:[
                    'path',
                    'cumulativePath',
                    'title',
                    'text',
                    'sourceUri'
                ]
            })
        });
        global.initialized[this.index] = true;
    }

}

