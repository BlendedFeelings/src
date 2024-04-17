import type { ILogger, ILoggerProvider, IStore, WebIndexItem } from "indexer";
import type { IWebIndexLookup } from "./webIndexLookup";
import type { IFetchStrategy } from "./fetchStrategy";


export class AllFoldersFetchStrategy implements IFetchStrategy {
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
        //let limit = options.limit || 20;
        let paths = this.webIndexLookup.getFoldersOrderedByPath(options.page ?? "");
        let items = await this.webIndexStore.getMany(paths);
        return {
            items: paths.map(x => items[x]).filter(x => x),
            nextPage: null
        };
    }
}
