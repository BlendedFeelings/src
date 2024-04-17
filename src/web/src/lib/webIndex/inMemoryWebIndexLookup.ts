import type { ILogger, ILoggerProvider, IStore, WebIndexItem } from 'indexer';
import type { IWebIndexLookup } from './webIndexLookup'
import { getCumulativePath } from 'indexer';

declare global {
    var cumulativePathToFilesOrderedByPath:{[cumulativePath: string]: string[]};
    var cumulativePathToFilesOrderedByIncrementalID:{[cumulativePath: string]: string[]};
    var cumulativePathToFoldersOrderedByPath:{[cumulativePath: string]: string[]};
    var incrementalIDToPath:{[id: string]: string};
    var pathToIncrementalID:{[path: string]: string};
    var lastRefreshTime:number;
    var isRefreshing:boolean;
    var indexVersion:string|null;
}

export class InMemoryWebIndexLookup implements IWebIndexLookup {
    logger: ILogger;
    webIndexStore:IStore<WebIndexItem>
    settingsStore:IStore<string>;
    
    constructor(options:{loggerProvider:ILoggerProvider, webIndexStore:IStore<WebIndexItem>, settingsStore:IStore<string>}) {
        this.logger = options.loggerProvider.getLogger(`InMemoryWebIndexLookup`);
        this.webIndexStore = options.webIndexStore;
        this.settingsStore = options.settingsStore;
        this.ensureFreshness();
    }
    
    getPathByIncrementalID(incrementalID:string):string|null {
        return global.incrementalIDToPath[incrementalID] ?? null;
    }

    getIncrementalIDByPath(path:string):string|null {
        return global.pathToIncrementalID[path] ?? null;
    }

    getFilesOrderedByPath(path:string):string[] {
        return global.cumulativePathToFilesOrderedByPath[path];
    }

    getFilesOrderedByIncrementalID(path:string):string[] {
        return global.cumulativePathToFilesOrderedByIncrementalID[path];
    }

    getFoldersOrderedByPath(path:string):string[] {
        return global.cumulativePathToFoldersOrderedByPath[path];
    }

    ensureFreshness() {
        if (global.isRefreshing)
            return;

        if (!global.lastRefreshTime) {
            this.refresh();
            return;
        }

        let oneMinute = 60000;
        if (global.lastRefreshTime + oneMinute < Date.now()) {
            this.settingsStore.get("indexVersion").then(x => {
                if (global.indexVersion != x)
                    this.refresh();
            })
        }
            
    }

    async refresh():Promise<void> {
        try {
            global.isRefreshing = true;
            this.logger.debug('Refreshing cache')
            let tags = await this.webIndexStore.getAllTags(['incrementalID', 'type']);
            // pathToIncrementalID
            let pathToIncrementalID:{[id: string]: string} = {};
            for(let path in tags)
                pathToIncrementalID[path] = tags[path]['incrementalID'];

            // incrementalIDToPath
            let incrementalIDToPath:{[id: string]: string} = {};
            for(let path in tags)
                incrementalIDToPath[tags[path]['incrementalID']] = path;

            // cumulativePathToFilesOrderedByPath
            let cumulativePathToFilesOrderedByPath:{[cumulativePath: string]: string[]} = {"":[]};
            for(let path in tags) {
                if (tags[path]['type'] !== 'file')
                    continue;
                cumulativePathToFilesOrderedByPath[""].push(path);
                for(let pathSegment of getCumulativePath(path)) {
                    if (pathSegment == path)
                        continue;
                    if (!cumulativePathToFilesOrderedByPath[pathSegment])
                        cumulativePathToFilesOrderedByPath[pathSegment] = [];
                    cumulativePathToFilesOrderedByPath[pathSegment].push(path);
                }
            }
            for(let cumulativePath in cumulativePathToFilesOrderedByPath)
                cumulativePathToFilesOrderedByPath[cumulativePath] = cumulativePathToFilesOrderedByPath[cumulativePath].sort()

            // cumulativePathToFilesOrderedByIncrementalID
            let cumulativePathToFilesOrderedByIncrementalID:{[cumulativePath: string]: string[]} = {"":[]};
            let cumulativePathToIncrementalID:{[cumulativePath: string]: number[]} = {"":[]};
            for(let path in tags) {
                if (tags[path]['type'] !== 'file')
                    continue;
                cumulativePathToIncrementalID[""].push(tags[path]['incrementalID']);
                for(let pathSegment of getCumulativePath(path)) {
                    if (pathSegment == path)
                        continue;
                    if (!cumulativePathToIncrementalID[pathSegment])
                        cumulativePathToIncrementalID[pathSegment] = [];
                    cumulativePathToIncrementalID[pathSegment].push(tags[path]['incrementalID']);
                }
            }
            for(let cumulativePath in cumulativePathToIncrementalID)
                cumulativePathToIncrementalID[cumulativePath] = cumulativePathToIncrementalID[cumulativePath].sort((a, b) => a - b);

            for(let cumulativePath in cumulativePathToIncrementalID)
                cumulativePathToFilesOrderedByIncrementalID[cumulativePath] = cumulativePathToIncrementalID[cumulativePath].map(id => incrementalIDToPath[id])

            // cumulativePathToFoldersOrderedByPath
            let cumulativePathToFoldersOrderedByPath:{[cumulativePath: string]: string[]} = {"":[]};
            for(let path in tags) {
                if (tags[path]['type'] == 'folder') {
                    cumulativePathToFoldersOrderedByPath[""].push(path);
                    for(let pathSegment of getCumulativePath(path)) {
                        if (!cumulativePathToFoldersOrderedByPath[pathSegment])
                        cumulativePathToFoldersOrderedByPath[pathSegment] = [];
                        cumulativePathToFoldersOrderedByPath[pathSegment].push(path);
                    }
                }
            }
            for(let cumulativePath in cumulativePathToFoldersOrderedByPath)
                cumulativePathToFoldersOrderedByPath[cumulativePath] = cumulativePathToFoldersOrderedByPath[cumulativePath].sort()
            
            global.indexVersion = await this.settingsStore.get("indexVersion");
            global.incrementalIDToPath = incrementalIDToPath;
            global.pathToIncrementalID = pathToIncrementalID;
            global.cumulativePathToFilesOrderedByPath = cumulativePathToFilesOrderedByPath;
            global.cumulativePathToFilesOrderedByIncrementalID = cumulativePathToFilesOrderedByIncrementalID;
            global.cumulativePathToFoldersOrderedByPath = cumulativePathToFoldersOrderedByPath;
            global.lastRefreshTime = Date.now();
        } finally {
            global.isRefreshing = false;
        }
    }
}