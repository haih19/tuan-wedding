import type { APIRoute } from 'astro';
import { parseRsvp } from '../../server/validation';
import { sheets } from '../../server/sheets';
import { json, readPayload, failure } from '../../server/http';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = parseRsvp(await readPayload(request));
    await sheets('rsvp', payload);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
};
