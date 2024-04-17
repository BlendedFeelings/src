import { ISearch, SearchIndexableItem, SearchItem, SearchResults, SearchOptions } from "./index";
import Fuse from "fuse.js";
import { ILogger, ILoggerProvider } from '../logger'

declare global {
    var itemsIndex:any;
    var items:any;
}

export class InMemorySearch implements ISearch {
    itemsIndexOptions = {
        includeScore: true,
        useExtendedSearch: true,
        keys: ["path", "title", "text", "sourceUri", "cumulativePath"]
    };
    itemsIndex:Fuse.FuseIndex<SearchItem>;
    items:Fuse<SearchItem>;
    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider, global?:boolean}) {
        this.logger = options.loggerProvider.getLogger('InMemorySearch');
        let isGlobal = options.global !== undefined ? options.global : true;
        if (isGlobal) {
            if (!global.itemsIndex || !global.items) {
                global.itemsIndex = Fuse.createIndex<SearchItem>(this.itemsIndexOptions.keys, []);
                global.items = new Fuse([], this.itemsIndexOptions, this.itemsIndex);
            }
            this.itemsIndex = global.itemsIndex;
            this.items = global.items;
        } else {
            this.itemsIndex = Fuse.createIndex<SearchItem>(this.itemsIndexOptions.keys, []);
            this.items = new Fuse([], this.itemsIndexOptions, this.itemsIndex);
        }
    }

    async addOrUpdate(item: SearchIndexableItem): Promise<any> {
        let existingItems = this.items.search({ path: `=${item.path}` });
        if (existingItems.length > 0) {
            let existingItem = existingItems[0];
            for(let key in item) {
                if (key != 'path' && item[key] != undefined) {
                    existingItem[key] = item[key];
                }
            }
            return;
        }
        this.items.add(item);
    }

    async remove(path:string): Promise<any> {
        this.items.remove(x => x.path === path);
    }

    async get(path:string): Promise<SearchItem|null> {
        let items = this.items.search({ path: `=${path}` });
        if (items.length === 1)
            return items[0].item;
        if (items.length >= 2)
            throw new Error(`More than one item found for the path:${path}`);
        return null;
    }

    async getAll<Keys extends keyof SearchItem>(paths:string[]): Promise<Pick<SearchItem, Keys>[]> {
        let searchCriteria = {path : paths.map(x => `=${x}`).join(' | ')}
        let results = this.items.search(searchCriteria);
        return results.map(x => x.item);
    }

    async search(options: SearchOptions): Promise<SearchResults> {
        let searchCriteria:{cumulativePath?:string, text?:string, path?:string} = {};
        if (options.cumulativePath)
            searchCriteria.cumulativePath = `'${options.cumulativePath}`
        if (options.q)
            searchCriteria.text = `${options.q}`;
        
        let results = this.items.search(searchCriteria);
        
        if (options.offset != null && options.offset != undefined && options.limit != null && options.limit != undefined) {
            results = results.slice(options.offset, options.offset + options.limit);
        }
        return {hits:results.map(x => x.item)};
    }
}
