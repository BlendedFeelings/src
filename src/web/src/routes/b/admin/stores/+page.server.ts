import { getSpans, type Span } from 'indexer';
import type { PageServerLoad } from './$types';

export const  load: PageServerLoad = (async (event) => {
    let environmentConfig = event.locals.services.getEnvironmentConfig();
    let stores = Object.keys(environmentConfig).filter(key => key.endsWith('Store'));
    return { stores: stores };
});
