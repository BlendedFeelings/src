import type { Code as BaseCode } from 'mdast-util-from-markdown/lib'
export type { Root, Content, Heading, Link, PhrasingContent, StaticPhrasingContent } from 'mdast-util-from-markdown/lib'

export type Token = {
    type: string,
    value?: string,
    children?: Token[]
}
  
export type Code = BaseCode & {
    includePath?:string
}

export function walkTree(token:Token, callback: (token:Token, index:number, parent:Token) => void) {
    var walk = (token:Token, index:number, parent:Token) => {
          callback(token, index, parent);
          if (token.children)
            for(let i = 0; i < token.children.length; i++)
                walk(token.children[i], i, token);
      };
      if (token.children)
          for(let i = 0; i < token.children.length; i++)
            walk(token.children[i], i, token);
}