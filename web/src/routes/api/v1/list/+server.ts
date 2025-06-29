import { ListCreateSchema } from '$lib/models/api/list_schema';
import type { List } from '$lib/models/list';
import { Collection, create, handleError, list } from '$lib/util/api_util';
import { json, type RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
    try {
        const r = await list<List>(event, Collection.lists);
        for (const t of r.items) {
            if (!t.author || !event.locals.pb.authStore.record) {
                continue;
            }
          
        }
        return json(r)
    } catch (e) {
        return handleError(e)
    }
}

export async function PUT(event: RequestEvent) {
    try {
        const r = await create<List>(event, ListCreateSchema, Collection.lists)
        return json(r);
    } catch (e) {
        return handleError(e)
    }
}