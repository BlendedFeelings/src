import { FileStore } from '../../lib';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';


test("set and get item by id", async () => {;
    let item1 = {
        path: 'item1',
        content: 'content ' + Date.now().toString(),
    }
    let item2 = {
        path: 'item2',
        content: 'content ' + Date.now().toString(),
    }

    let localStore =  new FileStore({loggerProvider: new ConsoleLoggerProvider(), name: 'localStore_test'})
    await localStore.set('item1', item1);
    await localStore.set('item2', item2);
    expect(await localStore.get('item1')).toEqual(item1);
    expect(await localStore.get('item2')).toEqual(item2);

    localStore =  new FileStore({loggerProvider: new ConsoleLoggerProvider(), name: 'localStore_test'})
    expect(await localStore.get('item1')).toEqual(item1);
    expect(await localStore.get('item2')).toEqual(item2);
});
