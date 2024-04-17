import { json } from '@sveltejs/kit'
import { fail, redirect, error  } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type {  StepConfig } from 'indexer'

export const GET: RequestHandler = async (event) => {
  let steps = event.locals.services.getIndexer().getDefaultStepsConfig();
  return json({ steps });
}

export const POST: RequestHandler = async (event) => {
    if (!event.locals.isAdmin)
        throw error(403 , { message: 'Access Denied' });
    const data = await event.request.json();
    let indexer = event.locals.services.getIndexer();
    await indexer.queue({path: data.path, steps: data.steps});
    return json({})
}