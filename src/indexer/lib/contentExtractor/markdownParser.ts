import { marked } from "marked"
import fm from 'front-matter';
import { Document } from './document'
import { HtmlParser } from "./htmlParser"
import { ILogger, ILoggerProvider } from '../logger'

export class MarkdownParser {
    htmlParser:HtmlParser;
    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider}) {
        this.logger = options.loggerProvider.getLogger('MarkdownParser');
        this.htmlParser = new HtmlParser({loggerProvider:options.loggerProvider});
    }

    parse(markdown: string|null): Document {
      const hooks  = {
        preprocess(markdown) {
          const { attributes, body } = fm<any>(markdown);
          for (const prop in attributes) {
            if (prop in this.options) {
              this.options[prop] = attributes[prop];
            }
          }
          return body;
        }
      };
      marked.use({hooks})
      let html = marked.parse(markdown, { });
      return this.htmlParser.parse(html);
    }
}

