import { json } from '@sveltejs/kit'
import { fail, redirect, error  } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type {  StepConfig } from 'indexer'

export const GET: RequestHandler = async (event) => {
  if (!event.locals.isAdmin)
        throw error(403 , { message: 'Access Denied' });
  let steps:{ [name: string]: StepConfig } = event.locals.services.getIndexer().getDefaultStepsConfig();
  return json({ steps: steps });
}
