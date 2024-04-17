import type { WebIndexItem } from "indexer";
import { walkTree } from "..";
import type { Root, Token, Link } from "..";

export function handleLinks(tree:Root, webIndexItem:WebIndexItem):void {
    let paretnPath = webIndexItem.indexItem?.path.substring(
        0, 
        webIndexItem.indexItem?.path.lastIndexOf('/'));
    walkTree(tree, (token:Token, index:number, parent:Token) => {	
        if (token.type === 'link') {
            let link = token as Link;
            link.url = '/' + paretnPath + '/' + link.url;
        }
    });
}