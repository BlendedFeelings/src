import {type  IStep, Event, StepContext, StepConfig } from './index'
import * as pathTools from 'path'
import * as paths from '../path'

export class WebSearchStep implements IStep {

	getDefaultStepConfig():StepConfig {
		return {};
	}
 
    async process(event: Event, context: StepContext): Promise<void> {
		let logger = context.services.getLoggerProvider().getLogger("WebSearchStep");
		let webSearch = context.services.getSearchProvider().getWebSearch();
		let indexStore = context.services.getStoreProvider().getIndexStore();
		let contentExtractor = context.services.getContentExtractor();

		if (paths.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}

        let indexItem = await indexStore.get(event.path);
        if (!indexItem){
			logger.warn('IndexItem does not exist. Skipping indexing');
			return;
		}

		if (indexItem.type !== 'file') {
			logger.debug('IndexItem is not file. Skipping indexing')
			return;
		}

		if (pathTools.basename(event.path).startsWith('_')) {
			logger.debug('Path start with _. Skipping indexing')
			return;
		}


		let existingWebSearchItem = await webSearch.get(event.path);
		if (existingWebSearchItem?.sha == indexItem.sha) {
			logger.debug('WebSearchItem is up to date with sha=' + existingWebSearchItem.sha + '  Skipping indexing')
			return;
		}

        let { contentRaw, contentText, title, tags, urls } = await contentExtractor.extract(event.path, () => Promise.resolve(Buffer.from(indexItem?.content || '', 'utf8')));
		let { path, parentPath, cumulativePath } = this.getPaths(event.path);
        title = title || pathTools.basename(event.path);
        await webSearch.addOrUpdate({
			path: path,
			parentPath: parentPath,
			cumulativePath: cumulativePath,
			title: title,
			text: contentText,
			sourceUri: indexItem.sourceUri,
			sha: indexItem.sha,
			timestamp: this.getCurrentUnixTimestamp(),
		});
    }

    getPaths(fullPath:string):{path:string, parentPath:string|null, cumulativePath: string[]} {
		let parentPath:string|null = pathTools.dirname(fullPath);
		if (parentPath === ".")
			parentPath = null;
		let cumulativePath = this.getCumulativePath(fullPath);
		return { path:fullPath, parentPath,  cumulativePath}
	}

    // https://mtsknn.fi/blog/converting-a-path-into-cumulative-segments-in-javascript/
	getCumulativePath(path:string|null): string[]
	{
		if (!path)
			return [];
		let pathSegments = path.split('/');
		let cumulativeSegments:string[] = [];
		for(let i = 0; i < pathSegments.length; i++){
			cumulativeSegments.push(pathSegments.slice(0, i + 1).join('/'));
		}
		return cumulativeSegments;
	}

    getCurrentUnixTimestamp() {
		return Math.floor(Date.now() / 1000);
	}

}