import {type  IStep, Event, StepContext, StepConfig } from '.'
import { IncludesItem } from '../content';
import { fetch } from '../fetch';
import * as path from '../path'

export class IncludesStep implements IStep {
	
	getDefaultStepConfig():StepConfig {
		return {};
	}
	
    async process(event: Event, context: StepContext): Promise<void> {
		let logger = context.services.getLoggerProvider().getLogger('includesStep');
		let includesStore = context.services.getStoreProvider().getIncludesStore();
		let indexStore = context.services.getStoreProvider().getIndexStore();
		
		if (path.isPrivate(event.path)) {
            logger.debug('Path is private. Skipping indexing')
			return;
		}

		let indexItem = await indexStore.get(event.path);
		if (!indexItem?.content) {
            logger.debug('IndexItem does not exist or its content is empty. Skipping indexing')
			return;
		}
		
		let includesItem:IncludesItem = {includes: []};
		let lines = indexItem?.content.split('\n');
		let insideCodeBlock = false;
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.startsWith('```')) {
				insideCodeBlock = !insideCodeBlock;
				continue
			}
			if (insideCodeBlock) {
				// fine in line regex expression \[!INCLUDE (.*)\]
				var matches = line.match(/\[!INCLUDE (.*)\]/);
				if (matches) {
					let includePath = matches[1];
					if (await includesStore.exist([includePath])[0])
						continue;

					logger.debug('includePath: ' + includePath)
					if (includePath.startsWith('https://github.com/')) {
						let githubusercontent = this.convertGithubToGithubusercontent(includePath);
						if (!githubusercontent)
							continue;
						logger.debug('githubusercontent: ' + githubusercontent)
						let response = await fetch(githubusercontent);
						if (!response.ok) {
							logger.error('Failed to fetch include: ' + includePath + ' Response Status: ' + response.statusText);
							continue;
						}
						let includeContent = await response.text();
						logger.debug('includeContent: ' + includeContent)
						includesItem.includes.push({path: includePath, content: includeContent});
					}
				}
			}
		}
		if (includesItem.includes.length > 0)
			await includesStore.set(event.path, includesItem);
		
    }

	convertGithubToGithubusercontent(githubUrl) {
		const regex = /^https:\/\/github\.com\/(.*)\/(.*)\/blob\/(.*)$/;
		const match = githubUrl.match(regex);
		if (match) {
		  const [, username, repo, path] = match;
		  return `https://raw.githubusercontent.com/${username}/${repo}/${path}`;
		}
		return null;
	  }
}
  