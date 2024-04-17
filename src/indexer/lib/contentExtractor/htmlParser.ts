import * as parse5 from 'parse5';
import * as htmlparser2 from 'parse5-htmlparser2-tree-adapter'
import { Document } from './document'
import { ILogger, ILoggerProvider } from '../logger'

export class HtmlParser {
  logger:ILogger;

  constructor(options:{loggerProvider:ILoggerProvider}) {
      this.logger = options.loggerProvider.getLogger('HtmlParser');
  }

    parse(html: string): Document {
      
      const treeAdapter = htmlparser2.adapter;
      const options = { treeAdapter };
      const dom = parse5.parse(html, options);
      const textNodeContents:string[] = [];
      const headings: {tag: string, text: string}[] = [];
      const urls: string[] = [];

      const traverseNodes = (parentNode:any) => {
        treeAdapter.getChildNodes(parentNode).forEach(node => {
          if (treeAdapter.isTextNode(node))
            textNodeContents.push(treeAdapter.getTextNodeContent(node));
          if (treeAdapter.isElementNode(node)) {
            const tag = treeAdapter.getTagName(node);
            if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
              let text:string|null = null;
              treeAdapter.getChildNodes(node).forEach(x => {
                if (treeAdapter.isTextNode(x))
                  text = text ? 
                      text + " " +  treeAdapter.getTextNodeContent(x) 
                    : treeAdapter.getTextNodeContent(x);
              });
              headings.push({tag, text: text ?? ""});
            }
            if (tag === 'a' && node.attribs && 'href' in node.attribs) {
              urls.push(node.attribs['href'])
            }
            traverseNodes(node);
          }
        });
      };
      traverseNodes(dom);
      
      const contentText = textNodeContents.join(' ');
      return { contentText, headings, urls}
    }
}

