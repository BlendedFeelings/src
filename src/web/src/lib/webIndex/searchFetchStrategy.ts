import type { ILogger, ILoggerProvider, ISearch, IStore, WebIndexItem } from "indexer";
import type { IWebIndexLookup } from "./webIndexLookup";
import type { IFetchStrategy } from "./fetchStrategy";


export class SearchFetchStrategy implements IFetchStrategy {
    logger: ILogger;
    webIndexStore: IStore<WebIndexItem>;
    webIndexLookup: IWebIndexLookup;
    webSearch: ISearch;

    constructor(options: {
        loggerProvider: ILoggerProvider;
        webIndexStore: IStore<WebIndexItem>;
        webIndexLookup: IWebIndexLookup;
        webSearch: ISearch;
    }) {
        this.logger = options.loggerProvider.getLogger("RandomFetchStrategy");
        this.webIndexStore = options.webIndexStore;
        this.webIndexLookup = options.webIndexLookup;
        this.webSearch = options.webSearch;
    }

    async fetch(options: {
        path?: string | null;
        page?: string | null;
        limit?: number | null;
        query?: string | null;
    }): Promise<{ items: WebIndexItem[]; nextPage: string | null; }> {
        let limit = options.limit || 20;
        if (!options.query)
            return { items: [], nextPage: null };
        let offset = parseInt(options.page ?? '0');
        if (isNaN(offset))
            offset = 0;

        let searchItems = await this.webSearch.search({ q: options.query, cumulativePath: options.path, limit: limit, offset: offset }); // page: page});
        if (!searchItems?.hits)
            return { items: [], nextPage: null };
        let foundPaths = searchItems.hits.map(x => x.path);
        let foundItems = await this.webIndexStore.getMany(foundPaths);
        let items = foundPaths.map(x => foundItems[x]).filter(x => x);
        let nextPage = searchItems.hits.length === limit ? (offset + limit).toString() : null;
        return { items, nextPage };
    }
}
