/* Paste into a spreadsheet-bound Google Apps Script project.
 * Script properties: SHARED_SECRET. Run setupSheets once, then deploy as web app.
 * Execute as yourself, access Anyone; requests are authenticated with a server-only secret.
 */
const RSVP_HEADERS = [
  'phone',
  'name',
  'attending',
  'count',
  'transport',
  'busSeats',
  'createdAt',
  'updatedAt',
];
const WISH_HEADERS = ['id', 'side', 'name', 'message', 'status', 'createdAt'];
function setupSheets() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty(
    'SPREADSHEET_ID',
    book.getId(),
  );
  for (const [name, headers] of [
    ['Bride RSVP', RSVP_HEADERS],
    ['Groom RSVP', RSVP_HEADERS],
    ['Wishes', WISH_HEADERS],
  ]) {
    let sheet = book.getSheetByName(name);
    if (!sheet) sheet = book.insertSheet(name);
    if (!sheet.getLastRow()) sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('@');
  }
}
function output(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function safeCell(value) {
  return /^[=+@-]/.test(String(value)) ? "'" + value : value;
}
function doPost(e) {
  let lock;
  try {
    const request = JSON.parse(e.postData.contents);
    const secret =
      PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || request.secret !== secret) return output({ ok: false });
    const payload = request.payload || {};
    if (!['bride', 'groom'].includes(payload.side)) throw new Error('side');
    const book = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
    );
    if (request.action === 'wishes') {
      const sheet = book.getSheetByName('Wishes');
      const rows = sheet.getDataRange().getValues().slice(1);
      return output({
        ok: true,
        data: rows
          .filter((row) => row[1] === payload.side && row[4] === 'approved')
          .slice(-100)
          .map((row) => ({
            side: row[1],
            name: row[2],
            message: row[3],
            status: row[4],
          })),
      });
    }
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const now = new Date().toISOString();
    const cache = CacheService.getScriptCache();
    if (request.action === 'rsvp') {
      if (
        !/^0[35789]\d{8}$/.test(payload.phone) ||
        typeof payload.name !== 'string' ||
        !payload.name.trim() ||
        payload.name.length > 80 ||
        typeof payload.attending !== 'boolean'
      )
        throw new Error('invalid');
      if (
        payload.attending &&
        (!Number.isInteger(payload.count) ||
          payload.count < 1 ||
          payload.count > 20)
      )
        throw new Error('count');
      const throttle = 'rsvp:' + payload.side + ':' + payload.phone;
      if (cache.get(throttle)) throw new Error('rate');
      const sheet = book.getSheetByName(
        payload.side === 'bride' ? 'Bride RSVP' : 'Groom RSVP',
      );
      const rows = sheet.getDataRange().getValues();
      const index = rows.findIndex(
        (row, i) => i > 0 && String(row[0]) === payload.phone,
      );
      const count = payload.attending ? payload.count : 0;
      const transport =
        payload.side === 'groom' && payload.attending ? payload.transport : '';
      if (transport && !['bus', 'self'].includes(transport))
        throw new Error('transport');
      const row = [
        payload.phone,
        safeCell(payload.name),
        payload.attending,
        count,
        transport,
        transport === 'bus' ? count : 0,
        index >= 0 ? rows[index][6] : now,
        now,
      ];
      if (index >= 0)
        sheet.getRange(index + 1, 1, 1, row.length).setValues([row]);
      else sheet.appendRow(row);
      SpreadsheetApp.flush();
      cache.put(throttle, '1', 2);
      return output({ ok: true, data: { saved: true } });
    }
    if (request.action === 'wish') {
      if (
        typeof payload.name !== 'string' ||
        !payload.name.trim() ||
        payload.name.length > 80 ||
        typeof payload.message !== 'string' ||
        !payload.message.trim() ||
        payload.message.length > 1000
      )
        throw new Error('invalid');
      // Identical retries deduplicate for 6 hours. Moderation controls public visibility.
      const digest = Utilities.base64EncodeWebSafe(
        Utilities.computeDigest(
          Utilities.DigestAlgorithm.SHA_256,
          JSON.stringify([payload.side, payload.name, payload.message]),
        ),
      );
      const key = 'wish:' + digest;
      const sheet = book.getSheetByName('Wishes');
      const existing = sheet
        .getDataRange()
        .getValues()
        .slice(1)
        .some((row) => row[0] === digest);
      if (!existing) {
        const throttle = 'wish-name:' + payload.side + ':' + payload.name;
        if (cache.get(throttle)) throw new Error('rate');
        sheet.appendRow([
          digest,
          payload.side,
          safeCell(payload.name),
          safeCell(payload.message),
          'pending',
          now,
        ]);
        SpreadsheetApp.flush();
        cache.put(throttle, '1', 10);
      }
      cache.put(key, '1', 21600);
      return output({ ok: true, data: { saved: true } });
    }
    throw new Error('action');
  } catch (error) {
    return output({ ok: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
