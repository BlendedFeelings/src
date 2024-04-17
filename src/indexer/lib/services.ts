import { EnvironmentConfigSource, EnvironmentConfig } from "./config";
import { ContentExtractor, type IContentExtractor } from "./contentExtractor";
import { type IContentSourceProvider, type IContentSource, ContentSourceProvider } from "./contentSource";
import { type ILoggerProvider, getLoggerProviderForConfig } from "./logger";
import { type IQueueProvider, QueueProvider } from "./queue";
import { type ISearchProvider, SearchProvider } from "./search";
import { type IStoreProvider, StoreProvider } from "./store";
import { Indexer } from "./indexer";

export interface IServices {
    getStoreProvider(): IStoreProvider,
    getSearchProvider(): ISearchProvider,
    getQueueProvider(): IQueueProvider,
    getLoggerProvider(): ILoggerProvider,
    getEnvironmentConfig(): EnvironmentConfig

    getContentExtractor(): IContentExtractor;

    getContentSourceProvider(): IContentSourceProvider;
    //getContentSource(basePath:string): { contentSourceConfig: EnvironmentConfigSource, contentSource: IContentSource };
}
export class Services implements IServices {
    constructor(options:{
        loggerProvider?: ILoggerProvider,
        environmentConfig: EnvironmentConfig
        storeProvider?: IStoreProvider
    }) {
        this._loggerProvider = options.loggerProvider;
        this._environmentConfig = options.environmentConfig;
        this._storeProvider = options.storeProvider || null;
    }

    _indexer:Indexer|null = null;
	getIndexer():Indexer {
		return this._indexer || (this._indexer = new Indexer({
			loggerProvider: this.getLoggerProvider(),
			environmentConfig: this._environmentConfig
		}));
	}

    _storeProvider: IStoreProvider|null = null;
    getStoreProvider(): IStoreProvider {
        return this._storeProvider || (this._storeProvider = new StoreProvider({loggerProvider: this._loggerProvider, environmentConfig: this._environmentConfig}));
    }

    _searchProvider: ISearchProvider|null = null;
    getSearchProvider(): ISearchProvider {
        return this._searchProvider || (this._searchProvider = new SearchProvider({loggerProvider: this._loggerProvider, config: this._environmentConfig}));
    }

    _queueProvider: IQueueProvider|null = null;
    getQueueProvider(): IQueueProvider {
        return this._queueProvider || (this._queueProvider = new QueueProvider({loggerProvider: this._loggerProvider, config: this._environmentConfig}));
    }

    _loggerProvider: ILoggerProvider;
    getLoggerProvider(): ILoggerProvider {
        return this._loggerProvider || (this._loggerProvider = getLoggerProviderForConfig(this._environmentConfig));
    }

    _environmentConfig: EnvironmentConfig;
    getEnvironmentConfig(): EnvironmentConfig {
        return this._environmentConfig;
    }

    _contentExtractor: IContentExtractor|null = null;
    getContentExtractor(): IContentExtractor {
        return this._contentExtractor || (this._contentExtractor = new ContentExtractor({loggerProvider: this._loggerProvider}));
    }

    _contentSourceProvider: IContentSourceProvider|null = null;
    getContentSourceProvider(): IContentSourceProvider {
        return this._contentSourceProvider || (this._contentSourceProvider = new ContentSourceProvider({loggerProvider: this._loggerProvider}))
    }
}