import type { Markdown } from "$lib/markdown/processor/markdown"
import { getParentPath, type IStoreProvider, getCumulativePathWithName, type WebIndexItem, type ILoggerProvider } from "indexer"
import type { Content as Token } from "mdast-util-from-markdown/lib"
import type { IFetchStrategy } from "$lib/webIndex";
export type { Token };

export type View = 'latest'|'random'|'search'|'explore'|'indexer';

export type Content = {
    view: View|null,
    query: string|null,
    nextPage: string|null,
    item: ContentItem|null,
    items: ContentItem[]|null,
}

export type ContentItem = {
    path:string|null,
    id?:string|null
    type?:'file'|'folder'|null,
    cumulativePath?:{
        path: string;
        name: string;
    }[],
    sourceUri?:string|null,
    title?:string|null,
    folder?: ContentItem|null,
    tokens?:Token[]|null
}

export class ContentService {
    loggerProvider: ILoggerProvider;
    markdown: Markdown;
    storeProvider: IStoreProvider
    randomFetchStrategy: IFetchStrategy;
    latestFetchStrategy: IFetchStrategy;
    searchFetchStrategy: IFetchStrategy;
    allFoldersFetchStrategy: IFetchStrategy;

    constructor(options:{
        loggerProvider:ILoggerProvider,
        markdown:Markdown,
        storeProvider:IStoreProvider,
        randomFetchStrategy: IFetchStrategy;
        latestFetchStrategy: IFetchStrategy;
        searchFetchStrategy: IFetchStrategy;
        allFoldersFetchStrategy: IFetchStrategy;
    }) {
        this.loggerProvider = options.loggerProvider;
        this.markdown = options.markdown;
        this.storeProvider = options.storeProvider;
        this.randomFetchStrategy = options.randomFetchStrategy;
        this.latestFetchStrategy = options.latestFetchStrategy;
        this.searchFetchStrategy = options.searchFetchStrategy;
        this.allFoldersFetchStrategy = options.allFoldersFetchStrategy;
    }

    async getContent(options:{path:string|null, view:View|null, page:string|null, query:string|null}): Promise<Content> {
        let path = options.path;
        let view = options.view;
        let page = options.page;
        let nextPage = null;
        let query = options.query;
        
        let webIndexItem = path ? await this.storeProvider.getWebIndexStore().get(path) : null;
        let item = this.toItem(webIndexItem);
        if (item?.type === 'file'){
            let random = await this.randomFetchStrategy.fetch({path: getParentPath(path), page, limit:5})
            return {
                view: view,
                query: options.query,
                item: item,
                items: this.toItems(random.items),
                nextPage: random.nextPage,
            };
        }

        let items:ContentItem[]|null = null; 
        if (!view)
            view = 'latest';
        if (view === 'latest') {
            let latest = await this.latestFetchStrategy.fetch({path, page})
            items = this.toItems(latest.items);
            nextPage = latest.nextPage;
        }
        if (view === 'random') {
            let random = await this.randomFetchStrategy.fetch({path, page})
            items = this.toItems(random.items);
            nextPage = random.nextPage;
        }
        if (view === 'search') {
            let search = await this.searchFetchStrategy.fetch({path, page, query})
            items = this.toItems(search.items);
            nextPage = search.nextPage;
        }

        if (view === 'explore') {
            let allFolders = await this.allFoldersFetchStrategy.fetch({path, page})
            items = this.toItems(allFolders.items);
            nextPage = allFolders.nextPage;
        }

        return {
            view: view,
            query: query,
            item: item,
            items: items,
            nextPage: nextPage,
        };
    }

    toItem(item:WebIndexItem|null, short = false):ContentItem|null {
        if (!item || !item.indexItem)
            return null;
        let path = item.indexItem?.path
        if (!path)
            return null;
        let folderPath = item.indexItem?.type == 'file' ? getParentPath(item.indexItem.path) : item.indexItem?.path;
        return {
            path: path,
            id: item.id || null,
            type: item.indexItem?.type,
            sourceUri: item.indexItem?.sourceUri,
            title: item.indexItem?.title,
            cumulativePath: getCumulativePathWithName(path),
            folder: folderPath ? {
                    path: folderPath,
                    cumulativePath: getCumulativePathWithName(folderPath)
                } : null,
            tokens: structuredClone(short ? this.markdown.tokenizeShort(item) : this.markdown.tokenize(item))
        };
    }

    toItems(webItems:WebIndexItem[]):ContentItem[] {
        return webItems.map(x => this.toItem(x, true)).filter(x => x) as ContentItem[];
    }
}