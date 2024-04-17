import fm from 'front-matter';
import {fromMarkdown} from 'mdast-util-from-markdown'
import {gfmFromMarkdown} from 'mdast-util-gfm'
import {mdxFromMarkdown} from 'mdast-util-mdx'
import {mathFromMarkdown} from 'mdast-util-math'
import {directiveFromMarkdown} from 'mdast-util-directive'
import {mdxjs} from 'micromark-extension-mdxjs'
import {directive} from 'micromark-extension-directive'
import {gfm} from 'micromark-extension-gfm'
import {math} from 'micromark-extension-math'
import {newlineToBreak} from 'mdast-util-newline-to-break'
import type { Content as ContentToken } from 'mdast-util-from-markdown/lib';
import type { ILoggerProvider, ILogger, WebIndexItem } from "indexer";
import { handleIncludes } from './handlers/handleIncludes';
import { handleLinks } from './handlers/handleLinks';
import { handleHeaderToLink } from './handlers/handleHeaderToLink'

export type { ContentToken }

export class Markdown {
	loggerProvider:ILoggerProvider;
	logger: ILogger;
	constructor(options:{loggerProvider: ILoggerProvider}) {
		this.loggerProvider = options.loggerProvider;
		this.logger = this.loggerProvider.getLogger('Markdown')
	}

	buildTree(body:string|null|undefined) {
		const tree = fromMarkdown(body || '', {
			extensions:[gfm(), directive(), mdxjs()],//extensions: [mdxjs()], , math()
			mdastExtensions: [gfmFromMarkdown(), directiveFromMarkdown, mdxFromMarkdown()] // mdxFromMarkdown(), , mathFromMarkdown()
		})
		return tree;
	}

	tokenizeShort(webIndexItem:WebIndexItem):ContentToken[] {
		try {
			var { attributes, body } = fm<any>(webIndexItem?.indexItem?.content || '');
			let lines = body.split('\n');
			// find first empty line
			let firstEmptyLineIndex = lines.findIndex(line => line.trim() === '');
			// if no empty line found, use the first 5 lines
			if (firstEmptyLineIndex === -1) {
				firstEmptyLineIndex = 5;
			}
			body = lines.slice(0, firstEmptyLineIndex).join('\n');
			const tree = this.buildTree(body)
			newlineToBreak(tree);
			handleLinks(tree, webIndexItem);
			handleHeaderToLink(tree, webIndexItem)
			return structuredClone(tree.children);
		} catch (error) {
			this.logger.error(`Error while tokenizing file: ${ webIndexItem?.indexItem?.path}`);
			this.logger.error(error);
			return [];
		}
	}

	tokenize(webIndexItem:WebIndexItem):ContentToken[] {
		try {
			const { attributes, body } = fm<any>(webIndexItem?.indexItem?.content || '');
			const tree = this.buildTree(body)
			newlineToBreak(tree);
			handleIncludes(tree, webIndexItem);
			handleLinks(tree, webIndexItem);
			return structuredClone(tree.children);
		} catch (error) {
			this.logger.error(`Error while tokenizing file: ${ webIndexItem?.indexItem?.path}`);
			this.logger.error(error);
			return [];
		}
	}
}

