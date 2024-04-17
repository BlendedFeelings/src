import { Services, type EnvironmentConfig, type ILoggerProvider, type IStore } from 'indexer';
import { Markdown } from './markdown/processor/markdown';
import config from '../../b.config.js'
import { ContentService } from './content/ContentService';
import { InMemoryWebIndexLookup, type IWebIndexLookup, type IFetchStrategy, LatestFetchStrategy, RandomFetchStrategy, SearchFetchStrategy, AllFoldersFetchStrategy } from './webIndex';

export class WebServices extends Services {
	constructor(options?:{
			environmentConfig?:EnvironmentConfig & {settingsStore:{
				type: string,
				options?: any
			}}, 
			loggerProvider?: ILoggerProvider}) {
		super({
			environmentConfig: options?.environmentConfig ?? config,
			loggerProvider: options?.loggerProvider
		});
	}

	_contentService: ContentService|null = null;
	getContentService(): ContentService {
		return this._contentService || (this._contentService = new ContentService({
			loggerProvider: this.getLoggerProvider(),
			markdown: this.getMarkdown(),
			storeProvider: this.getStoreProvider(),
			randomFetchStrategy: this.getRandomFetchStrategy(),
			latestFetchStrategy: this.getLatestFetchStrategy(),
			searchFetchStrategy: this.getSearchFetchStrategy(),
			allFoldersFetchStrategy: this.getAllFoldersFetchStrategy()
		}));
	}

	_markdown: Markdown|null = null;
	getMarkdown(): Markdown {
		return this._markdown || (this._markdown = new Markdown({
			loggerProvider: this.getLoggerProvider()
		}));
	}

	_webIndexLookup: IWebIndexLookup|null = null;
	getWebIndexLookup(): IWebIndexLookup {
		return this._webIndexLookup || (this._webIndexLookup = new InMemoryWebIndexLookup({
			loggerProvider: this.getLoggerProvider(),
			webIndexStore: this.getStoreProvider().getWebIndexStore(),
			settingsStore: this.getStoreProvider().get('settingsStore')
		}));
	}

	_latestFetchStrategy: IFetchStrategy|null = null;
	getLatestFetchStrategy(): IFetchStrategy {
		return this._latestFetchStrategy || (this._latestFetchStrategy = new LatestFetchStrategy({
			loggerProvider: this.getLoggerProvider(),
			webIndexStore: this.getStoreProvider().getWebIndexStore(),
			webIndexLookup: this.getWebIndexLookup()
		}));
	}

	_randomFetchStrategy: IFetchStrategy|null = null;
	getRandomFetchStrategy(): IFetchStrategy {
		return this._randomFetchStrategy || (this._randomFetchStrategy = new RandomFetchStrategy({
			loggerProvider: this.getLoggerProvider(),
			webIndexStore: this.getStoreProvider().getWebIndexStore(),
			webIndexLookup: this.getWebIndexLookup()
		}));
	}

	_searchFetchStrategy: IFetchStrategy|null = null;
	getSearchFetchStrategy(): IFetchStrategy {
		return this._searchFetchStrategy || (this._searchFetchStrategy = new SearchFetchStrategy({
			loggerProvider: this.getLoggerProvider(),
			webIndexStore: this.getStoreProvider().getWebIndexStore(),
			webIndexLookup: this.getWebIndexLookup(),
			webSearch: this.getSearchProvider().getWebSearch()
		}));
	}

	_allFoldersFetchStrategy: IFetchStrategy|null = null;
	getAllFoldersFetchStrategy(): IFetchStrategy {
		return this._allFoldersFetchStrategy || (this._allFoldersFetchStrategy = new AllFoldersFetchStrategy({
			loggerProvider: this.getLoggerProvider(),
			webIndexStore: this.getStoreProvider().getWebIndexStore(),
			webIndexLookup: this.getWebIndexLookup()
		}));
	}
}
