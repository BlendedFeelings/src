import { ILoggerProvider } from "../logger";
import { FileSystemContentSource } from "./fileSystemContentSource";
import { GitHubContentSource } from "./gitHubContentSource";

export interface IContentSource {
    get(path: string): Promise<ContentSourceItem|null>;
    getContent(item: ContentSourceItem): Promise<Buffer|null>;
    getAll(path?:string|null): AsyncGenerator<ContentSourceItem>;
}

export class ContentSourceItem {
    constructor(params:{path:string, type: 'file'|'folder', uri: string, sha?: string, downloadUri?: string }) {
        this.path = params.path;
        this.type = params.type;
        this.uri = params.uri;
        this.downloadUri = params.downloadUri;
        this.sha = params.sha;
    }

    public path: string;
    public type: 'file'|'folder'
    public uri: string;
    public downloadUri?: string;
    public sha?: string;

}

export function createContentSource(type: string, options:any, loggerProvider:ILoggerProvider): IContentSource|null {
    if (type === "GitHub")
        return new GitHubContentSource({loggerProvider, ...options});
    if (type === "FileSystem")
        return new FileSystemContentSource({loggerProvider, ...options})
    return null;
}
