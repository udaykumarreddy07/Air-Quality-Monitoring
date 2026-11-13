const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip('hasiniD3.docx');
let xml = zip.readAsText('word/document.xml');

// Locate TOC table
const tbls = [...xml.matchAll(/<w:tbl[\s\S]*?<\/w:tbl>/g)];
const tocTblFull = tbls[2][0];

// Replace duplicate 6.11 row and update all page numbers
let newTocTbl = tocTblFull;

// First remove any duplicate 6.11 row
const row611Pattern = /<w:tr[\s\S]*?6\.11 Stored Telemetry[\s\S]*?<\/w:tr>/g;
const matches = [...newTocTbl.matchAll(row611Pattern)];
if (matches.length > 1) {
  // Remove all but one
  for (let i = 1; i < matches.length; i++) {
    newTocTbl = newTocTbl.replace(matches[i][0], '');
  }
}

// Now replace the single 6.11 row page number to 77
newTocTbl = newTocTbl.replace(
  /(6\.11 Stored Telemetry[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$177$2'
);

// Update CONCLUSION page number to 107
newTocTbl = newTocTbl.replace(
  /(CONCLUSION<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1107$2'
);

// Update FUTURE WORK page number to 108
newTocTbl = newTocTbl.replace(
  /(FUTURE WORK<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1108$2'
);

// Update REFERENCES page number to 109
newTocTbl = newTocTbl.replace(
  /(REFERENCES<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1109$2'
);

xml = xml.replace(tocTblFull, newTocTbl);

zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'));
zip.writeZip('hasiniD3.docx');

// Synchronize with Air_Quality_Monitoring_Report.docx
fs.copyFileSync('hasiniD3.docx', 'Air_Quality_Monitoring_Report.docx');

console.log('Successfully updated TOC rows and page numbers!');

