import { beforeEach, expect, test} from '@jest/globals';
import { resolve } from 'path'
import { ConsoleLoggerProvider } from 'indexer';
import { WebServices } from '../../../src/lib/webServices'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { InMemoryWebIndexLookup } from '$lib/webIndex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testData = resolve(__dirname, "data")

function createServices(folder:string):WebServices {
    let services = new WebServices({
        loggerProvider: new ConsoleLoggerProvider(),
        environmentConfig: {
            contentSource: [{
                basePath: folder,
                type: "FileSystem",
                options: {path: resolve(__dirname, folder)}
            }],
            contentQueue: { type: 'inMemory'},
            webIndexStore: { type: 'inMemory'},
            indexStore: { type: 'inMemory'},
            includesStore: { type: 'inMemory'},
            settingsStore: { type: 'inMemory'},
            webSearch: { type: 'inMemory'},
        } 
    });
    return services;
}

let services:WebServices;

beforeEach(async () => {
    services = createServices("data");
    let indexer = services.getIndexer();
    indexer.startIndexing();
    await indexer.queue({path: "data"});
    await services.getQueueProvider().getContentQueue().wait();
    await (services.getWebIndexLookup() as InMemoryWebIndexLookup).refresh()
});
  
test("all folders", async () => {
    let allFoldersFetchStrategy = services.getAllFoldersFetchStrategy();
    let results = await allFoldersFetchStrategy.fetch({})
    expect(results.items.map(x => x.indexItem?.path)).toEqual(['data/sub1','data/sub2'])
});

test("latest", async () => {
    let getLatestFetchStrategy = services.getLatestFetchStrategy();
    let results = await getLatestFetchStrategy.fetch({})
    expect(results.items.map(x => x.indexItem?.path)).toEqual(["data/sub2/sub21.md", "data/sub1/sub12.md", "data/sub1/sub11.md", "data/index.md"])
});

test("random", async () => {
    let getRandomFetchStrategy = services.getRandomFetchStrategy();
    let results = await getRandomFetchStrategy.fetch({})
    expect(results.items.map(x => x.indexItem?.path)).toHaveLength(4);
});

test("search", async () => {
    let getSearchFetchStrategy = services.getSearchFetchStrategy();
    let results = await getSearchFetchStrategy.fetch({query:'sub21'})
    expect(results.items.map(x => x.indexItem?.path).slice(0,1)).toEqual(["data/sub2/sub21.md"])
});
