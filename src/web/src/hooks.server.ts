import type { Handle } from '@sveltejs/kit';
import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/core/providers/github"
import { dev } from '$app/environment';
import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { WebServices } from '$lib/webServices';

var B_GITHUB_ID = process.env.B_GITHUB_ID
var B_GITHUB_SECRET = process.env.B_GITHUB_SECRET
var B_AUTH_SECRET = process.env.B_AUTH_SECRET
var B_ADMIN = process.env.B_ADMIN

var admins = (B_ADMIN || '').split(',');

if (dev) {
	let services = new WebServices();
	let loggerProvider = services.getLoggerProvider();
	loggerProvider.setSpanName('indexer');
	let indexer = services.getIndexer();
	indexer.startIndexing();
}

var init: Handle = async ({ event, resolve }) => {
	let services = new WebServices();
	event.locals.services = services
	let loggerProvider = services.getLoggerProvider();
	loggerProvider.setSpanName(event.url.toString());
	loggerProvider.setAttribute('type', 'web');
	let logger = loggerProvider.getLogger('hooks.server.ts');
	logger.debug('Request started: ' + event.request.url)
	let response = await resolve(event);
	logger.debug('Request finished' + event.request.url)
	return response;
};
var authentication: Handle = async ({ event, resolve }) => {
	const session = await event.locals.getSession();
	event.locals.userid = session?.user?.email;
	event.locals.isAdmin = event.locals.userid != undefined && event.locals.userid != null && admins.includes(event.locals.userid);
	if (event.url.pathname.startsWith("/b/admin")) {
		if (!session) {
			throw redirect(303, "/b");
		}
		if (event.locals.isAdmin == false) {
			throw redirect(303, "/b");
		}
	}
	// If the request is still here, just proceed as normally
	return resolve(event);
}

export const handle: Handle = sequence(init, SvelteKitAuth(async (event) => {	
	const authOptions = {
		providers: [GitHub({ 
			clientId: B_GITHUB_ID, 
			clientSecret: B_GITHUB_SECRET,
			 })],
		secret: B_AUTH_SECRET,
		trustHost: true,
	  }
	return authOptions
	
}), authentication);
