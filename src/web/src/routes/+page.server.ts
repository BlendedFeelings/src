import { fail, redirect, error  } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { View } from '$lib/content/ContentService'

export const load = (async (event) => {
	let path = null;
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