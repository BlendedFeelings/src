import { IContentSource, ContentSourceItem } from "./contentSource";
import * as urlTools from "url";
import { fetch } from "../fetch";
import { ILogger, ILoggerProvider } from '../logger'

export class GitHubContentSource implements IContentSource {

    repoUrl: string;
    hostName: string;
    owner: string;
    repo: string;
    repoPath:string;
    branch:string;

    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider, repoUrl: string }) {
        this.logger = options.loggerProvider.getLogger('GitHubContentSource');
        this.repoUrl = options.repoUrl;
        let url = urlTools.parse(options.repoUrl);
        this.hostName = url.hostname;
        this.owner = url.path.split('/')[1];
        this.repo = url.path.split('/')[2];
        this.repoPath = url.path.split('/').slice(3).join('/');
        this.repoPath = this.repoPath ? this.repoPath : null;
    }

    async get(path: string): Promise<ContentSourceItem|null> {
        let url = `https://api.${this.hostName}/repos/${this.owner}/${this.repo}/contents/${path}`;
        let response = await fetch(url, { headers: 
            { 
                'Content-Type': 'application/json',
                'Accept' : 'application/vnd.github+json' 
            }
        });
        if(response.status !== 200)
            return null;
        let item:any = await response.json();
        return new ContentSourceItem({
            path: item.path,
            type: item.type === "dir" ? "folder" : "file",
            uri: item.html_url,
            downloadUri: item.download_url,
            sha: item.sha
        });
    }

    async getContent(item: ContentSourceItem): Promise<Buffer|null> {
        return Buffer.from(await (await fetch(item.downloadUri)).arrayBuffer());
    }
    
    async* getAll(path:string|null = null): AsyncGenerator<ContentSourceItem> {
        let url = `https://api.${this.hostName}/repos/${this.owner}/${this.repo}/contents`;
        if (path)
            url += ("/" + path);
        let response = await fetch(url, { headers: 
            { 
                'Content-Type': 'application/json',
                'Accept' : 'application/vnd.github+json' 
            }
        });
        if(response.status !== 200)
            return null;
        let items:[any] = await response.json() as [any];
        for (let item of items) {
            yield new ContentSourceItem({
                path: item.path,
                type: item.type === "dir" ? "folder" : "file",
                uri: item.html_url,
                downloadUri: item.download_url,
                sha: item.sha
            });
        }
    }
}
