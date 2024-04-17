import { getSpans, type Span } from 'indexer';

type Data = {
    spans: Span[];
}

export const  load = (async (event):Promise<Data> => {
    let spans = getSpans();
    return { spans: spans };
});
