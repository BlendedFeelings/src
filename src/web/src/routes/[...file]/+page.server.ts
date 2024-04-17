import { fail, redirect, error  } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { View } from '$lib/content/ContentService'

export const  load = (async (event) => {
	let path = event.params.file;
	let view = event.url.searchParams.get('v') as View;
	let page = event.url.searchParams.get('p');
	let query = event.url.searchParams.get('q');
	let contentService =  event.locals.services.getContentService();
	return contentService.getContent({
		path: path,
		view: view,
		page: page,
		query: query
	});

}) satisfies PageServerLoad;

export const actions = {
	index: async (event) => {
		if (!event.locals.isAdmin)
			throw error(403 , { message: 'Access Denied' });
		const steps = await event.request.json();
		let indexer = event.locals.services.getIndexer();
        await indexer.queue({path: event.params.file, steps: steps});
    }
} satisfies Actions;
