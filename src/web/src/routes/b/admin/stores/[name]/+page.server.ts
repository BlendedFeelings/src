import { getSpans, type Span } from 'indexer';
import type { PageServerLoad } from './$types';

export const  load: PageServerLoad = (async (event) => {
    let storeName = event.params.name;
    let key = event.url.searchParams.get('key');
    if (!key)
        return { storeName: storeName}

    let storeProvider = event.locals.services.getStoreProvider();
    let store = storeProvider.get(storeName);
    let value = store.get(key);
    return {
        storeName: storeName, 
        key: key,
        value: value
    }
});
