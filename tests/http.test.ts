import test from 'node:test';
import assert from 'node:assert/strict';
import { readPayload, failure } from '../src/server/http';
import { InputError } from '../src/server/validation';
test('request boundary rejects foreign origin, non-JSON, oversized input and honeypot', async () => {
  const cases: RequestInit[] = [
    {
      headers: {
        origin: 'https://other.test',
        'content-type': 'application/json',
      },
      body: '{}',
    },
    { headers: { 'content-type': 'text/plain' }, body: '{}' },
    { headers: { 'content-type': 'application/json' }, body: 'x'.repeat(6001) },
    {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ website: 'spam' }),
    },
  ];
  for (const options of cases)
    await assert.rejects(
      readPayload(
        new Request('https://wedding.test/api/rsvp', {
          method: 'POST',
          ...options,
        }),
      ),
    );
});
test('errors expose usable messages without private exception details', async () => {
  const response = failure(new Error('private secret stack'));
  assert.equal(response.status, 500);
  assert.ok(!(await response.text()).includes('private'));
  const invalid = failure(new InputError('Tên chưa hợp lệ'));
  assert.equal(invalid.status, 400);
});
