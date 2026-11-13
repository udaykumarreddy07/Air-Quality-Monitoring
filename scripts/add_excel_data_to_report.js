const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const xlsx = require('xlsx');

console.log('Loading Excel workbook and Word document...');

const EXCEL_FILE = path.join(__dirname, '..', 'data', 'air_quality_india_realtime.xlsx');
if (!fs.existsSync(EXCEL_FILE)) {
  console.error('Excel file not found:', EXCEL_FILE);
  process.exit(1);
}

const DOCX_FILE = path.join(__dirname, '..', 'hasiniD3.docx');
if (!fs.existsSync(DOCX_FILE)) {
  console.error('Word document not found:', DOCX_FILE);
  process.exit(1);
}

const wb = xlsx.readFile(EXCEL_FILE);
const stationsData = xlsx.utils.sheet_to_json(wb.Sheets['Station_Metadata']);
const telemetryData = xlsx.utils.sheet_to_json(wb.Sheets['India_Realtime_AQI']);
const breakpointsData = xlsx.utils.sheet_to_json(wb.Sheets['CPCB_NAQI_Breakpoints']);
const sourcesData = xlsx.utils.sheet_to_json(wb.Sheets['Data_Sources_and_Links']);

console.log(`Loaded from Excel: ${stationsData.length} stations, ${telemetryData.length} telemetry records, ${breakpointsData.length} breakpoints, ${sourcesData.length} sources.`);

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeP(text, opts = {}) {
  const jc = opts.jc || 'both';
  const before = opts.before !== undefined ? opts.before : 0;
  const after = opts.after !== undefined ? opts.after : 120;
  const line = opts.line || 360;
  const sz = opts.sz || 24;
  const b = opts.b ? '<w:b/><w:bCs/>' : '';
  const i = opts.i ? '<w:i/><w:iCs/>' : '';
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : '';
  const font = opts.font ? `<w:rFonts w:ascii="${opts.font}" w:hAnsi="${opts.font}"/>` : '';

  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/><w:jc w:val="${jc}"/><w:rPr>${font}${b}${i}${color}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr></w:pPr><w:r><w:rPr>${font}${b}${i}${color}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function makeHeading(title, level = 2) {
  if (level === 2) {
    return `<w:p><w:pPr><w:spacing w:before="260" w:after="120" w:line="360" w:lineRule="auto"/><w:rPr><w:b/><w:bCs/><w:color w:val="0F172A"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="0F172A"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
  } else {
    return `<w:p><w:pPr><w:spacing w:before="180" w:after="80" w:line="360" w:lineRule="auto"/><w:rPr><w:b/><w:bCs/><w:i/><w:color w:val="1E293B"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:i/><w:color w:val="1E293B"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
  }
}

function makeTable(headers, rows, colWidths, fontSize = 20) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  let xml = `<w:tbl><w:tblPr><w:tblW w:w="${totalW}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tblBorders><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>`;
  colWidths.forEach(w => {
    xml += `<w:gridCol w:w="${w}"/>`;
  });
  xml += `</w:tblGrid>`;

  // Header row
  xml += `<w:tr><w:trPr><w:tblHeader/><w:jc w:val="center"/></w:trPr>`;
  headers.forEach((h, i) => {
    const w = colWidths[i] || 2000;
    xml += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:line="260" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/></w:rPr><w:t>${escapeXml(h)}</w:t></w:r></w:p></w:tc>`;
  });
  xml += `</w:tr>`;

  // Data rows
  rows.forEach((r, rIdx) => {
    const bg = rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    xml += `<w:tr><w:trPr><w:jc w:val="center"/></w:trPr>`;
    r.forEach((cell, cIdx) => {
      const w = colWidths[cIdx] || 2000;
      const isFirst = cIdx === 0;
      xml += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${bg}"/><w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:line="260" w:lineRule="auto"/><w:jc w:val="${isFirst ? 'left' : 'center'}"/><w:rPr><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/></w:rPr></w:pPr><w:r><w:rPr>${isFirst ? '<w:b/><w:bCs/>' : ''}<w:color w:val="1E293B"/><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/></w:rPr><w:t xml:space="preserve">${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`;
    });
    xml += `</w:tr>`;
  });

  xml += `</w:tbl><w:p><w:pPr><w:spacing w:before="60" w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:p>`;
  return xml;
}

// Build Section 6.11 XML
let sec611Xml = '';

sec611Xml += makeHeading('6.11 Stored Telemetry Dataset & Monitoring Station Network Tables (data/air_quality_india_realtime.xlsx)', 2);

sec611Xml += makeP('This section documents the primary ground-truth environmental telemetry and monitoring station records stored within the multi-sheet Microsoft Excel workbook at data/air_quality_india_realtime.xlsx. The workbook serves as the persistent data backbone for the Air Quality Monitoring system, containing 2,304 verified ambient observations across 64 continuous ambient air quality monitoring stations (CAAQMS). The station topology encompasses 50 dense monitoring nodes across the southern Indian peninsula (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, and Kerala) alongside 14 key national metropolitan and industrial centers (Delhi NCR, Mumbai, Kolkata, Lucknow, Jaipur, Patna, Ahmedabad, Guwahati, Aizawl, Raipur, Bhopal, Ludhiana, Chandigarh, Gurugram).');

sec611Xml += makeP('Below are the comprehensive data tables extracted directly from the four workbook worksheets: Station Metadata Registry, Real-Time Observational Telemetry Data Records, Statutory CPCB NAQI Concentration Breakpoints Standard, and Official Environmental Data Sources & Citation Links.');

// 6.11.1 Station Metadata
sec611Xml += makeHeading('6.11.1 Master Air Quality Monitoring Station Network Registry (Sheet: Station_Metadata)', 3);
sec611Xml += makeP('Table 6.11 presents all 64 continuous ambient air quality monitoring stations configured in the Excel workbook, specifying station code, urban municipality, state jurisdiction, macro-airshed zone, WGS-84 coordinates, historical period average AQI, real-time live AQI, particulate concentrations, and oversight environmental agency:');

const stationHeaders = [
  'Station Code',
  'City & State',
  'Zone',
  'Coordinates (WGS-84)',
  'Period Avg AQI',
  'Live AQI',
  'PM2.5 / PM10 (µg/m³)',
  'Risk Category',
  'Monitoring Agency'
];

const stationColWidths = [1200, 1600, 1100, 1300, 800, 800, 1100, 900, 1500];

const stationRows = stationsData.map(s => [
  s['Station Code'] || '',
  `${s['City'] || ''}, ${s['State'] || ''}`,
  s['Zone'] || '',
  `${Number(s['Latitude (WGS-84)']).toFixed(3)}°N, ${Number(s['Longitude (WGS-84)']).toFixed(3)}°E`,
  String(s['Period Average AQI'] || ''),
  String(s['Latest Live AQI'] || ''),
  `${s['Latest PM2.5 (ug/m3)'] || 0} / ${s['Latest PM10 (ug/m3)'] || 0}`,
  s['CPCB Risk Category'] || '',
  s['Monitoring Agency'] || ''
]);

sec611Xml += makeTable(stationHeaders, stationRows, stationColWidths, 18);

// 6.11.2 Real-time Telemetry Records
sec611Xml += makeHeading('6.11.2 Real-Time Observational Telemetry Data Records (Sheet: India_Realtime_AQI)', 3);
sec611Xml += makeP('Table 6.12 displays the observational telemetry records stored in the India_Realtime_AQI worksheet for all 64 monitoring station locations. Each record encapsulates the observation date, composite CPCB AQI, fine particulates (PM2.5), respirable coarse particulates (PM10), chemical combustion gases (NO2, SO2), carbon monoxide (CO), photochemical ozone (O3), atmospheric ammonia (NH3), and statutory CPCB health advisory notifications:');

const telemetryHeaders = [
  'Record ID',
  'City & State',
  'Date Formatted',
  'AQI',
  'PM2.5',
  'PM10',
  'NO2',
  'SO2',
  'CO',
  'O3',
  'NH3',
  'CPCB Category',
  'Health Advisory Notice'
];

const telemetryColWidths = [900, 1300, 900, 600, 600, 600, 600, 600, 600, 600, 600, 900, 1900];

// Get latest observation for each unique city from telemetryData
const cityMap = new Map();
telemetryData.forEach(row => {
  if (!cityMap.has(row.City)) {
    cityMap.set(row.City, row);
  }
});

const telemetryRows = Array.from(cityMap.values()).map(r => [
  r['Record ID'] || '',
  `${r['City'] || ''}, ${r['State'] || ''}`,
  r['Date Formatted'] || r['Observation Date'] || '',
  String(r['Composite AQI'] || ''),
  String(r['PM2.5 (ug/m3)'] || ''),
  String(r['PM10 (ug/m3)'] || ''),
  String(r['NO2 (ug/m3)'] || ''),
  String(r['SO2 (ug/m3)'] || ''),
  String(r['CO (mg/m3)'] || ''),
  String(r['O3 (ug/m3)'] || ''),
  String(r['NH3 (ug/m3)'] || ''),
  r['CPCB Category'] || '',
  r['Health Advisory Notice'] || ''
]);

sec611Xml += makeTable(telemetryHeaders, telemetryRows, telemetryColWidths, 17);

// 6.11.3 CPCB NAQI Breakpoints
sec611Xml += makeHeading('6.11.3 Statutory CPCB NAQI Pollutant Concentration Breakpoints (Sheet: CPCB_NAQI_Breakpoints)', 3);
sec611Xml += makeP('Table 6.13 records the statutory concentration breakpoint thresholds established by the Central Pollution Control Board (CPCB) Ministry of Environment, Forest & Climate Change, Government of India. These mathematical breakpoints define the linear interpolation boundaries for computing composite AQI values from raw pollutant sensor feeds:');

const bpHeaders = [
  'AQI Category',
  'AQI Range',
  'PM2.5 (24h)',
  'PM10 (24h)',
  'NO2 (24h)',
  'SO2 (24h)',
  'CO (8h)',
  'O3 (8h)',
  'Color Code',
  'Health Impact Summary'
];

const bpColWidths = [1300, 800, 800, 800, 800, 800, 800, 800, 800, 2600];

const bpRows = breakpointsData.map(b => [
  b['AQI Category'] || '',
  b['AQI Range'] || '',
  b['PM2.5 (24h)'] || '',
  b['PM10 (24h)'] || '',
  b['NO2 (24h)'] || '',
  b['SO2 (24h)'] || '',
  b['CO (8h)'] || '',
  b['O3 (8h)'] || '',
  b['Color Code'] || '',
  b['Health Impact'] || ''
]);

sec611Xml += makeTable(bpHeaders, bpRows, bpColWidths, 18);

// 6.11.4 Data Sources and Links
sec611Xml += makeHeading('6.11.4 Environmental Data Sources, Portals, and Ingestion Feeds (Sheet: Data_Sources_and_Links)', 3);
sec611Xml += makeP('Table 6.14 details the authoritative institutional sources and direct web endpoints configured in the Excel workbook for telemetry ingestion, historical baselines, and statutory health standards:');

const srcHeaders = [
  'Source Institution / Dataset Name',
  'Agency / Publisher',
  'Official Web Portal URL',
  'Direct Data Feed / Endpoint Link'
];

const srcColWidths = [2400, 2400, 2800, 2800];

const srcRows = sourcesData.map(s => [
  s['Source Name'] || '',
  s['Agency / Publisher'] || '',
  s['Official URL / Direct Link'] || '',
  s['Data Portal Link'] || ''
]);

sec611Xml += makeTable(srcHeaders, srcRows, srcColWidths, 18);

console.log('Section 6.11 XML built successfully. Length:', sec611Xml.length);

// Now open hasiniD3.docx
const zip = new AdmZip(DOCX_FILE);
let docXml = zip.readAsText('word/document.xml');

// Locate Chapter 7 heading
const ch7Idx = docXml.indexOf('CHAPTER 7');
if (ch7Idx === -1) {
  console.error('CHAPTER 7 not found in document.xml');
  process.exit(1);
}

// Find the page break right before CHAPTER 7
const pbBeforeCh7 = docXml.lastIndexOf('<w:br w:type="page"/>', ch7Idx);
if (pbBeforeCh7 === -1) {
  console.error('Page break before Chapter 7 not found');
  process.exit(1);
}

// Find the start of the paragraph containing this page break
const pStartBeforeCh7 = docXml.lastIndexOf('<w:p ', pbBeforeCh7);
console.log('Inserting Section 6.11 right before page break paragraph at index:', pStartBeforeCh7);

// Insert Section 6.11 XML
docXml = docXml.substring(0, pStartBeforeCh7) + sec611Xml + docXml.substring(pStartBeforeCh7);

// Now insert Section 6.11 into Table of Contents (Table 2)
// Look for 6.10 row in TOC
const toc610Idx = docXml.indexOf('6.10 Complete System Implementation Source Code');
if (toc610Idx !== -1) {
  const tr610End = docXml.indexOf('</w:tr>', toc610Idx) + 7;
  const newTocRow = `<w:tr w:rsidR="003C01BD" w:rsidRPr="00A22027" w14:paraId="3D8E1A2B" w14:textId="77777777" w:rsidTr="00BD3287"><w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/></w:tcPr><w:p w14:paraId="4D8E2A1C" w14:textId="77777777" w:rsidR="009C7A6F" w:rsidRPr="00A22027" w:rsidRDefault="000F0A9E" w:rsidP="00A22027"><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r w:rsidRPr="00A22027"><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t></w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6400" w:type="dxa"/></w:tcPr><w:p w14:paraId="5E9F3B2D" w14:textId="77777777" w:rsidR="009C7A6F" w:rsidRPr="00A22027" w:rsidRDefault="000F0A9E" w:rsidP="00A22027"><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r w:rsidRPr="00A22027"><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>6.11 Stored Telemetry Dataset &amp; Monitoring Station Network Tables (Excel)</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p w14:paraId="6F0A4C3E" w14:textId="77777777" w:rsidR="009C7A6F" w:rsidRPr="00A22027" w:rsidRDefault="000F0A9E" w:rsidP="00A22027"><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r w:rsidRPr="00A22027"><w:rPr><w:color w:val="0F172A"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>66</w:t></w:r></w:p></w:tc></w:tr>`;
  docXml = docXml.substring(0, tr610End) + newTocRow + docXml.substring(tr610End);
  console.log('Inserted Section 6.11 row into Table of Contents.');
}

zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf8'));
zip.writeZip(DOCX_FILE);
console.log('Successfully saved hasiniD3.docx with Section 6.11!');

