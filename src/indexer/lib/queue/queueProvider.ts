import { IQueue, InMemoryQueue } from '.';
import { EnvironmentConfig, EnvironmentConfigNames } from '../config';
import { ILogger, ILoggerProvider } from '../logger';

export interface IQueueProvider {
    get<T>(name:string):IQueue<T>;
    getContentQueue<Event>();
}

export class QueueProvider implements IQueueProvider {

    logger: ILogger;
    loggerProvider: ILoggerProvider;
    config: EnvironmentConfig;
    cache: { [name: string]: IQueue<any> } = {};

    constructor(options: { loggerProvider: ILoggerProvider; config: EnvironmentConfig; }) {
        this.logger = options.loggerProvider.getLogger('QueueProvider');
        this.config = options.config;
        this.loggerProvider = options.loggerProvider;
    }

    get<T>(name: string): IQueue<T> {
        if (!(name in this.cache)) {
            let config = this.config[name];
            if (!config)
                throw new Error(`Queue not found in the config: ${name}`);
            if (!config.type)
                throw new Error(`Queue type is not defined for the store in the config: ${name}`);
            let options = { ...{ loggerProvider: this.loggerProvider, name: name }, ...config.options };
            switch (config.type) {
                case 'inMemory':
                    this.cache[name] = new InMemoryQueue<T>(options);
                    break;
                default:
                    throw new Error(`Queue type "${config.type}" is not supported. Fix the entry in the config: ${name}`);
            }
        }
        return this.cache[name];
    }

    getContentQueue<Event>() {
        return this.get(EnvironmentConfigNames.contentQueue);
    }

}
