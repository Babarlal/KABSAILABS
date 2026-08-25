/**
 * Receiver for the /audit booking page lead POST.
 *
 * THIS FILE DOES NOT RUN FROM THE REPO. It is a reference copy of the
 * Google Apps Script bound to the "KABS audit leads" spreadsheet. The
 * live version lives in the Apps Script editor at script.google.com.
 * Edit there, redeploy, then mirror the change back here.
 *
 * Sheet:      "KABS audit leads", tab "Leads"
 * Header row: Timestamp, Name, Email, Mobile, Industry, Task, Source, Page
 * Deploy as:  Web app, execute as Me, access Anyone
 * Deployed:   AKfycbyFP-P9I80X_QE02eQ8i4SioyqVlTeV36wEdbeF1V7Se3G2k4OE6zb4zk5El53b7-V9
 *
 * The page posts with mode 'no-cors' and Content-Type text/plain, so the
 * browser cannot read this reply. A new row and the alert email are the
 * only proof it worked. The text/plain content type is deliberate:
 * application/json is not CORS safelisted and would be rejected in
 * no-cors mode, while e.postData.contents still carries the JSON body.
 *
 * Redeploying under a new version mints a NEW /exec URL. If you do that,
 * update WEBHOOK_URL in audit.html to match or leads stop arriving.
 */

var NOTIFY_EMAIL = 'babarlal17@gmail.com';

function doPost(e){
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try{
    var d = JSON.parse(e.postData.contents);
    SpreadsheetApp.getActive().getSheetByName('Leads').appendRow(
      [new Date(), d.name||'', d.email||'', d.mobile||'', d.industry||'', d.task_time_sink||'', d.source||'', d.page_url||'']);
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New audit lead: ' + (d.name||'unknown'),
      body: 'Name: '+(d.name||'')+'\nEmail: '+(d.email||'')+'\nMobile: '+(d.mobile||'')+
            '\nIndustry: '+(d.industry||'')+'\nBiggest time sink: '+(d.task_time_sink||'')+
            '\nSource: '+(d.source||'')+'\nPage: '+(d.page_url||'')
    });
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}
