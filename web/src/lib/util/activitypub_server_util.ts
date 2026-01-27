import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';

import type { Actor } from '$lib/models/activitypub/actor';
import { isRemoteHandle } from '$lib/util/activitypub_util';

type GetActorOptions = {
    follows?: boolean;
};

type ActorResponse = {
    actor: Actor;
    error?: string | null;
};

export async function getActorResponseForHandle(event: RequestEvent, handle: string, options: GetActorOptions = {}): Promise<ActorResponse> {
    const origin = env.ORIGIN!;
    const remoteHandle = isRemoteHandle(handle, origin);
    const searchParams = new URLSearchParams();
    if (options.follows) {
        searchParams.set("follows", "true");
    }
    const query = searchParams.toString();

    try {
        const encodedHandle = encodeURIComponent(handle);
        const response: ActorResponse = await event.locals.pb.send(
            `/activitypub/actor?resource=acct:${encodedHandle}${query ? `&${query}` : ""}`,
            { method: "GET", fetch: event.fetch },
        );
        return response;
    } catch (e) {
        if (remoteHandle && !event.locals.user && e instanceof ClientResponseError && e.status === 404) {
            throw new ClientResponseError({ status: 401, response: { message: "Unauthorized" } });
        }
        throw e;
    }
}
