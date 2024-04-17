import { HtmlParser } from "./htmlParser";
import { MarkdownParser } from "./markdownParser";
import { Document } from './document'
import { ContentSourceItem, IContentSource } from '../contentSource/contentSource'
import { ILogger, ILoggerProvider } from '../logger'

export interface IContentExtractor {
    extract(path:string, getContent:() => Promise<Buffer|null>):Promise<{contentRaw:string|null, contentText:string|null, title:string|null, tags: string[], urls: string[]}>;
}

export class ContentExtractor implements IContentExtractor {
	html: HtmlParser;
    markdown: MarkdownParser;
	logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider}) {
        this.logger = options.loggerProvider.getLogger('ContentExtractor');
        this.html = new HtmlParser({loggerProvider:options.loggerProvider});;
        this.markdown = new MarkdownParser({loggerProvider:options.loggerProvider});
    }

    async extract(path:string, getContent:() => Promise<Buffer|null>):Promise<{contentRaw:string|null, contentText:string|null, title:string|null, tags: string[], urls: string[]}> {
        let contentRaw:string|null = null;
        let contentText:string|null = null;
        let title:string|null = null;
        let tags:string[] = [];
        let urls:string[] = [];

        if (path.endsWith('.md')){
            contentRaw = (await getContent())?.toString() ?? null;
            if (contentRaw) {
                var content = this.markdown.parse(contentRaw);
                title = content.headings?.shift()?.text || null;
                contentText = content.contentText.trim();
                urls = content.urls;
            }
        }else if (path.endsWith('.mdx')){
            contentRaw = (await getContent())?.toString() ?? null;
            if (contentRaw) {
                var content = this.markdown.parse(contentRaw);
                title = content.headings?.shift()?.text || null;
                contentText = content.contentText.trim();
                urls = content.urls;
            }
        }
        else if (path.endsWith('.html')){
            contentRaw = (await getContent())?.toString() ?? null;
            if (contentRaw) {
                let content = this.html.parse(contentRaw);
                title = content.headings?.shift()?.text || null;
                contentText = content.contentText.trim();
                urls = content.urls;
            }
        }
        return {contentRaw, contentText, title, tags, urls};
    }
}