import { IContentSource, ContentSourceItem } from "./contentSource";
import { promises as fs } from "fs";
import * as pathTools from "path";
import { ILogger, ILoggerProvider } from '../logger'

export class FileSystemContentSource implements IContentSource {

    logger:ILogger;
    rootPath: string;
    baseUrl?: string;

    constructor(options:{loggerProvider:ILoggerProvider, path: string, baseUrl?: string}) {
        this.logger = options.loggerProvider.getLogger('FileSystemContentSource');
        if (!options.path)
            throw new Error('options.path is required');
        this.rootPath = options.path;
        this.baseUrl = options.baseUrl;
    }

    async get(path: string): Promise<ContentSourceItem|null> {
        var absoluteFilePath = pathTools.resolve(this.rootPath, path);
        try {
            let stat = await fs.stat(absoluteFilePath);
            var isFile = !(await fs.stat(absoluteFilePath)).isDirectory()
            return new ContentSourceItem({
                path: path,
                type: isFile ? 'file' : 'folder',
                uri: this.getUrl(path, absoluteFilePath)
            });
        } catch {
            return null;
        }
    }

    async getContent(item: ContentSourceItem): Promise<Buffer|null> {
        return item.type === 'file' ? await fs.readFile(pathTools.join(this.rootPath, item.path)) : null
    }

    async* getAll(path:string|null = null): AsyncGenerator<ContentSourceItem> {
        var absoluteCurrentDirectoryPath = path ? pathTools.resolve(this.rootPath, path) : this.rootPath;
        this.logger.debug(`absoluteCurrentDirectoryPath:${absoluteCurrentDirectoryPath}`);
        this.logger.debug(`path:${path}`);
        this.logger.debug(`rootPath:${this.rootPath}`);
        var files = await fs.readdir(absoluteCurrentDirectoryPath.toString(), { withFileTypes: true });
        for (let file of files) {
            this.logger.debug(`file:${file.name}`);
            let relativeFilePath = path ? [path, file.name].join(pathTools.posix.sep) : file.name;
            let absoluteFilePath = pathTools.resolve(absoluteCurrentDirectoryPath, file.name);
            this.logger.debug(`absoluteFilePath:${absoluteFilePath}`);
            this.logger.debug(`relativeFilePath:${relativeFilePath}`);
            yield new Promise<ContentSourceItem>(resolve => resolve(new ContentSourceItem({
                path: relativeFilePath,
                type: file.isDirectory() ? 'folder' : 'file',
                uri: this.getUrl(path, absoluteFilePath)
            })));
        }
    }

    private getUrl(path: string|null, absoluteFilePath: string): string {
        if (this.baseUrl)
            if (path)
                return new URL(pathTools.join(new URL(this.baseUrl).pathname, path), this.baseUrl).toString();
            else
                return new URL(this.baseUrl).toString();
        else
            return 'file://' + absoluteFilePath;
    }
}
