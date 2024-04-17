import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { IStore } from './index'
import { ILogger, ILoggerProvider } from '../logger'

const accountName = process.env.B_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.B_STORAGE_ACCOUNT_KEY;
const accountConnectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`


export class AzureStorageAccountStore<T> implements IStore<T> {
	containerClient:ContainerClient;
    logger:ILogger;

	constructor(options:{loggerProvider:ILoggerProvider, name:string, container?:string}) {
        let blobServiceClient = BlobServiceClient.fromConnectionString(accountConnectionString)
        this.containerClient = blobServiceClient.getContainerClient(options.container || options.name);
        this.containerClient.createIfNotExists().then((result) => {
            this.logger.debug(`containerClient.createIfNotExists:${result.succeeded}`);
        });

        this.logger = options.loggerProvider.getLogger(`AzureStorageAccountStore.${options.name}`);
    }

    async get(key:string):Promise<T|null> {
        this.logger.debug(`get:${key}`);
        let content = await this.containerClient.getBlockBlobClient(key + ".json").download()
        let json =  await this.streamToText(content.readableStreamBody);
        return JSON.parse(json);
    }

    async getMany(keys:string[]):Promise<{[id: string]:T}> {
        this.logger.debug(`getMany:${keys}`);
        let items:{[id: string]:T} = {};
        for(let id in keys)
            items[id] = await this.get(id);
        return items;
    }

    async* getAll() : AsyncGenerator<[string, T]> {
        this.logger.debug(`getAll`);
        for(let x in await this.containerClient.listBlobsFlat()) {
            let content = await this.containerClient.getBlockBlobClient(x).download()
            let json =  await this.streamToText(content.readableStreamBody);
            return JSON.parse(json);
        }
    }

    async getKeys():Promise<string[]> {
        this.logger.debug(`getKeys`);
        throw new Error('Not implemented');
    }

    exist(keys: string[]): Promise<{ [id: string]: boolean; }> {
        throw new Error('Not implemented');
    }

    async set(key:string, value:T):Promise<void> {
        this.logger.debug(`set:${key}`, value);
        let json = JSON.stringify(value);
        await this.containerClient.uploadBlockBlob(key + ".json", json, json.length);
    }

    async setTags(key:string, tags:{[tagName: string]: any}):Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getTags(key:string, tagsNames:string[]):Promise<{[tagName: string]: any}> {
        throw new Error("Method not implemented.");
    }
    
    async getAllTags(tagsNames:string[]):Promise<{[key: string]: {[tagName: string]: any}}> {
        throw new Error("Method not implemented.");
    }

    async getByTag(tagName:string, tagValue:any):Promise<{[key: string]: T}> {
        throw new Error("Method not implemented.");
    }

    async streamToText(readable) {
        readable.setEncoding('utf8');
        let data = '';
        for await (const chunk of readable) {
          data += chunk;
        }
        return data;
    }
}