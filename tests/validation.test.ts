import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone,
  parseRsvp,
  parseWish,
  publicWishes,
} from '../src/server/validation';
const base = {
  side: 'groom',
  name: 'Khách mời',
  phone: '+84 912 345 678',
  attending: true,
  count: 3,
  transport: 'bus',
};
test('phone formats resolve to one upsert key', () => {
  assert.equal(normalizePhone(base.phone), '0912345678');
  assert.equal(normalizePhone('0912-345-678'), '0912345678');
  assert.throws(() => normalizePhone('abc'));
});
test('bus seats equal count; bride and decline clear transport', () => {
  assert.equal(parseRsvp(base).busSeats, 3);
  assert.deepEqual(
    {
      ...parseRsvp({ ...base, side: 'bride' }),
      name: undefined,
      phone: undefined,
    },
    {
      side: 'bride',
      name: undefined,
      phone: undefined,
      attending: true,
      count: 3,
      transport: null,
      busSeats: 0,
    },
  );
  assert.equal(parseRsvp({ ...base, attending: false, count: 100 }).count, 0);
  assert.equal(parseRsvp({ ...base, attending: false }).busSeats, 0);
});
test('reject malformed route, count, transport and wish', () => {
  for (const patch of [
    { side: 'other' },
    { count: 1.5 },
    { count: 0 },
    { transport: 'boat' },
  ])
    assert.throws(() => parseRsvp({ ...base, ...patch }));
  assert.throws(() => parseWish({ side: 'bride', name: 'X', message: ' ' }));
});
test('public wishes only approved side, and no private properties', () => {
  assert.deepEqual(
    publicWishes(
      [
        {
          side: 'bride',
          name: 'A',
          message: 'M',
          status: 'approved',
          phone: 'private',
        },
        { side: 'groom', name: 'B', message: 'N', status: 'approved' },
        { side: 'bride', name: 'C', message: 'O', status: 'pending' },
      ],
      'bride',
    ),
    [{ name: 'A', message: 'M' }],
  );
});
