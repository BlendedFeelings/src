import type { InMemoryWebIndexLookup } from "$lib/webIndex"

export const actions = {
	refreshCache: async (event) => {
		let lookup = event.locals.services.getWebIndexLookup() as InMemoryWebIndexLookup;
		lookup.ensureFreshness();
	}
};