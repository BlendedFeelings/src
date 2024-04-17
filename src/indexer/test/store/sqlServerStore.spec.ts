import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';
import * as dotenv from 'dotenv';
import { SqlServerStore } from '../../lib';
dotenv.config()

   
test("set and get item by id", async () => {;
    let item1 = {
        path: 'item1',
        content: 'content ' + Date.now().toString(),
    }
    let item2 = {
        path: 'item2',
        content: 'content ' + Date.now().toString(),
    }

    let sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    await sqlServerStore.set('item1', item1);
    await sqlServerStore.set('item2', item2);
    expect(await sqlServerStore.get('item1')).toEqual(item1);
    expect(await sqlServerStore.get('item2')).toEqual(item2);

    sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    expect(await sqlServerStore.get('item1')).toEqual(item1);
    expect(await sqlServerStore.get('item2')).toEqual(item2);
});

test("get InvalidColumnName from error", async () => {
    let sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    expect(sqlServerStore.getInvalidColumnNameFromError(new Error('Invalid column name \'id\'.'))).toEqual('id');
    expect(sqlServerStore.getInvalidColumnNameFromError(new Error('Invalid adf name \'id\'.'))).toEqual(null);
});

test("set and get tags by id", async () => {
    let item = {
        path: 'item',
        content: 'content ' + Date.now().toString(),
    }

    let sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    await sqlServerStore.set('item', item);
    await sqlServerStore.setTags('item', {
        tag1: 'value1',
        tag2: 'value2',
    });
    let tags = await sqlServerStore.getTags('item', ['tag1', 'tag2']);

    expect(tags).toEqual({
        tag1: 'value1',
        tag2: 'value2',
    });
});

test("get all tags", async () => {
    let item = {
        path: 'item',
        content: 'content ' + Date.now().toString(),
    }

    let sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    await sqlServerStore.set('item', item);
    await sqlServerStore.setTags('item', {
        tag1: 'value1',
        tag2: 'value2',
    });
    let tags = await sqlServerStore.getAllTags(['tag1', 'tag2']);

    expect(tags['item']).toEqual({
        tag1: 'value1',
        tag2: 'value2',
    });
});

test("get by tag", async () => {
    let item = {
        path: 'item',
        content: 'content ' + Date.now().toString(),
    }

    let sqlServerStore =  new SqlServerStore({name: 'test_store', loggerProvider: new ConsoleLoggerProvider()})
    await sqlServerStore.set('item', item);
    await sqlServerStore.setTags('item', {
        tag1: 'value1',
        tag2: 'value2',
    });
    let items = await sqlServerStore.getByTag('tag1', 'value1');

    expect(items['item']).toEqual(item);
});