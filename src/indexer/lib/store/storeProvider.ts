import { IStore } from '.';
import { EnvironmentConfig, EnvironmentConfigNames } from '../config';
import { IncludesItem, IndexItem } from '../content';
import { ILogger, ILoggerProvider } from '../logger';
import { AzureStorageAccountStore } from './azureStorageAccountStore';
import { FileStore } from './fileStore';
import { InMemoryStore } from './inMemoryStore';
import { MeilisearchStore } from './meilisearchStore';
import { SqlServerStore } from './sqlServerStore';
import { WebIndexItem } from '../content';

export interface IStoreProvider {
    get<T>(name:string):IStore<T>;
    getIndexStore(): IStore<IndexItem>;
    getIncludesStore(): IStore<IncludesItem>;
    getWebIndexStore(): IStore<WebIndexItem>;}

export class StoreProvider implements IStoreProvider {

    logger: ILogger;
    loggerProvider: ILoggerProvider;
    config: EnvironmentConfig;
    stores: { [name: string]: IStore<any> } = {};

    constructor(options: { loggerProvider: ILoggerProvider; environmentConfig: EnvironmentConfig;  }) {
        this.logger = options.loggerProvider.getLogger('StoreProvider');
        this.config = options.environmentConfig;
        this.loggerProvider = options.loggerProvider;
    }

    get<T>(name: string): IStore<T> {
        if (name in this.stores)
            return this.stores[name];

        let config = this.config[name];
        if (!config)
            throw new Error(`Store not found in the config: ${name}`);
        if (!config.type)
            throw new Error(`Store type is not defined for the store in the config: ${name}`);
        
        let options = { ...{ loggerProvider: this.loggerProvider, name: name }, ...config.options };
        let newStore:IStore<T>|null = null;
        switch (config.type) {
            case 'file':
                newStore = new FileStore<T>(options);
                break;
            case 'inMemory':
                newStore = new InMemoryStore<T>(options);
                break;
            case 'azureStorageAccount':
                newStore = new AzureStorageAccountStore<T>(options);
                break;
            case 'meilisearch':
                newStore =  new MeilisearchStore<T>(options);
                break;
            case 'sqlServer':
                newStore =  new SqlServerStore<T>(options);
                break;
            default:
                throw new Error(`Store type "${config.type}" is not supported. Fix the entry in the config: ${name}`);
        }
        this.stores[name] = newStore;
        return this.stores[name];
    }
    
    getIndexStore(): IStore<IndexItem> {
        return this.get(EnvironmentConfigNames.indexStore);
    }
    getIncludesStore(): IStore<IncludesItem> {
        return this.get(EnvironmentConfigNames.includesStore);
    }
    getWebIndexStore(): IStore<WebIndexItem> {
        return this.get(EnvironmentConfigNames.webIndexStore);
    }
}

