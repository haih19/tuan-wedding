import type { Side } from '../types/wedding';
export class InputError extends Error {}
export function parseSide(value: unknown): Side {
  if (value !== 'bride' && value !== 'groom')
    throw new InputError('Lời mời không hợp lệ.');
  return value;
}
export function normalizePhone(value: unknown) {
  if (typeof value !== 'string')
    throw new InputError('Bạn vui lòng nhập số điện thoại.');
  let phone = value.replace(/[\s().-]/g, '');
  if (phone.startsWith('+84')) phone = '0' + phone.slice(3);
  else if (phone.startsWith('84')) phone = '0' + phone.slice(2);
  if (!/^0[35789]\d{8}$/.test(phone))
    throw new InputError('Số điện thoại Việt Nam chưa hợp lệ.');
  return phone;
}
function text(value: unknown, max: number, label: string) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new InputError(`${label} chưa hợp lệ.`);
  return value.trim();
}
export function parseRsvp(value: Record<string, unknown>) {
  const side = parseSide(value.side),
    name = text(value.name, 80, 'Tên'),
    phone = normalizePhone(value.phone);
  if (typeof value.attending !== 'boolean')
    throw new InputError('Bạn vui lòng chọn tham dự hay không.');
  const attending = value.attending;
  let count = 0,
    transport: 'bus' | 'self' | null = null;
  if (attending) {
    if (
      typeof value.count !== 'number' ||
      !Number.isInteger(value.count) ||
      value.count < 1 ||
      value.count > 20
    )
      throw new InputError('Số người tham dự phải từ 1 đến 20.');
    count = value.count;
    if (side === 'groom') {
      if (value.transport !== 'bus' && value.transport !== 'self')
        throw new InputError('Bạn vui lòng chọn cách di chuyển.');
      transport = value.transport;
    }
  }
  return {
    side,
    name,
    phone,
    attending,
    count,
    transport,
    busSeats: transport === 'bus' ? count : 0,
  };
}
export function parseWish(value: Record<string, unknown>) {
  return {
    side: parseSide(value.side),
    name: text(value.name, 80, 'Tên'),
    message: text(value.message, 1000, 'Lời chúc'),
  };
}
export function publicWishes(rows: Record<string, unknown>[], side: Side) {
  return rows
    .filter(
      (row) =>
        row.side === side &&
        row.status === 'approved' &&
        typeof row.name === 'string' &&
        typeof row.message === 'string',
    )
    .map((row) => ({
      name: row.name as string,
      message: row.message as string,
    }))
    .slice(-100)
    .reverse();
}
