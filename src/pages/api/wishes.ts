import type { APIRoute } from 'astro';
import { parseWish, parseSide, publicWishes } from '../../server/validation';
import { sheets } from '../../server/sheets';
import { json, readPayload, failure } from '../../server/http';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  try {
    await sheets('wish', parseWish(await readPayload(request)));
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
};
export const GET: APIRoute = async ({ url }) => {
  try {
    const side = parseSide(url.searchParams.get('side'));
    const rows = await sheets('wishes', { side });
    return json(publicWishes(rows, side), 200, {
      'Cache-Control': 'public, max-age=0, s-maxage=60',
    });
  } catch (error) {
    return failure(error);
  }
};
