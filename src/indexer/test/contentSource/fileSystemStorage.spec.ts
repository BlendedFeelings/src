import { FileSystemContentSource, } from '../../lib/contentSource/fileSystemContentSource'
import type {ContentSourceItem}  from '../../lib/contentSource/contentSource'
import { fileURLToPath  } from 'url'
import { dirname, resolve } from 'path'
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test } from '@jest/globals';

//const __filename = fileURLToPath(module.parent.filename);
//const __dirname = dirname(__filename);
const rootPath = resolve(__dirname, "data")

test("get item from root path", async () => {
    let storage = new FileSystemContentSource({path: rootPath, loggerProvider: new ConsoleLoggerProvider()});
    let item = await storage.get("index.md");
    expect(item?.path).toBe("index.md");
});

test("get item from sub path", async () => {
    let storage = new FileSystemContentSource({path: rootPath, loggerProvider: new ConsoleLoggerProvider()});
    let item = await storage.get("sub1/sub11.md");
    expect(item?.path).toBe("sub1/sub11.md");
});

test("get all from root path", async () => {
    let storage = new FileSystemContentSource({path: rootPath, loggerProvider: new ConsoleLoggerProvider()});
    let items:Array<ContentSourceItem> = []; 
    for await(let item of storage.getAll()) items.push(item);
    expect(items.length).toBe(3);
    expect(items[0].path).toBe("index.md");
    expect(items[0].type).toBe("file");
    expect(items[1].path).toBe("sub1");
    expect(items[1].type).toBe("folder");
    expect(items[2].path).toBe("sub2");
    expect(items[2].type).toBe("folder");
});

test("get all from sub path", async () => {
    let storage = new FileSystemContentSource({path: rootPath, loggerProvider: new ConsoleLoggerProvider()});
    let items:Array<ContentSourceItem> = []; 
    for await(let item of storage.getAll("sub1")) items.push(item);
    expect(items.length).toBe(2);
    expect(items[0].path).toBe("sub1/sub11.md");
    expect(items[0].type).toBe("file");
    expect(items[1].path).toBe("sub1/sub12.md");
    expect(items[1].type).toBe("file");
});

test("get item with baseUrl mapping", async () => {
    let storage = new FileSystemContentSource({path: rootPath, loggerProvider: new ConsoleLoggerProvider(), baseUrl: "http://localhost:8080/Base/Url/Test"});
    let item = await storage.get("index.md");
    expect(item?.uri).toBe("http://localhost:8080/Base/Url/Test/index.md");
});