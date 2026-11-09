/**
 * O&M — שמירת אישורי הגעה בגוגל שיטס.
 * מדביקים את הקובץ הזה ב: Google Sheet ← הרחבות ← Apps Script.
 * שנו את ADMIN_KEY לסיסמה משלכם — היא נדרשת כדי לצפות ברשימת המוזמנים.
 */
const ADMIN_KEY = 'change-me';
const SHEET_NAME = 'אישורי הגעה';
const HEADERS = ['תאריך', 'שם מלא', 'טלפון', 'מגיעים', 'כמות', 'הערה'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
    sh.getRange('C:C').setNumberFormat('@'); // שמירה על 0 בתחילת הטלפון
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// מונע הזרקת נוסחאות לגיליון
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const name = clean_(d.name, 80);
    const phone = String(d.phone || '').replace(/[^\d]/g, '').slice(0, 15);
    if (!name || phone.length < 9) return json_({ ok: false, error: 'missing' });

    const attending = d.attending === 'no' ? 'לא' : 'כן';
    const count = attending === 'כן' ? Math.max(1, Math.min(30, parseInt(d.count, 10) || 1)) : 0;
    const note = clean_(d.note, 500);
    const row = [new Date(), name, phone, attending, count, note];

    const sh = sheet_();
    const last = sh.getLastRow();
    if (last > 1) {
      const phones = sh.getRange(2, 3, last - 1, 1).getDisplayValues();
      for (let i = 0; i < phones.length; i++) {
        if (String(phones[i][0]).replace(/[^\d]/g, '') === phone) {
          sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
          return json_({ ok: true, updated: true });
        }
      }
    }
    sh.appendRow(row);
    return json_({ ok: true, updated: false });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (!e.parameter || e.parameter.key !== ADMIN_KEY) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, rows: [] });
  const values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const rows = values.map(r => ({
    time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: String(r[1]).replace(/^'/, ''),
    phone: String(r[2]),
    attending: r[3] === 'לא' ? 'no' : 'yes',
    count: Number(r[4]) || 0,
    note: String(r[5]).replace(/^'/, '')
  }));
  return json_({ ok: true, rows: rows });
}
