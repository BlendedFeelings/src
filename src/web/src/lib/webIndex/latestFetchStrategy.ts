import type { ILogger, ILoggerProvider, IStore, WebIndexItem } from "indexer";
import type { IWebIndexLookup } from "./webIndexLookup";
import type { IFetchStrategy } from "./fetchStrategy";


export class LatestFetchStrategy implements IFetchStrategy {
    logger: ILogger;
    webIndexStore: IStore<WebIndexItem>;
    webIndexLookup: IWebIndexLookup;

    constructor(options: {
        loggerProvider: ILoggerProvider;
        webIndexStore: IStore<WebIndexItem>;
        webIndexLookup: IWebIndexLookup;
    }) {
        this.logger = options.loggerProvider.getLogger("LatestFetchStrategy");
        this.webIndexStore = options.webIndexStore;
        this.webIndexLookup = options.webIndexLookup;
    }

    async fetch(options: {
        path?: string | null;
        page?: string | null;
        limit?: number | null;
    }): Promise<{ items: WebIndexItem[]; nextPage: string | null; }> {
        let limit = options.limit || 20;
        let latestPaths = this.webIndexLookup.getFilesOrderedByIncrementalID(options.path ?? "");
        if (options.page) {
            let latestPath = this.webIndexLookup.getPathByIncrementalID(options.page);
            if (latestPath) {
                let index = latestPaths.indexOf(latestPath);
                let startIndex = index - limit;
                let endIndex = startIndex + limit;
                if (startIndex < 0) {
                    startIndex = 0;
                }
                latestPaths = latestPaths.slice(startIndex, endIndex);
            }
        }
        latestPaths = latestPaths.slice(-limit).reverse();
        let latestItems = await this.webIndexStore.getMany(latestPaths);
        let items = latestPaths.map(x => latestItems[x]).filter(x => x);
        let nextPagePath = latestPaths.length === limit ? latestPaths[latestPaths.length - 1] : null;
        let nextPage = nextPagePath ? this.webIndexLookup.getIncrementalIDByPath(nextPagePath) : null;
        return {
            items: items,
            nextPage: nextPage
        };
    }
}
