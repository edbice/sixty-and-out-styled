const SPREADSHEET_ID = '1cEB87S4s-Ot9M7aBk1LRCEHDPZ099a_RsBYnBPLsw3c';
const RSVP_SHEET = 'RSVP';
const WALL_SHEET = 'Wall';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    handleRsvp(data);
    return 
ContentService.createTextOutput(JSON.stringify({result:'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return 
ContentService.createTextOutput(JSON.stringify({result:'error',error:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRsvp(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rsvpSheet = ss.getSheetByName(RSVP_SHEET);
  const wallSheet = ss.getSheetByName(WALL_SHEET);

  const row = [
    new Date(),
    data.name||'',
    data.email||'',
    data.attending||'',
    data.plusOne||'',
    data.kids||'',
    data.stayWillow||'',
    data.nights||'',
    data.dinner10||'',
    data.party11||'',
    data.dinner11||'',
    data.memory||'',
    data.specialRequests||''
  ];
  rsvpSheet.appendRow(row);

  if(data.memory){
    let category = 'Misc';
    if(data.memory.match(/\.(jpg|png|gif)$/i)) category='Photos';
    else if(data.memory.match(/poem/i)) category='Poems';
    else if(data.memory.length>0) category='Stories';
    wallSheet.appendRow([new Date(),data.name,category,data.memory]);
  }
}

