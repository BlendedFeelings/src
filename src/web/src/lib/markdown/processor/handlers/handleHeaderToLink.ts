import type { WebIndexItem } from "indexer";
import type { Root, Content, Token, Link, PhrasingContent, StaticPhrasingContent } from '..';

export function handleHeaderToLink(tree:Root, webIndexItem:WebIndexItem):void {
    let firstToken = tree.children[0];
    if (firstToken) {
        let token = firstToken as Token;
        let link:Link = {
            type: 'link',
            url: '/' + webIndexItem?.indexItem?.path,
            children: (token.children ?? [token]).map(x => x as StaticPhrasingContent)
        }
        tree.children[0] = link as Content;
    } else {
        tree.children.push({
            type: 'link',
            url: '/' + webIndexItem?.indexItem?.path,
            children: [
                {type: 'text', value: webIndexItem?.indexItem?.path || ''}
            ]
        });
    }
    
    tree.children[0] = {
        type: 'strong',
        children: [tree.children[0] as PhrasingContent]
    }
}
