export class StorageError extends Error {}
export async function sheets(action: string, payload: unknown) {
  const url = import.meta.env.SHEETS_SCRIPT_URL,
    secret = import.meta.env.SHEETS_SCRIPT_SECRET;
  if (!url || !secret)
    throw new StorageError(
      'Gia đình chưa mở đăng ký trực tuyến. Bạn vui lòng liên hệ trực tiếp.',
    );
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, action, payload }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (!result.ok) throw new Error();
    return result.data;
  } catch {
    throw new StorageError(
      'Chưa nhận được xác nhận lưu. Bạn vui lòng gửi lại sau ít phút.',
    );
  }
}
