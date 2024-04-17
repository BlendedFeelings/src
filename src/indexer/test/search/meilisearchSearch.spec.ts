import { MeilisearchSearch } from '../../lib/search/meilisearchSearch';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';
import { SearchIndexableItem } from '../../lib';
import { getCumulativePath } from '../../lib/io'

test("add and get item by path", async () => {
    let search = new MeilisearchSearch({index:'test', loggerProvider: new ConsoleLoggerProvider()});
    await search.removeAll();
    await search.addOrUpdate(createFile({title: "course1",path: "/courses/course1.md",parentPath: "/courses",  text: "course"}));
    await search.addOrUpdate(createFile({title: "course2",path: "/courses/course2.md",parentPath: "/courses", text: "course"}));
    await search.addOrUpdate(createFile({title: "course3",path: "/courses/course3/course3.md",parentPath: "/courses/azure", text: "course"}));
    await search.addOrUpdate(createFile({title: "course4",path: "/articles/course4.md",parentPath: "/articles", text: "course"}));
    await search.addOrUpdate(createFile({title: "course5",path: "/course5.md",parentPath: "/", text: "course"}));
    await search.waitForAsyncTasks();
    let item = await search.get("/courses/course2.md");
    expect(item).not.toBeNull();
    expect(item?.path).toBe("/courses/course2.md");
});

test("add and remove item by path", async () => {
    let search = new MeilisearchSearch({index:'test', loggerProvider: new ConsoleLoggerProvider()});
    await search.removeAll();
    await search.addOrUpdate(createFile({title: "course1",path: "/courses/course1.md",parentPath: "/courses",  text: "course"}));
    await search.addOrUpdate(createFile({title: "course2",path: "/courses/course2.md",parentPath: "/courses", text: "course"}));
    await search.addOrUpdate(createFile({title: "course3",path: "/courses/course3/course3.md",parentPath: "/courses/azure", text: "course"}));
    await search.addOrUpdate(createFile({title: "course4",path: "/articles/course4.md",parentPath: "/articles", text: "course"}));
    await search.addOrUpdate(createFile({title: "course5",path: "/course5.md",parentPath: "/", text: "course"}));
    await search.remove("/courses/course2.md");
    await search.waitForAsyncTasks();
    let item = await search.get("/courses/course2.md");
    expect(item).not.toBeNull();
});

test("add and search by text", async () => {
    let search = new MeilisearchSearch({index:'test', loggerProvider: new ConsoleLoggerProvider()});
    await search.removeAll();
    await search.addOrUpdate(createFile({title: "course1",path: "/courses/course1.md",parentPath: "/courses",  text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course2",path: "/courses/course2.md",parentPath: "/courses", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course3",path: "/courses/course3/course3.md",parentPath: "/courses/azure", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course4",path: "/articles/course4.md",parentPath: "/articles", text: "course"}));
    await search.addOrUpdate(createFile({title: "course5",path: "/course5.md",parentPath: "/", text: "course"}));
    await search.waitForAsyncTasks();
    let items = (await search.search({q:"azure"})).hits;
    expect(items.length).toBe(3);
});

test("add and search by empty text", async () => {
    let search = new MeilisearchSearch({index:'test', loggerProvider: new ConsoleLoggerProvider()});
    await search.removeAll();
    await search.addOrUpdate(createFile({title: "course1",path: "/courses/course1.md",parentPath: "/courses",  text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course2",path: "/courses/course2.md",parentPath: "/courses", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course3",path: "/courses/course3/course3.md",parentPath: "/courses/azure", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course4",path: "/articles/course4.md",parentPath: "/articles", text: "course"}));
    await search.addOrUpdate(createFile({title: "course5",path: "/course5.md",parentPath: "/", text: "course"}));
    await search.waitForAsyncTasks();
    let items = (await search.search({})).hits;
    expect(items.length).toBe(0);
});

test("add and search items insdie parent folder", async () => {
    let search = new MeilisearchSearch({index:'test', loggerProvider: new ConsoleLoggerProvider()});
    await search.removeAll();
    await search.addOrUpdate(createFile({title: "course1",path: "/courses/course1.md",parentPath: "/courses",  text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course2",path: "/courses/course2.md",parentPath: "/courses", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course3",path: "/courses/course3/course3.md",parentPath: "/courses/azure", text: "course azure"}));
    await search.addOrUpdate(createFile({title: "course4",path: "/articles/course4.md",parentPath: "/articles", text: "course"}));
    await search.addOrUpdate(createFile({title: "course5",path: "/course5.md",parentPath: "/", text: "course"}));
    await search.waitForAsyncTasks();
    let items = (await search.search({cumulativePath:"/courses", q:"course"})).hits;
    expect(items.length).toBe(3);
});


function createFile(file: { title: string; path: string; parentPath: string; text: string; }): SearchIndexableItem {
    return {...file, path: file.path, parentPath: file.parentPath, cumulativePath:getCumulativePath(file.path), sourceUri:file.path, sha: '', timestamp:0};
}

