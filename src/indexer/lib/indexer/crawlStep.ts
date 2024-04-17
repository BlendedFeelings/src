import {type  IStep, Event, StepContext, StepConfig } from './index'
import type { ILogger } from '../logger';
import * as paths from '../path'

export class CrawlStep implements IStep {

	getDefaultStepConfig():StepConfig {
		return { force: true };
	}
 
    async process(event: Event, context: StepContext): Promise<void> {
        let logger = context.services.getLoggerProvider().getLogger("CrawlStep");
        if (paths.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}
        if (context.stepConfig?.force) {
            await this.crawlSource(event, context, logger);
        } else {
            await this.crawlStore(event, context, logger);
        }
    }

    async crawlSource(event: Event, context: StepContext, logger: ILogger): Promise<void> { 
        let loggerProvider = context.services.getLoggerProvider();
        let contentQueue = context.services.getQueueProvider().getContentQueue();
        
        let { basePath, sourcePath } = paths.parsePath(event.path);
        let source = context.services.getEnvironmentConfig().contentSource.find(x => x.basePath === basePath);
        if (!source) {
            logger.debug(`Cannot find source config in EnvironmentConfig for basePath: ${basePath}`)
			return;
        }
        let contentSource = context.services.getContentSourceProvider().get(source.type, source.options);
        if (sourcePath) {
            let sourceItem = await contentSource.get(sourcePath);
            if (sourceItem?.type === 'folder') {
                for await(let itemInFolder of contentSource.getAll(sourcePath)) {
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
        } else {
            for await(let itemInFolder of contentSource.getAll()) {
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
    }

    async crawlStore(event: Event, context: StepContext, logger: ILogger): Promise<void> {
        let loggerProvider = context.services.getLoggerProvider();
        let contentItemStore = context.services.getStoreProvider().getIndexStore();
        let contentQueue = context.services.getQueueProvider().getContentQueue();

        let { basePath, sourcePath } = paths.parsePath(event.path);
        if (sourcePath) {
            let contentItem = await contentItemStore.get(event.path);
            if (!contentItem)
                return;
    
            if (contentItem.type === 'folder') {
                let allPaths = await contentItemStore.getKeys();
                this.findDirectChildren(event.path, allPaths).forEach(async x => {
                    await contentQueue.push(
                        {
                            path: x,
                            parent: event,
                            traceId: loggerProvider.getTraceId(),
                            parentId: loggerProvider.getSpanId()
                        }
                    );
                });
            }
        }
        else {
            let allPaths = await contentItemStore.getKeys();
            this.findDirectChildren(event.path, allPaths).forEach(async x => {
                await contentQueue.push(
                    {
                        path: x,
                        parent: event,
                        traceId: loggerProvider.getTraceId(),
                        parentId: loggerProvider.getSpanId()
                    }
                );
            });
        }
    }

    findDirectChildren(path: string, allPaths: string[]): string[] {
        const directChildren: string[] = [];
        for (const p of allPaths) {
            if (p.startsWith(path + '/') && p.split('/').length === path.split('/').length + 1) {
                directChildren.push(p);
            }
        }
        return directChildren;
    }
}