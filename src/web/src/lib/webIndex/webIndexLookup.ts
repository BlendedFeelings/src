export interface IWebIndexLookup {
    getPathByIncrementalID(path:string):string|null;
    getIncrementalIDByPath(path:string):string|null;
    getFilesOrderedByPath(path:string):string[];
    getFilesOrderedByIncrementalID(path:string):string[];
    getFoldersOrderedByPath(path:string):string[];
}