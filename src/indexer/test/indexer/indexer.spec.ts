import { Indexer, } from '../../lib/indexer/indexer';
import { resolve } from 'path'
import { InMemorySearch } from '../../lib/search/inMemorySearch';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import { expect, test} from '@jest/globals';
import { IStep, InMemoryQueue, InMemoryStore } from '../../lib';
import { CrawlStep } from '../../lib/indexer/crawlStep';
import { IndexStep } from '../../lib/indexer/indexStep';
import { IncludesStep } from '../../lib/indexer/includesStep';
import { WebIndexStep } from '../../lib/indexer/webIndexStep';
import { WebSearchStep } from '../../lib/indexer/webSearchStep';
import { Services } from '../../lib/services'

import * as fs from 'fs';


const testData = resolve(__dirname, "data")

function createServices(folder:string):Services {
    let services = new Services({
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
            webSearch: { type: 'inMemory'},
        } 
    });
    return services;
}


test("index file, run two steps", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let stepOnePaths:string[] = [];
    let stepTwoPaths:string[] = [];
    indexer.createSteps = () => [
        {
            process: (event:any, context:any) => {
                stepOnePaths.push(event.path);
                return Promise.resolve();
            }
        },
        {
            process: (event:any, context:any) => {
                stepTwoPaths.push(event.path);
                return Promise.resolve();
            }
        }
    ];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();
    expect(stepOnePaths).toEqual(["data/index.md"]);
    expect(stepTwoPaths).toEqual(["data/index.md"]);
});

test("default config, run:true", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let defaultConfig = {run: true, force: true, options: {a:1} };
    let resolvedDefaultConfig = null;
    indexer.createSteps = () => [
        {
            getDefaultStepConfig() {
                return defaultConfig;
            },
            process: (event:any, context:any) => {
                resolvedDefaultConfig = context.stepConfig;
                return Promise.resolve();
            }
        }
    ];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();
    expect(resolvedDefaultConfig).toEqual(defaultConfig);
});

test("default config, run:false", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let ranStep = false;
    let defaultConfig = {run: false, force: true, options: {a:1} };
    indexer.createSteps = () => [
        {
            getDefaultStepConfig() {
                return defaultConfig;
            },
            process: (event:any, context:any) => {
                ranStep = true;
                return Promise.resolve();
            }
        }
    ];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md", steps: {stepName: {run: false}}});
    await contentQueue.wait();
    expect(ranStep).toBe(false);
});

test("event config, run:false", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let ranStep = false;
    class TestStep implements IStep {
        async process(event:any, context:any) {
            ranStep = true;
            return Promise.resolve();
        }
    }
    indexer.createSteps = () => [new TestStep()];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md", steps: {TestStep: {run: false}}});
    await contentQueue.wait();
    expect(ranStep).toBe(false);
});

test("index file, IndexStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexStore = services.getStoreProvider().getIndexStore();
    let indexer = services.getIndexer();

    indexer.createSteps = () => [new IndexStep()];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();

    expect(await indexStore.get("data/index.md")).toEqual({
        path: "data/index.md",
        content: "### index",
        sha: "2c7a2f923a70650079c2df21a419e502bc2efddb7d90abdd824e5d4cd99ff581",
        type: "file",
        sourceType: "FileSystem",
        sourceUri:  "file://" + resolve(testData, "index.md"),
        sourcePath: "index.md",
        title: "index"
    });

});

test("index file, IndexStep, WebIndexStep, WebSearchStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let contentSearch = services.getSearchProvider().getWebSearch();
    let indexer = services.getIndexer();

    //let contentSearch = new InMemorySearch({loggerProvider: new ConsoleLoggerProvider()});
    //let contentQueue = new InMemoryQueue({name: "contentQueue", loggerProvider: new ConsoleLoggerProvider()});

    let webSearchStep = new WebSearchStep();
    webSearchStep.getCurrentUnixTimestamp = () => 101; 
    //let indexer = createIndexer("data");
    indexer.createSteps = () => [new IndexStep(), new WebIndexStep(), webSearchStep];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();

    expect(await contentSearch.get("data/index.md")).toEqual({
        path: "data/index.md",
        parentPath: "data",
        cumulativePath: ["data","data/index.md"],
        title: "index",
        sha: "2c7a2f923a70650079c2df21a419e502bc2efddb7d90abdd824e5d4cd99ff581",
        timestamp: 101,
        text: "index",
        sourceUri:  "file://" + resolve(testData, "index.md"),
    });
});

test("index file, CrawlStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let processedPath:string[] = [];
    indexer.createSteps = () => [new CrawlStep(), {
        process: (event:any, context:any) => {
            processedPath.push(event.path);
            return Promise.resolve();
        }
    }];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();
    expect(processedPath).toHaveLength(1);
    expect(processedPath[0]).toBe("data/index.md");
});

test("index root folder, CrawlStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let processedPath:string[] = [];
    indexer.createSteps = () => [new CrawlStep(),{
        process: (event:any, context:any) => {
            processedPath.push(event.path);
            return Promise.resolve();
        }
    }];
    indexer.startIndexing();
    await indexer.queue({path: "data"});
    await contentQueue.wait();

    expect(processedPath).toEqual([
        "data", 
        "data/index.md", 
        "data/sub1", 
        "data/sub2", 
        "data/sub1/sub11.md", 
        "data/sub1/sub12.md", 
        "data/sub2/sub21.md"])
});

test("index sub folder, CrawlStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let processedPath:string[] = [];
    indexer.createSteps = () => [new CrawlStep(),{
        process: (event:any, context:any) => {
            processedPath.push(event.path);
            return Promise.resolve();
        }
    }];
    indexer.startIndexing();
    await indexer.queue({path: "data/sub1"});
    await contentQueue.wait();

    expect(processedPath).toEqual([ 
        "data/sub1", 
        "data/sub1/sub11.md", 
        "data/sub1/sub12.md",])
});

test("index root folder, CrawlStep, force:false", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let processedPath:string[] = [];
    indexer.createSteps = () => [new CrawlStep(),{
        process: (event:any, context:any) => {
            processedPath.push(event.path);
            return Promise.resolve();
        }
    }];
    indexer.startIndexing();
    let indexStore = new InMemoryStore({name: "indexStore", loggerProvider: new ConsoleLoggerProvider()});
    indexStore.set("root/level1", {type: "folder"});  
    indexStore.set("root/level1/file1", {type: "file"});
    indexStore.set("root/level1/file2", {type: "file"});
    indexStore.set("root/level2", {type: "folder"});
    indexStore.set("root/level2/file3", {type: "file"});

    await indexer.queue({path: "root", steps: {CrawlStep: {force: false}}});
    await contentQueue.wait();

    expect(processedPath).toEqual([ 
        "root", 
        "root/level1", 
        "root/level2",
        "root/level1/file1", 
        "root/level1/file2",
        "root/level2/file3"])
});

test("index sub folder, CrawlStep, force:false", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let indexer = services.getIndexer();

    let processedPath:string[] = [];
    indexer.createSteps = () => [new CrawlStep(), {
        process: (event:any, context:any) => {
            processedPath.push(event.path);
            return Promise.resolve();
        }
    }];
    indexer.startIndexing();
    let indexStore = new InMemoryStore({name: "indexStore", loggerProvider: new ConsoleLoggerProvider()});
    indexStore.set("root/level1", {type: "folder"});  
    indexStore.set("root/level1/file1", {type: "file"});
    indexStore.set("root/level1/file2", {type: "file"});
    indexStore.set("root/level2", {type: "folder"});
    indexStore.set("root/level2/file3", {type: "file"});

    await indexer.queue({path: "root/level1", steps: {CrawlStep: {force: false}}});
    await contentQueue.wait();

    expect(processedPath).toEqual([ 
        "root/level1", 
        "root/level1/file1", 
        "root/level1/file2"])
});

test("index file, IndexStep, WebIndexStep", async () => {
    let services = createServices("data");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let webIndexStore = services.getStoreProvider().getWebIndexStore();
    let indexer = services.getIndexer();

    indexer.createSteps = () => [new IndexStep(), new WebIndexStep()];
    indexer.startIndexing();
    await indexer.queue({path: "data/index.md"});
    await contentQueue.wait();

    expect(await webIndexStore.get("data/index.md")).toEqual({
        incrementalID: "1",
        includesItem: undefined,
        indexItem: {
            content: "### index",
            path: "data/index.md",
            sha: "2c7a2f923a70650079c2df21a419e502bc2efddb7d90abdd824e5d4cd99ff581",
            sourcePath: "index.md",
            sourceType: "FileSystem",
            sourceUri: "file://C:\\Projects\\b\\src\\indexer\\test\\indexer\\data\\index.md",
            title: "index",
            type: "file",
        },
        title: "index",
    });
});

test("index file, IndexStep, IncludesStep", async () => {
    let services = createServices("data2");
    let contentQueue = services.getQueueProvider().getContentQueue();
    let includesStore = services.getStoreProvider().getIncludesStore();
    let indexer = services.getIndexer();
    
    indexer.createSteps = () => [new IndexStep(), new IncludesStep()];
    indexer.startIndexing();
    await indexer.queue({path: "data2/code.md"});
    await contentQueue.wait();

    expect(await includesStore.get("data2/code.md")).toEqual({'includes':[{path:"https://github.com/BlendedFeelings/tests/blob/main/code.js", content:"function test() { return 'test' }\n"}]});
});
