import { walkTree } from "..";
import type { Root, Token, Code } from "..";
import type { WebIndexItem } from "indexer";

export function handleIncludes(tree:Root, webIndexItem:WebIndexItem):void {
    walkTree(tree, (token:Token, index:number, parent:Token) => {
        if (token.value) {
            var matches = token.value.match(/\[!INCLUDE (.*)\]/);
            if (matches) {
                let includePath = matches[1];
                let includeContent = webIndexItem?.includesItem?.includes.find(i => i.path === includePath)?.content;
                if (includeContent) {
                    token.value = includeContent;
                    if (token.type === 'code') {
                        let codeToken = token as Code;
                        codeToken.includePath = includePath
                    }
                }
            }
        }
    });
}
