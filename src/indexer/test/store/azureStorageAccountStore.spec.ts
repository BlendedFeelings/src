import { AzureStorageAccountStore } from '../../lib';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';

test("add and get item by path", async () => {;
    let azureStorageAccountStore =  new AzureStorageAccountStore({name:'test', loggerProvider:new ConsoleLoggerProvider()})
    let item = {
        path: 'test',
        content: 'content ' + Date.now().toString(),
        sha: 'sha' + Date.now().toString(),
        sourceType: 'sourceType' + Date.now().toString(),
        sourceUri: 'sourceUri' + Date.now().toString(),
        }
    await azureStorageAccountStore.set('test',item);
    let item2 = await azureStorageAccountStore.get(item.path);
    expect(item).toEqual(item2);
});
