import {type  IStep, Event, StepContext, StepConfig } from '.'
import { ContentSourceItem, IContentSource } from '../contentSource'
import { createHash } from 'node:crypto'
import * as paths from '../path'
import { EnvironmentConfigSource } from '../config';

export class IndexStep implements IStep{

	getDefaultStepConfig():StepConfig {
		return {};
	}
	
    async process(event: Event, context: StepContext): Promise<void> {
		let logger = context.services.getLoggerProvider().getLogger("IndexStep");

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
		if (!sourcePath) {
            logger.debug('Source path does not exist. Skipping indexing')
			return;
		}
		let sourceItem = await contentSource.get(sourcePath);
		if (!sourceItem) {
            logger.debug('Source item does not exist. Skipping indexing')
			return;
		}
		if (sourceItem.type === 'file') {
			await this.index_file(sourceItem, contentSource, source, event, context);
		} else {
			await this.index_folder(sourceItem, contentSource, source, event, context);
		}
    }

    async index_file(file:ContentSourceItem, contentSource:IContentSource, source:EnvironmentConfigSource, event:Event, context: StepContext) {
		let logger = context.services.getLoggerProvider().getLogger("IndexStep");
		let indexStore = context.services.getStoreProvider().getIndexStore();
		let indexItem = await indexStore.get(event.path);
		let getContent = () => contentSource.getContent(file);
		if (file.sha && file.sha == indexItem?.sha)
			getContent = () => Promise.resolve(Buffer.from(indexItem?.content || '', 'utf8'))
		
		let contentExtractor = context.services.getContentExtractor();
		let { contentRaw, title, tags, urls } = await contentExtractor.extract(file.path, getContent );
		let sha:string|null = null;
		if (file.sha)
			sha = file.sha;
		else if (contentRaw)
			sha = createHash('sha256').update(contentRaw).digest('hex');

		if (context.stepConfig?.force !== true &&
			indexItem &&
			indexItem.sha === sha) {
			logger.debug('File alredy indexed. Skipping indexing')
			return;
		}

		indexItem = {
			path: event.path,
			type: file.type,
			title: title,
			content: contentRaw,
			sourceType: source.type,
			sourceUri: file.uri,
			sourcePath: file.path,
			sha: sha
		}
		await indexStore.set(event.path, indexItem);
	}

	async index_folder(folder:ContentSourceItem, contentSource:IContentSource, source:EnvironmentConfigSource, event:Event, context: StepContext) {
		let logger = context.services.getLoggerProvider().getLogger("IndexStep");
		let indexStore = context.services.getStoreProvider().getIndexStore();
		let indexItem = await indexStore.get(event.path);

		if (context.stepConfig?.force !== true &&
			indexItem) {
			logger.debug('Folder alredy indexed. Skipping indexing')
			return;
		}

		indexItem = {
			path: folder.path,
			type: folder.type,
			title: null,
			content: null,
			sourceType: source.type,
			sourceUri: folder.uri,
			sourcePath: folder.path,
			sha: null
		};
		await indexStore.set(event.path, indexItem);
	}

  }
  