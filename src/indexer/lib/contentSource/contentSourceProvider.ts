import { ILoggerProvider } from "../logger";
import { IContentSource } from "./contentSource";
import { FileSystemContentSource } from "./fileSystemContentSource";
import { GitHubContentSource } from "./gitHubContentSource";

export interface IContentSourceProvider {
    get(path: string, options:any): IContentSource;
}

export class ContentSourceProvider implements IContentSourceProvider {
    loggerProvider:ILoggerProvider;

    constructor(options:{loggerProvider:ILoggerProvider}) {
        this.loggerProvider = options.loggerProvider;
    }

    get(type: string, options:any): IContentSource {
        if (type === "GitHub")
            return new GitHubContentSource({loggerProvider: this.loggerProvider, ...options});
        if (type === "FileSystem")
            return new FileSystemContentSource({loggerProvider: this.loggerProvider, ...options})
        throw new Error(`Cannot find Content Provider for type: ${type}`);
    }
    
}

