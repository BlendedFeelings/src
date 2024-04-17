import {type  IStep, Event, StepContext, StepConfig } from './index'
import { ContentSourceItem, IContentSource } from '../contentSource';
import * as paths from '../path'

export class CrawlRandomStep implements IStep {

	getDefaultStepConfig():StepConfig {
		return { force: true };
	}
 
    async process(event: Event, context: StepContext): Promise<void> {
        let logger = context.services.getLoggerProvider().getLogger("CrawlRandomStep");
        if (paths.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}

        await this.crawlSource(event, context);
    }

    async crawlSource(event: Event, context: StepContext): Promise<void> {
        let loggerProvider = context.services.getLoggerProvider();
        let logger = loggerProvider.getLogger("CrawlRandomStep");
        if (paths.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}

        let { basePath, sourcePath } = paths.parsePath(event.path);
        let source = context.services.getEnvironmentConfig().contentSource.find(x => x.basePath === basePath);
        if (!source) {
            logger.debug(`Cannot find source config in EnvironmentConfig for basePath: ${basePath}`)
			return;
        }
        let contentSource = context.services.getContentSourceProvider().get(source.type, source.options);
        let contentQueue = context.services.getQueueProvider().getContentQueue();
        let items = await this.getAll(contentSource, sourcePath);
        // random order of items
        items = items.sort(() => Math.random() - 0.5);
        for await(let itemInFolder of items) {
            await contentQueue.push(
                {
                    path: basePath + '/' + itemInFolder.path,
                    parent: event,
                    traceId: loggerProvider.getTraceId(),
                    parentId: loggerProvider.getSpanId()
                }
            );
        }
        
    }

    async getAll(contentSource:IContentSource,path:string|null = null): Promise<ContentSourceItem[]> {
        let items:ContentSourceItem[] = [];
        for await(let item of contentSource.getAll(path)) {
            items.push(item);
            if (item.type === 'folder')
                items = items.concat(await this.getAll(contentSource, item.path));
        }
        return items;
    }
}