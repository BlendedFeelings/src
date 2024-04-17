import { StateCacheStore } from '../../lib';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, jest, test} from '@jest/globals';


test("cached multiple get by id", async () => {;
    let item = {
        path: 'item1',
        content: 'content ' + Date.now().toString(),
    }

    let state = {};
    let innerStore:any = {};
    innerStore.get = jest.fn((key:string):any => {
        return item;
    });
    let stateCacheStore =  new StateCacheStore({state, store:innerStore, loggerProvider: new ConsoleLoggerProvider(), name:'test'})
    expect(await stateCacheStore.get('item1')).toEqual(item);
    expect(await stateCacheStore.get('item1')).toEqual(item);
    expect(innerStore.get).toBeCalledTimes(1);
});

test("set and cached multiple get by id", async () => {;
    let item = {
        path: 'item1',
        content: 'content ' + Date.now().toString(),
    }

    let state = {};
    let innerStore:any = {};
    innerStore.get = jest.fn((key:string):any => {
        return null;
    });
    innerStore.set = jest.fn((key:string, value:any) => {
    });
    let stateCacheStore =  new StateCacheStore({state, store:innerStore, loggerProvider: new ConsoleLoggerProvider(), name:'test'})
    await stateCacheStore.set('item1', item);
    expect(await stateCacheStore.get('item1')).toEqual(item);
    expect(await stateCacheStore.get('item1')).toEqual(item);
    expect(innerStore.set).toBeCalledTimes(1);
    expect(innerStore.get).toBeCalledTimes(0);
});