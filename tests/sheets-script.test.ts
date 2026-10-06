import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function setup() {
  const rows = new Map<string, unknown[][]>();
  let held = false,
    locks = 0;
  const book = {
    getId: () => 'test-sheet',
    getSheetByName: (name: string) => {
      const data = rows.get(name);
      if (!data) return null;
      return {
        getLastRow: () => data.length,
        appendRow: (row: unknown[]) => data.push(row),
        setFrozenRows: () => {},
        getDataRange: () => ({ getValues: () => data.map((row) => [...row]) }),
        getRange: (row: number | string) => ({
          setNumberFormat: () => {},
          setValues: (values: unknown[][]) => {
            if (!held) throw new Error('write without lock');
            data[Number(row) - 1] = values[0];
          },
        }),
      };
    },
    insertSheet: (name: string) => {
      rows.set(name, []);
      return book.getSheetByName(name);
    },
  };
  const cache = new Map();
  const context = vm.createContext({
    SpreadsheetApp: {
      getActiveSpreadsheet: () => book,
      openById: () => book,
      flush: () => {},
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (value: string) => ({ setMimeType: () => value }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: () => 'test-secret',
        setProperty: () => {},
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {
          held = true;
          locks++;
        },
        hasLock: () => held,
        releaseLock: () => {
          held = false;
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key: string) => cache.get(key),
        put: (key: string, value: string) => cache.set(key, value),
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha' },
      computeDigest: (_type: string, text: string) => text,
      base64EncodeWebSafe: (text: string) =>
        Buffer.from(text).toString('base64'),
    },
    Date,
    JSON,
    Number,
    String,
    Error,
  });
  vm.runInContext(
    readFileSync('integrations/sheets-script.js', 'utf8'),
    context,
  );
  vm.runInContext('setupSheets()', context);
  const send = (action: string, payload: unknown, secret = 'test-secret') =>
    JSON.parse(
      context.doPost({
        postData: { contents: JSON.stringify({ secret, action, payload }) },
      }),
    );
  return { rows, send, cache, locks: () => locks, held: () => held };
}
test('Sheets RSVP upserts phone and side under lock, retains created timestamp', () => {
  const db = setup(),
    input = {
      side: 'groom',
      name: 'A',
      phone: '0912345678',
      attending: true,
      count: 2,
      transport: 'bus',
    };
  assert.equal(db.send('rsvp', input).ok, true);
  const created = db.rows.get('Groom RSVP')![1][6];
  db.cache.clear();
  assert.equal(
    db.send('rsvp', { ...input, name: 'Updated', count: 4 }).ok,
    true,
  );
  assert.equal(db.rows.get('Groom RSVP')!.length, 2);
  assert.equal(db.rows.get('Groom RSVP')![1][5], 4);
  assert.equal(db.rows.get('Groom RSVP')![1][6], created);
  assert.equal(db.send('rsvp', { ...input, side: 'bride' }).ok, true);
  assert.equal(db.rows.get('Bride RSVP')![1][5], 0);
  assert.equal(db.locks(), 3);
  assert.equal(db.held(), false);
});
test('wish retries deduplicate, pending stays private, approval filters by side', () => {
  const db = setup(),
    input = { side: 'bride', name: 'A', message: 'Chúc mừng' };
  db.send('wish', input);
  db.send('wish', input);
  assert.equal(db.rows.get('Wishes')!.length, 2);
  assert.deepEqual(db.send('wishes', { side: 'bride' }).data, []);
  db.rows.get('Wishes')![1][4] = 'approved';
  assert.equal(db.send('wishes', { side: 'bride' }).data.length, 1);
  assert.deepEqual(db.send('wishes', { side: 'groom' }).data, []);
  assert.equal(db.send('rsvp', {}, 'wrong').ok, false);
  assert.equal(db.held(), false);
});
test('spreadsheet formula input becomes literal text', () => {
  const db = setup();
  db.send('wish', {
    side: 'groom',
    name: '=IMPORTXML("url")',
    message: '+formula',
  });
  assert.equal(db.rows.get('Wishes')![1][2], '\'=IMPORTXML("url")');
  assert.equal(db.rows.get('Wishes')![1][3], "'+formula");
});
