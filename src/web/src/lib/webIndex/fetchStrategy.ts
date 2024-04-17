import type { WebIndexItem } from "indexer";

export interface IFetchStrategy {
    fetch(options:{
        path?: string|null,
        page?:string|null,
        limit?: number|null,
        query?:string|null
    }): Promise<{items: WebIndexItem[], nextPage:string|null }>;
}

