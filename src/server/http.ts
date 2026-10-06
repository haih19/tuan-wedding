import { InputError } from './validation';
import { StorageError } from './sheets';
export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}
export async function readPayload(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new InputError('Nguồn gửi không hợp lệ.');
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new InputError('Dữ liệu không hợp lệ.');
  const body = await request.text();
  if (body.length > 6000) throw new InputError('Dữ liệu quá dài.');
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new InputError('Dữ liệu không hợp lệ.');
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    payload.website
  )
    throw new InputError('Dữ liệu không hợp lệ.');
  return payload as Record<string, unknown>;
}
export function failure(error: unknown) {
  if (error instanceof InputError) return json({ error: error.message }, 400);
  if (error instanceof StorageError) return json({ error: error.message }, 503);
  return json({ error: 'Chưa xử lý được yêu cầu. Bạn vui lòng thử lại.' }, 500);
}
