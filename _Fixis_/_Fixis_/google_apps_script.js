/**
 * Google Apps Script - Version 5 (Direct & Debug Mode)
 */

function testWriting() {
  const e = {
    parameter: {
      name: "Manual Test",
      email: "test@example.com",
      subject: "Debugging",
      message: "This is a direct test row"
    }
  };
  doPost(e);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheetName = 'Form Responses';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      throw new Error("Cannot find Active Spreadsheet. Make sure this script is created via Extensions > Apps Script inside your sheet.");
    }
    
    let sheet = ss.getSheetByName(sheetName);

    // DEBUG: If sheet is not found, try to find it via enumeration
    if (!sheet) {
      console.error("Sheet NOT found: '" + sheetName + "'");
      const allSheets = ss.getSheets();
      const names = allSheets.map(s => s.getName());
      console.log("Sheets available in this file: " + names.join(", "));
      
      // Fallback: If there's only one sheet, just use that
      if (allSheets.length === 1) {
        sheet = allSheets[0];
        console.log("Only one sheet found, using: " + sheet.getName());
      } else {
        return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: 'Sheet "' + sheetName + '" not found. Available: ' + names.join(", ") })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const lastRow = sheet.getLastRow();
    const targetRow = Math.max(lastRow, 5) + 1; // Always start after Row 5

    const name = e.parameter.name || "";
    const email = e.parameter.email || "";
    const subject = e.parameter.subject || "";
    const message = e.parameter.message || "";
    const timestamp = new Date();

    // Write to Columns D, E, F, G, H (Columns 4-8)
    sheet.getRange(targetRow, 4, 1, 5).setValues([[name, email, subject, message, timestamp]]);
    
    console.log("Successfully added row to: " + sheet.getName() + " at row " + targetRow);

    return ContentService
          .createTextOutput(JSON.stringify({ result: 'success', row: targetRow }))
          .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error("Critical Error: " + err.toString());
    return ContentService
          .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
          .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
