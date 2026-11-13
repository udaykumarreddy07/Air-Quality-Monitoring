const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip('hasiniD3.docx');
let xml = zip.readAsText('word/document.xml');

// Let's inspect the TOC table rows around 6.10, 6.11, 7, 8, REFERENCES
const tocIdx = xml.indexOf('TABLE OF CONTENTS');
const tocTblStart = xml.indexOf('<w:tbl>', tocIdx);
const tocTblEnd = xml.indexOf('</w:tbl>', tocTblStart) + 8;
let tocTblXml = xml.substring(tocTblStart, tocTblEnd);

console.log('TOC Table found, length:', tocTblXml.length);

// Update 6.11 page number to 77
tocTblXml = tocTblXml.replace(
  /(6\.11 Stored Telemetry[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$177$2'
);

// Update 7. CONCLUSION page number to 107
tocTblXml = tocTblXml.replace(
  /(CONCLUSION<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1107$2'
);

// Update 8. FUTURE WORK page number to 108
tocTblXml = tocTblXml.replace(
  /(FUTURE WORK<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1108$2'
);

// Update REFERENCES page number to 109
tocTblXml = tocTblXml.replace(
  /(REFERENCES<\/w:t>[\s\S]*?<w:t>)\d+(<\/w:t>)/,
  '$1109$2'
);

xml = xml.substring(0, tocTblStart) + tocTblXml + xml.substring(tocTblEnd);

zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'));
zip.writeZip('hasiniD3.docx');

// Also copy to Air_Quality_Monitoring_Report.docx
fs.copyFileSync('hasiniD3.docx', 'Air_Quality_Monitoring_Report.docx');

console.log('Successfully updated TOC page numbers in hasiniD3.docx and synchronized Air_Quality_Monitoring_Report.docx!');

