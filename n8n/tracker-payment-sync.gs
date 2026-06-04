/**
 * Forge — Tracker sheet → App payment sync (Google Apps Script)
 * ============================================================
 * When someone MANUALLY changes a payment cell in the student tracker sheet,
 * this instantly pushes the new payment status to the app, so access updates
 * 24/7 with no polling.
 *
 * SETUP (one time):
 *   1. Open the tracker sheet → Extensions → Apps Script.
 *   2. Paste this whole file.
 *   3. Adjust the CONFIG below to match your sheet's headers / tab name.
 *   4. Run `installTrigger` once → authorize when prompted.
 *      (This creates an INSTALLABLE onEdit trigger — a simple onEdit can't call URLs.)
 *   5. Done. Edit a Payment cell → the app updates within ~1–2 seconds.
 *
 * Requires the `sync-payment-status` edge function to be deployed on the app.
 */

// ── CONFIG — adjust to match your sheet ──────────────────────────────────────
var SYNC_URL      = 'https://tprvyhzpecopryylxznm.supabase.co/functions/v1/sync-payment-status';
var FORGE_SECRET  = 'forge123';
var WATCH_TAB     = 'Student Master';                 // tab to watch ('' = all tabs)
var EMAIL_HEADERS   = ['Email', 'Email Address', 'email'];
var PAYMENT_HEADERS = ['Payment', 'Payment Status', 'Payment status', 'Status'];
// ─────────────────────────────────────────────────────────────────────────────

// Classify a raw payment cell → the app's status enum.
function classifyPayment(raw) {
  var v = String(raw || '').toLowerCase();
  if (/balance|full|completed|50000|50,000|paid in full/.test(v)) return 'BALANCE_PAID';
  if (/15k|15000|deposit|confirmed|advance|token|booking|slot/.test(v)) return 'CONFIRMED_15K';
  return null; // unrecognised → don't sync
}

function colIndex_(headers, names) {
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).trim().toLowerCase();
    for (var j = 0; j < names.length; j++) {
      if (names[j].toLowerCase() === h) return i + 1;
    }
  }
  return -1;
}

// INSTALLABLE onEdit handler — fires on every manual edit.
function onPaymentEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (WATCH_TAB && sheet.getName() !== WATCH_TAB) return;

    var headers  = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var emailCol = colIndex_(headers, EMAIL_HEADERS);
    var payCol   = colIndex_(headers, PAYMENT_HEADERS);
    if (emailCol < 1 || payCol < 1) return;

    // Only react to edits in the Payment column.
    if (e.range.getColumn() !== payCol) return;
    var row = e.range.getRow();
    if (row < 2) return; // skip header

    var email  = String(sheet.getRange(row, emailCol).getValue()).trim().toLowerCase();
    var status = classifyPayment(sheet.getRange(row, payCol).getValue());
    if (!email || email.indexOf('@') < 0 || !status) return;

    UrlFetchApp.fetch(SYNC_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-forge-secret': FORGE_SECRET },
      payload: JSON.stringify({ email: email, payment_status: status }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error('onPaymentEdit error: ' + err);
  }
}

// Run ONCE to install the trigger.
function installTrigger() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onPaymentEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onPaymentEdit').forSpreadsheet(ss).onEdit().create();
}
