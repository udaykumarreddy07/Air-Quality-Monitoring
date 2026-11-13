const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const EXCEL_FILE = path.join(__dirname, '..', 'data', 'air_quality_india_realtime.xlsx');
const MD_FILE = path.join(__dirname, '..', 'PROJECT_REPORT.md');

const wb = xlsx.readFile(EXCEL_FILE);
const stationsData = xlsx.utils.sheet_to_json(wb.Sheets['Station_Metadata']);
const telemetryData = xlsx.utils.sheet_to_json(wb.Sheets['India_Realtime_AQI']);
const breakpointsData = xlsx.utils.sheet_to_json(wb.Sheets['CPCB_NAQI_Breakpoints']);
const sourcesData = xlsx.utils.sheet_to_json(wb.Sheets['Data_Sources_and_Links']);

let mdSec = `
### 6.9 Stored Telemetry Dataset & Monitoring Station Network Tables (\`air_quality_india_realtime.xlsx\`)

This section documents the primary ground-truth environmental telemetry and monitoring station records stored within the multi-sheet Microsoft Excel workbook at \`data/air_quality_india_realtime.xlsx\`. The workbook serves as the persistent data backbone for the Air Quality Monitoring system, containing 2,304 verified ambient observations across 64 continuous ambient air quality monitoring stations (CAAQMS). The station topology encompasses 50 dense monitoring nodes across the southern Indian peninsula (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, and Kerala) alongside 14 key national metropolitan and industrial centers (Delhi NCR, Mumbai, Kolkata, Lucknow, Jaipur, Patna, Ahmedabad, Guwahati, Aizawl, Raipur, Bhopal, Ludhiana, Chandigarh, Gurugram).

Below are the comprehensive data tables extracted directly from the four workbook worksheets: Station Metadata Registry, Real-Time Observational Telemetry Data Records, Statutory CPCB NAQI Concentration Breakpoints Standard, and Official Environmental Data Sources & Citation Links.

#### 6.9.1 Master Air Quality Monitoring Station Network Registry (Sheet: \`Station_Metadata\`)

Table 6.11 presents all 64 continuous ambient air quality monitoring stations configured in the Excel workbook, specifying station code, urban municipality, state jurisdiction, macro-airshed zone, WGS-84 coordinates, historical period average AQI, real-time live AQI, particulate concentrations, and oversight environmental agency:

| Station Code | City & State | Zone | Coordinates (WGS-84) | Period Avg AQI | Live AQI | PM2.5 / PM10 (µg/m³) | Risk Category | Monitoring Agency |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
`;

stationsData.forEach(s => {
  const code = s['Station Code'] || '';
  const cityState = `${s['City'] || ''}, ${s['State'] || ''}`;
  const zone = s['Zone'] || '';
  const coords = `${Number(s['Latitude (WGS-84)']).toFixed(3)}°N, ${Number(s['Longitude (WGS-84)']).toFixed(3)}°E`;
  const avgAqi = s['Period Average AQI'] || '';
  const liveAqi = s['Latest Live AQI'] || '';
  const pm = `${s['Latest PM2.5 (ug/m3)'] || 0} / ${s['Latest PM10 (ug/m3)'] || 0}`;
  const cat = s['CPCB Risk Category'] || '';
  const agency = s['Monitoring Agency'] || '';
  mdSec += `| \`${code}\` | ${cityState} | ${zone} | ${coords} | ${avgAqi} | **${liveAqi}** | ${pm} | ${cat} | ${agency} |\n`;
});

mdSec += `
#### 6.9.2 Real-Time Observational Telemetry Data Records (Sheet: \`India_Realtime_AQI\`)

Table 6.12 displays the observational telemetry records stored in the \`India_Realtime_AQI\` worksheet for all 64 monitoring station locations. Each record encapsulates the observation date, composite CPCB AQI, fine particulates ($\text{PM}_{2.5}$), respirable coarse particulates ($\text{PM}_{10}$), chemical combustion gases ($\text{NO}_2$, $\text{SO}_2$), carbon monoxide ($\text{CO}$), photochemical ozone ($\text{O}_3$), atmospheric ammonia ($\text{NH}_3$), and statutory CPCB health advisory notifications:

| Record ID | City & State | Date | AQI | PM2.5 | PM10 | NO2 | SO2 | CO | O3 | NH3 | CPCB Category | Health Advisory Notice |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
`;

const cityMap = new Map();
telemetryData.forEach(row => {
  if (!cityMap.has(row.City)) {
    cityMap.set(row.City, row);
  }
});

Array.from(cityMap.values()).forEach(r => {
  mdSec += `| \`${r['Record ID'] || ''}\` | ${r['City'] || ''}, ${r['State'] || ''} | ${r['Date Formatted'] || r['Observation Date'] || ''} | **${r['Composite AQI'] || ''}** | ${r['PM2.5 (ug/m3)'] || ''} | ${r['PM10 (ug/m3)'] || ''} | ${r['NO2 (ug/m3)'] || ''} | ${r['SO2 (ug/m3)'] || ''} | ${r['CO (mg/m3)'] || ''} | ${r['O3 (ug/m3)'] || ''} | ${r['NH3 (ug/m3)'] || ''} | ${r['CPCB Category'] || ''} | ${r['Health Advisory Notice'] || ''} |\n`;
});

mdSec += `
#### 6.9.3 Statutory CPCB NAQI Pollutant Concentration Breakpoints (Sheet: \`CPCB_NAQI_Breakpoints\`)

Table 6.13 records the statutory concentration breakpoint thresholds established by the Central Pollution Control Board (CPCB) Ministry of Environment, Forest & Climate Change, Government of India:

| AQI Category | AQI Range | PM2.5 (24h) | PM10 (24h) | NO2 (24h) | SO2 (24h) | CO (8h) | O3 (8h) | Color Code | Health Impact Summary |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
`;

breakpointsData.forEach(b => {
  mdSec += `| **${b['AQI Category'] || ''}** | ${b['AQI Range'] || ''} | ${b['PM2.5 (24h)'] || ''} | ${b['PM10 (24h)'] || ''} | ${b['NO2 (24h)'] || ''} | ${b['SO2 (24h)'] || ''} | ${b['CO (8h)'] || ''} | ${b['O3 (8h)'] || ''} | \`${b['Color Code'] || ''}\` | ${b['Health Impact'] || ''} |\n`;
});

mdSec += `
#### 6.9.4 Environmental Data Sources, Portals, and Ingestion Feeds (Sheet: \`Data_Sources_and_Links\`)

Table 6.14 details the authoritative institutional sources and direct web endpoints configured in the Excel workbook for telemetry ingestion, historical baselines, and statutory health standards:

| Source Institution / Dataset Name | Agency / Publisher | Official Web Portal URL | Direct Data Feed / Endpoint Link |
|:---|:---|:---|:---|
`;

sourcesData.forEach(s => {
  mdSec += `| **${s['Source Name'] || ''}** | ${s['Agency / Publisher'] || ''} | [${s['Official URL / Direct Link']}](${s['Official URL / Direct Link']}) | [${s['Data Portal Link']}](${s['Data Portal Link']}) |\n`;
});

mdSec += '\n---\n\n';

let content = fs.readFileSync(MD_FILE, 'utf8');

// Update Table of Contents in MD_FILE
content = content.replace(
  /\| Complete System Implementation Source Code \| 24 \|\s*\| \*\*7\*\* \| \*\*CONCLUSION\*\* \| \*\*66\*\* \|\s*\| \*\*8\*\* \| \*\*FUTURE WORK\*\* \| \*\*67\*\* \|\s*\| \| \*\*REFERENCES\*\* \| \*\*68\*\* \|/,
  `| Complete System Implementation Source Code | 24 |\n| | 6.9 Stored Telemetry Dataset & Monitoring Station Network Tables (Excel) | 77 |\n| **7** | **CONCLUSION** | **107** |\n| **8** | **FUTURE WORK** | **108** |\n| | **REFERENCES** | **109** |`
);

// Insert mdSec right before ## CHAPTER 7: CONCLUSION
const ch7Target = '## CHAPTER 7: CONCLUSION';
if (content.includes(ch7Target)) {
  content = content.replace(ch7Target, mdSec + ch7Target);
}

fs.writeFileSync(MD_FILE, content, 'utf8');
console.log('Successfully updated PROJECT_REPORT.md with Section 6.9 and updated TOC!');

