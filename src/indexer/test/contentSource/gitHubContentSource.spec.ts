import { GitHubContentSource, } from '../../lib/contentSource/gitHubContentSource'
import type {ContentSourceItem}  from '../../lib/contentSource/contentSource'
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';

var logger = ConsoleLoggerProvider;

test("parse repoUrl with root path", async () => {
    let gitHubContentSource = new GitHubContentSource({loggerProvider:new ConsoleLoggerProvider(), repoUrl: "https://github.com/BlendedFeelings/tests"});
    expect(gitHubContentSource.hostName).toBe("github.com");
    expect(gitHubContentSource.owner).toBe("BlendedFeelings");
    expect(gitHubContentSource.repo).toBe("tests");
    expect(gitHubContentSource.repoPath).toBeNull();
});

test("parse repoUrl with sub path", async () => {
    let gitHubContentSource = new GitHubContentSource({loggerProvider:new ConsoleLoggerProvider(), repoUrl: "https://github.com/BlendedFeelings/src/tree/main/storage/test/data"});
    expect(gitHubContentSource.hostName).toBe("github.com");
    expect(gitHubContentSource.owner).toBe("BlendedFeelings");
    expect(gitHubContentSource.repo).toBe("src");
    expect(gitHubContentSource.repoPath).toBe("tree/main/storage/test/data");
});

test("get item from root path", async () => {
    let gitHubContentSource = new GitHubContentSource({loggerProvider:new ConsoleLoggerProvider(), repoUrl: "https://github.com/BlendedFeelings/tests"});
    let item = await gitHubContentSource.get("index.md");
    expect(item);
    expect(item?.path).toBe("index.md");
    if (item){
        let content = await gitHubContentSource.getContent(item);
        expect(content?.toString()).toBe("### index\n");
    }
});


test("get all items from root path", async () => {
    let gitHubContentSource = new GitHubContentSource({loggerProvider:new ConsoleLoggerProvider(), repoUrl: "https://github.com/BlendedFeelings/tests"});
    let items:Array<ContentSourceItem> = []; 
    for await(let item of gitHubContentSource.getAll()) items.push(item); 
    expect(items).toEqual([{
          path: 'README.md',
          type: 'file',
          uri: 'https://github.com/BlendedFeelings/tests/blob/main/README.md',
          downloadUri: 'https://raw.githubusercontent.com/BlendedFeelings/tests/main/README.md',
          sha: '7e59600739c96546163833214c36459e324bad0a'
        },{
          path: 'docs',
          type: 'folder',
          uri: 'https://github.com/BlendedFeelings/tests/tree/main/docs',
          downloadUri: null,
          sha: '36a66a20cec60f8abd875274aa132e59a4f568b7'
        }, {
          path: 'index.md',
          type: 'file',
          uri: 'https://github.com/BlendedFeelings/tests/blob/main/index.md',
          downloadUri: 'https://raw.githubusercontent.com/BlendedFeelings/tests/main/index.md',
          sha: '89d6c457f651cf54018b05f7cc291b49358ffbd8'
        }
      ]);
});

