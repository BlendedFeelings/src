export * from './inMemorySearch'
export * from './meilisearchSearch'
export * from './searchProvider'

export interface ISearch {
    addOrUpdate(item: SearchIndexableItem): Promise<any>;
    remove(path: string): Promise<any>;
    get(path: string): Promise<SearchItem|null>;
    getAll<Keys extends keyof SearchItem>(paths:string[]): Promise<Pick<SearchItem, Keys>[]>;
    search(options: SearchOptions): Promise<SearchResults>;
}

export type SearchIndexableItem = {
    path: string;
    parentPath?: string|null;
    cumulativePath?: string[];
    title?: string;
    sourceUri?: string|null;
    sha?: string|null;
    timestamp?: number;
    text?: string|null;
}

export type SearchItem = {
    path: string;
    sha?: string;
    timestamp?: number;
}

export type SearchOptions = {
    q?: string|null; 
    tags?: string[]|null; 
    cumulativePath?: string|null
    offset?: number|null;
    limit?: number|null;
}

export type SearchResults = {
    hits: SearchItem[];
}
