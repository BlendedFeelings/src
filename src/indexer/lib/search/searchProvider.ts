import { ISearch, InMemorySearch, MeilisearchSearch } from '.';
import { EnvironmentConfig, EnvironmentConfigNames } from '../config';
import { ILogger, ILoggerProvider } from '../logger';

export interface ISearchProvider {
    get(name:string) : ISearch;
    getWebSearch(): ISearch;

}

export class SearchProvider implements ISearchProvider {

    logger: ILogger;
    loggerProvider: ILoggerProvider;
    config: EnvironmentConfig;
    cache: ISearch = null;

    constructor(options: { loggerProvider: ILoggerProvider; config: EnvironmentConfig; }) {
        this.logger = options.loggerProvider.getLogger('SearchProvider');
        this.config = options.config;
        this.loggerProvider = options.loggerProvider;
    }
    getWebSearch(): ISearch {
        return this.get(EnvironmentConfigNames.webSearch)
    }

    get(name: string): ISearch {
        if (!this.cache) {
            let config = this.config[name];
            if (!config)
                throw new Error(`Search not found in the config: ${name}`);
            if (!config.type)
                throw new Error(`Search type is not defined for the store in the config: ${name}`);
            let options = { ...{ loggerProvider: this.loggerProvider, name: name }, ...config.options };
            switch (config.type) {
                case 'inMemory':
                    this.cache = new InMemorySearch(options);
                    break;
                case 'meilisearch':
                    this.cache = new MeilisearchSearch(options);
                    break;
                default:
                    throw new Error(`Search type "${config.type}" is not supported. Fix the entry in the config: ${name}`);
            }
        }
        return this.cache;
    }

}
