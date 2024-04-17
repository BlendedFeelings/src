import {type  IStep, Event, StepContext, StepConfig } from '.'
import { WebIndexItem } from '../content';
import { IStore } from '../store';
import * as paths from '../path'


export class WebIndexStep implements IStep{
	
	getDefaultStepConfig():StepConfig {
		return {};
	}
	
    async process(event: Event, context: StepContext): Promise<void> {
		let logger = context.services.getLoggerProvider().getLogger("WebIndexStep");
		let includeScore = context.services.getStoreProvider().getIncludesStore();
		let webIndexStore = context.services.getStoreProvider().getWebIndexStore();

		if (paths.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}
		let indexItem = await context.services.getStoreProvider().getIndexStore().get(event.path);
		if (!indexItem) {
            logger.debug('IndexItem does not exist. Skipping indexing')
			return;
		}
	
		let includesItem = await includeScore.get(event.path);
		let webIndexItem = (await webIndexStore.get(event.path)) || {};	
		webIndexItem.indexItem = indexItem;
		webIndexItem.title = indexItem?.title;
		webIndexItem.includesItem = includesItem;
		if (!webIndexItem.incrementalID) {
			logger.debug('incrementalID is not assigned to WebIndexItem.');
			let incrementalID = await webIndexStore.getTags(event.path, ['incrementalID'])['incrementalID'];
			if (incrementalID) {
				logger.debug('Use incrementalID from tags.');
				webIndexItem.incrementalID = incrementalID;
			} else {
				logger.debug('Generate new Id.');
				incrementalID = await this.generateNextId(webIndexStore);
				await webIndexStore.setTags(event.path, {incrementalID:incrementalID, type:indexItem?.type});
				webIndexItem.incrementalID = incrementalID;
			}
		}
		await webIndexStore.set(event.path, webIndexItem);
    }

	async generateNextId(contentWebStore:IStore<WebIndexItem>):Promise<string> {
		let pathToId = await contentWebStore.getAllTags(['incrementalID']);
		let ids = Object.keys(pathToId).map(x => Number(pathToId[x]['incrementalID']));
		if (ids.length === 0)
			return "1";
        return (Math.max(...ids) + 1).toString();

	}
  }
  