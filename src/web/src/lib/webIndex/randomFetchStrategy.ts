import type { ILogger, ILoggerProvider, IStore, WebIndexItem } from "indexer";
import type { IWebIndexLookup } from "./webIndexLookup";
import type { IFetchStrategy } from "./fetchStrategy";


export class RandomFetchStrategy implements IFetchStrategy {
    logger: ILogger;
    webIndexStore: IStore<WebIndexItem>;
    webIndexLookup: IWebIndexLookup;

    constructor(options: {
        loggerProvider: ILoggerProvider;
        webIndexStore: IStore<WebIndexItem>;
        webIndexLookup: IWebIndexLookup;
    }) {
        this.logger = options.loggerProvider.getLogger("RandomFetchStrategy");
        this.webIndexStore = options.webIndexStore;
        this.webIndexLookup = options.webIndexLookup;
    }

    async fetch(options: {
        path?: string | null;
        page?: string | null;
        limit?: number | null;
    }): Promise<{ items: WebIndexItem[]; nextPage: string | null; }> {
        let limit = options.limit || 20;
        let paths = this.webIndexLookup.getFilesOrderedByPath(options.path ?? "");
        let randomPaths = paths.sort(() => Math.random() - 0.5).slice(0, limit);
        let randomItems = await this.webIndexStore.getMany(randomPaths);
        let items = randomPaths.map(x => randomItems[x]).filter(x => x);
        return {
            items: items,
            nextPage: null
        };
    }
}
